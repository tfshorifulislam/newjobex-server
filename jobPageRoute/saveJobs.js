const express = require("express");

module.exports = (savedCollection) => {

    const router = express.Router();


    // Save Job
    router.post("/", async (req, res) => {

        try {

            const { userId, jobId } = req.body;


            if (!userId || !jobId) {
                return res.status(400).send({
                    success: false,
                    message: "Missing data"
                });
            }



            const alreadySaved =
                await savedCollection.findOne({
                    userId,
                    jobId
                });



            if (alreadySaved) {

                return res.send({
                    success: false,
                    message: "Already Saved"
                });

            }



            const result =
                await savedCollection.insertOne({

                    userId,

                    jobId,

                    createdAt: new Date()

                });



            res.send({

                success: true,

                insertedId: result.insertedId

            });



        } catch (err) {

            res.status(500).send({

                success: false,

                message: err.message

            });

        }

    });


    // Check Saved
    router.get("/check", async (req, res) => {

        try {


            const {
                userId,
                jobId
            } = req.query;



            const savedJob =
                await savedCollection.findOne({

                    userId,

                    jobId

                });



            res.send({

                success: true,

                saved: !!savedJob

            });


        } catch (err) {

            res.status(500).send({

                success: false,

                message: err.message

            });

        }

    });


    // Delete Saved Job
    router.delete("/", async (req, res) => {


        try {


            const {
                userId,
                jobId
            } = req.body;



            const result =
                await savedCollection.deleteOne({

                    userId,

                    jobId

                });



            if (result.deletedCount === 0) {

                return res.status(404).send({

                    success: false,

                    message: "Saved job not found"

                });

            }



            res.send({

                success: true,

                message: "Job removed successfully"

            });



        } catch (err) {

            res.status(500).send({

                success: false,

                message: err.message

            });

        }

    });



    return router;

};