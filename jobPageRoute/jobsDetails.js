const express = require("express");
const { ObjectId } = require("mongodb");
const axios = require("axios");

module.exports = (jobsCollection) => {
    const router = express.Router();

    router.get("/:id", async (req, res) => {
        const { id } = req.params;
        console.log(id)

        const result = await jobsCollection.findOne({_id: id});
        res.send(result);

    });

    return router;
};