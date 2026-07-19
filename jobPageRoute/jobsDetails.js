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