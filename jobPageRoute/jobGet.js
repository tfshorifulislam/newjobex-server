const express = require("express");

module.exports = (jobsCollection) => {
    const router = express.Router();

    router.get('/', async (req, res) => {

        const search = req.query.search || "";
        const location = req.query.location || "";
        const workplaceType = req.query.workplaceType || "";
        const jobType = req.query.jobType || "";
        const postedWithin = req.query.postedWithin || ""; 

        console.log("search:", search);
        console.log("location:", location);

        const query = {};

        if (search) {
            query.jobTitle = {
                $regex: search,
                $options: "i",
            };
        }

        if (location) {
            query.location = {
                $regex: location,
                $options: "i",
            };
        }

        if (workplaceType) {
            query.workplaceType = workplaceType;
        }

        if (jobType) {
            query.jobType = jobType;
        }

        if (postedWithin && postedWithin !== "All") {
            query.postedWithin = postedWithin;
        }

        console.log(query);

        const cursor = await jobsCollection.find(query);
        console.log(cursor);
        const result = await cursor.toArray();
        console.log(result);

        res.send(result);
    })

    return router;
}