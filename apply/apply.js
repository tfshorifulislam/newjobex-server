const express = require("express");

module.exports = (applyCollection) => {
    const router = express.Router();

    router.post('/', async (req, res) => {
        const {  job, ...applicationData } =  req.body;
        const result = await applyCollection.insertOne({
             job, ...applicationData
        })
        res.send(result)
    })

    return router;
}