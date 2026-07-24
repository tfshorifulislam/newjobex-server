const express = require("express");

module.exports = (jobsCollection) => {
    const router = express.Router();

    router.post('/', async (req, res) => {
        const payload = req.body;
        const result = await jobsCollection.insertOne(payload);
        res.send(result)
    })

    return router;
}