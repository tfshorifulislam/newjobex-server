const express = require('express')
const app = express()
const dotenv = require('dotenv')
const cors = require('cors')

dotenv.config()
app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.get('/', (req, res) => {
    res.send('Hello World! Server is running successfully');
});


const port = process.env.PORT || 5000;
// const uri = process.env.MONGODB_CONNECTION;



async function run() {
    try {
        await client.connect();

        const database = client.db("newjobex");
        const companyInfoCollection = database.collection('company_info');

    


    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});