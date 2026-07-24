const express = require("express");

module.exports = (savedCollection, jobsCollection) => {
    const router = express.Router();

    // get user saved job
    router.get("/savedJobs", async (req, res) => {
        try {
            const { userId } = req.query;
    
            const saved = await savedCollection
                .find({ userId })
                .sort({ createdAt: -1 })
                .toArray();
    
            const jobIds = saved.map((item) => item.jobId);
    
            const jobs = await jobsCollection
                .find({
                    _id: { $in: jobIds },
                })
                .toArray();
    
            res.send({
                success: true,
                data: jobs,
            });
        } catch (err) {
            res.status(500).send({
                success: false,
                message: err.message,
            });
        }
    });

    return router;
};