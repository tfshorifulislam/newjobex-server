const express = require("express");
const axios = require("axios");

module.exports = (jobsCollection) => {
    const router = express.Router();

    router.get("/", async (req, res) => {
        try {
            const search = req.query.search || "";
            const location = req.query.location || "";
            const workplaceType = req.query.workplaceType || "";
            const employmentType = req.query.employmentType || "";
            const postedWithin = req.query.postedWithin || "";

            const query = {};

            if (search) {
                query.jobTitle = {
                    $regex: search,
                    $options: "i",
                };
            }

            if (location) {
                query.location = {
                    $regex: location,
                    $options: "i",
                };
            }

            if (workplaceType) {
                query.workplaceType = workplaceType;
            }

            if (employmentType) {
                query.employmentType = employmentType;
            }

            if (postedWithin && postedWithin !== "All") {
                const now = new Date();
                const fromDate = new Date();

                if (postedWithin === "Last Week") {
                    fromDate.setDate(now.getDate() - 7);
                } else if (postedWithin === "Last 3 Months") {
                    fromDate.setMonth(now.getMonth() - 3);
                } else if (postedWithin === "This Year") {
                    fromDate.setFullYear(now.getFullYear() - 1);
                }

                query.postedAt = {
                    $gte: fromDate.toISOString(),
                };
            }

            // ==========================
            // Local Jobs
            // ==========================

            const localJobs = await jobsCollection.find(query).toArray();

            const formattedLocalJobs = localJobs.map((job) => ({
                ...job,
                source: "newjobex",
            }));

            // ==========================
            // Remotive Jobs
            // ==========================

            let formattedExternalJobs = [];

            try {
                const response = await axios.get(
                    "https://remotive.com/api/remote-jobs",
                    {
                        params: {
                            search: search,
                        },
                    }
                );

                formattedExternalJobs = response.data.jobs.map((job) => ({
                    _id: `remotive-${job.id}`,
                    jobTitle: job.title,
                    companyName: job.company_name,
                    companyLogo: job.company_logo || "",
                    location: job.candidate_required_location,
                    salary: job.salary || "",
                    description: job.description,
                    employmentType: job.job_type,
                    workplaceType: "Remote",
                    postedAt: job.publication_date,
                    applyUrl: job.url,
                    category: job.category,
                    tags: job.tags,
                    skillsAndExpertise: job.tags || [],
                    source: "remotive",
                }));

                // যদি location filter থাকে
                if (location) {
                    formattedExternalJobs = formattedExternalJobs.filter((job) =>
                        job.location
                            .toLowerCase()
                            .includes(location.toLowerCase())
                    );
                }
            } catch (err) {
                console.log("Remotive Error:", err.message);
            }

            // ==========================
            // Merge
            // ==========================

            const jobs = [
                ...formattedLocalJobs,
                ...formattedExternalJobs,
            ];

            jobs.sort(
                (a, b) =>
                    new Date(b.postedAt).getTime() -
                    new Date(a.postedAt).getTime()
            );

            res.send(jobs);
        } catch (error) {
            console.log(error);
            res.status(500).send({
                message: "Failed to fetch jobs",
            });
        }
    });

    return router;
};