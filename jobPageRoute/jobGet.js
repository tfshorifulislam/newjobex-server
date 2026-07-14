const express = require("express");

module.exports = (jobsCollection) => {
    const router = express.Router();

    router.get('/', async (req, res) => {

        const search = req.query.search || "";
        const location = req.query.location || "";

        const query = {};

        if (search) {
            query.title = {
                $regex: search,
                $options: 'i'
            }
        }

        if (location) {
            query.location = {
                $regex: location,
                $options: 'i'
            }
        }

        const cursor = await jobsCollection.find(query);
        const result = await cursor.toArray();

        res.send(result);
    })

    return router;
}