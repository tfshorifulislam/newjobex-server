const express = require("express");

module.exports = (applyCollection) => {
    const router = express.Router();

    router.get("/", async (req, res) => {
        const { userId } = req.query;

        const applyJobs = await applyCollection
            .find({ userId })
            .toArray();

        res.send({
            success: true,
            data: applyJobs,
        });
    });

    return router;

};