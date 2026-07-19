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
                            search,
                        },
                    }
                );

                formattedExternalJobs = response.data.jobs.map((job) => {

                    const description = job.description || "";

                    // HTML remove
                    const plainText = description.replace(/<[^>]*>/g, "\n");

                    // Requirements extract
                    const requirementsMatch =
                        plainText.match(
                            /(Requirements|Qualifications|Your Qualifications)([\s\S]*?)(Benefits|Why|What We Offer|About|$)/i
                        );

                    const jobRequirements = requirementsMatch
                        ? requirementsMatch[2]
                            .split("\n")
                            .map((item) => item.trim())
                            .filter((item) => item.length > 3)
                        : [];

                    // Responsibilities extract
                    const responsibilitiesMatch =
                        plainText.match(
                            /(Responsibilities|Key Responsibilities|What You'll Do)([\s\S]*?)(Requirements|Qualifications|Benefits|$)/i
                        );

                    const responsibilities = responsibilitiesMatch
                        ? responsibilitiesMatch[2]
                            .split("\n")
                            .map((item) => item.trim())
                            .filter((item) => item.length > 3)
                        : [];

                    return {
                        _id: `remotive-${job.id}`,

                        jobTitle: job.title,

                        companyName: job.company_name,

                        companyLogo: job.company_logo || "",

                        location: job.candidate_required_location,

                        salary: job.salary || "Not specified",

                        description: (job.description || "")
                            .replace(/style="[^"]*"/g, "")
                            .replace(/class="[^"]*"/g, ""),

                        jobRequirements,

                        responsibilities,

                        employmentType: job.job_type,

                        workplaceType: "Remote",

                        postedAt: job.publication_date,

                        deadline: null,

                        experienceRequired: "Not specified",

                        vacancy: null,

                        applyUrl: job.url,

                        category: job.category,

                        tags: job.tags || [],

                        skillsAndExpertise: job.tags || [],

                        source: "remotive",
                    };
                });

                // Location filter
                if (location) {
                    formattedExternalJobs = formattedExternalJobs.filter((job) =>
                        job.location
                            ?.toLowerCase()
                            .includes(location.toLowerCase())
                    );
                }

            } catch (err) {
                console.error("Remotive Error:", err.message);
            }


            // ==========================
            // Arbeitnow Jobs
            // ==========================

            let formattedArbeitnowJobs = [];

            try {
                const response = await axios.get(
                    "https://www.arbeitnow.com/api/job-board-api"
                );

                formattedArbeitnowJobs = response.data.data.map((job) => ({
                    _id: `arbeitnow-${job.slug}`,

                    jobTitle: job.title,

                    companyName: job.company_name,

                    companyLogo: "",

                    location: job.location,

                    salary: "Not specified",

                    description: (job.description || "")
                        .replace(/style="[^"]*"/gi, "")
                        .replace(/class="[^"]*"/gi, ""),

                    jobRequirements: [],

                    responsibilities: [],

                    employmentType: "Full-time",

                    workplaceType: job.remote
                        ? "Remote"
                        : "On-site",

                    postedAt: job.created_at
                        ? new Date(job.created_at * 1000).toISOString()
                        : new Date().toISOString(),

                    deadline: null,

                    experienceRequired: "Not specified",

                    vacancy: null,

                    applyUrl: job.url,

                    category: job.tags?.[0] || "General",

                    tags: job.tags || [],

                    skillsAndExpertise: job.tags || [],

                    source: "arbeitnow",
                }));

                // Search Filter
                if (search) {
                    formattedArbeitnowJobs =
                        formattedArbeitnowJobs.filter((job) =>
                            job.jobTitle
                                .toLowerCase()
                                .includes(search.toLowerCase())
                        );
                }

                // Location Filter
                if (location) {
                    formattedArbeitnowJobs =
                        formattedArbeitnowJobs.filter((job) =>
                            job.location
                                ?.toLowerCase()
                                .includes(location.toLowerCase())
                        );
                }

                // Workplace Type Filter
                if (workplaceType) {
                    formattedArbeitnowJobs =
                        formattedArbeitnowJobs.filter(
                            (job) =>
                                job.workplaceType.toLowerCase() ===
                                workplaceType.toLowerCase()
                        );
                }

                // Employment Type Filter
                if (employmentType) {
                    formattedArbeitnowJobs =
                        formattedArbeitnowJobs.filter(
                            (job) =>
                                job.employmentType.toLowerCase() ===
                                employmentType.toLowerCase()
                        );
                }

                // Posted Within Filter
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

                    formattedArbeitnowJobs =
                        formattedArbeitnowJobs.filter(
                            (job) =>
                                new Date(job.postedAt) >= fromDate
                        );
                }
            } catch (err) {
                console.error("Arbeitnow Error:", err.message);
            }

            // ==========================
            // Merge
            // ==========================

            const jobs = [
                ...formattedLocalJobs,
                ...formattedExternalJobs,
                ...formattedArbeitnowJobs
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