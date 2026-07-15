const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = (jobsCollection) => {
    const router = express.Router();

    router.get('/:id', async (req, res) => {
        const { id } = req.params;

        const result = await jobsCollection.findOne({
            _id: new ObjectId(id)
        })

        res.send(result);
    })

    return router;
}