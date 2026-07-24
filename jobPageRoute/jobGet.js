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
            // Merge
            // ==========================

            const jobs = [
                ...formattedLocalJobs,
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