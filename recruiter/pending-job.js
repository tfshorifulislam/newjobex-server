const express = require("express");

module.exports = (postsCollection) => {
    const router = express.Router();

    // Get all posts by recruiter email
    router.get("/", async (req, res) => {
        try {
            const { email } = req.query;

            if (!email) {
                return res.status(400).send({
                    success: false,
                    message: "Email is required",
                });
            }

            const posts = await postsCollection
                .find({ recruiterEmail: email })
                .sort({ createdAt: -1 })
                .toArray();

            res.send({
                success: true,
                data: posts,
            });
        } catch (error) {
            console.error(error);

            res.status(500).send({
                success: false,
                message: "Internal Server Error",
            });
        }
    });

    return router;
};