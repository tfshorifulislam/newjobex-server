const express = require("express");
const router = express.Router();

module.exports = () => {
    router.get('/', async (req, res) => {
        res.send('Server is running!');
    });
    return router;
}