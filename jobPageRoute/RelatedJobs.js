const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = (jobsCollection) => {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const { category, excludeId } = req.query;

      const query = {};

      if (category) {
        query.category = category;
      }

      if (excludeId) {
        query._id = {
          $ne: new ObjectId(excludeId),
        };
      }

      const result = await jobsCollection
        .find(query)
        .limit(5)
        .toArray();

      res.send(result);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Server Error" });
    }
  });

  return router;
};