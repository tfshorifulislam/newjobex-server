const express = require("express");

module.exports = (savedCollection) => {
    const router = express.Router();

    router.get("/", async (req, res) => {
        try {
            const { userId } = req.query;

            if (!userId) {
                return res.status(400).send({
                    success: false,
                    message: "User ID is required",
                });
            }

            const savedJobs = await savedCollection.aggregate([
                {
                    $match: {
                        userId,
                    },
                },
                {
                    $lookup: {
                        from: "jobs", // jobsCollection এর collection name
                        localField: "jobId",
                        foreignField: "jobId",
                        as: "job",
                    },
                },
                {
                    $unwind: "$job",
                },
                {
                    $replaceRoot: {
                        newRoot: {
                            $mergeObjects: [
                                "$job",
                                {
                                    savedAt: "$createdAt",
                                    savedId: "$_id",
                                },
                            ],
                        },
                    },
                },
                {
                    $sort: {
                        savedAt: -1,
                    },
                },
            ]).toArray();

            res.send({
                success: true,
                data: savedJobs,
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