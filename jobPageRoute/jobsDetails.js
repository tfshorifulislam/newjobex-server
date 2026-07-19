const express = require("express");
const { ObjectId } = require("mongodb");
const axios = require("axios");

module.exports = (jobsCollection) => {
    const router = express.Router();

    router.get("/:id", async (req, res) => {
        try {
            const { id } = req.params;

            // =========================
            // Remotive Job
            // =========================
            if (id.startsWith("remotive-")) {
                const remotiveId = id.replace("remotive-", "");

                const response = await axios.get(
                    "https://remotive.com/api/remote-jobs"
                );

                const job = response.data.jobs.find(
                    (item) => item.id.toString() === remotiveId
                );

                if (!job) {
                    return res.status(404).send({
                        message: "Job not found",
                    });
                }

                return res.send({
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
                    skillsAndExpertise: job.tags || [],
                    source: "remotive",
                });
            }

            // =========================
            // Arbeitnow Job
            // =========================
            if (id.startsWith("arbeitnow-")) {

                const slug = id.replace("arbeitnow-", "");

                const response = await axios.get(
                    "https://www.arbeitnow.com/api/job-board-api"
                );


                const job = response.data.data.find(
                    (item) => item.slug === slug
                );


                if (!job) {
                    return res.status(404).send({
                        message: "Job not found",
                    });
                }


                return res.send({
                    _id: `arbeitnow-${job.slug}`,

                    jobTitle: job.title,

                    companyName: job.company_name || "Unknown Company",

                    companyLogo: "",

                    location: job.location || "Remote",

                    salary: "Not specified",

                    description: job.description || "",

                    jobRequirements: job.tags || [],

                    responsibilities: [],

                    employmentType: "Full-time",

                    workplaceType: job.remote
                        ? "Remote"
                        : "On-site",

                    postedAt: job.created_at
                        ? new Date(job.created_at * 1000)
                        : new Date(),

                    deadline: null,

                    experienceRequired: "Not specified",

                    vacancy: null,

                    applyUrl: job.url,

                    category: job.tags?.[0] || "General",

                    tags: job.tags || [],

                    skillsAndExpertise: job.tags || [],

                    source: "arbeitnow",
                });
            }

            // =========================
            // Local MongoDB Job
            // =========================

            if (!ObjectId.isValid(id)) {
                return res.status(400).send({
                    message: "Invalid Job ID",
                });
            }

            const result = await jobsCollection.findOne({
                _id: new ObjectId(id),
            });

            if (!result) {
                return res.status(404).send({
                    message: "Job not found",
                });
            }

            res.send(result);
        } catch (err) {
            console.log(err);

            res.status(500).send({
                message: "Server Error",
            });
        }
    });

    return router;
};