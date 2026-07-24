const express = require("express");

module.exports = (savedCollection) => {
    const router = express.Router();

    router.get("/", async (req, res) => {
        const { userId } = req.query;

        const savedJobs = await savedCollection
            .find({ userId })
            .toArray();

        res.send({
            success: true,
            data: savedJobs,
        });
    });

    return router;

};