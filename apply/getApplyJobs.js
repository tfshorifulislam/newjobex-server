const express = require("express");

module.exports = (applyCollection) => {
    const router = express.Router();

    router.get("/", async (req, res) => {
        const { email } = req.query;

        const applyJobs = await applyCollection
            .find({ email })
            .toArray();

        res.send({
            success: true,
            data: applyJobs,
        });
    });

    return router;

};