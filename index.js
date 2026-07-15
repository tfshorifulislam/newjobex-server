const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');


const verificationRoute = require('./verifyRoute/sendEmail');
const getOtp = require('./verifyRoute/getOtp');
const homeRoute = require('./homeRoute/home');
const getJobs = require('./jobPageRoute/jobGet');
const getJobsById = require('./jobPageRoute/jobsDetails');
const getRelatedJobs = require('/jobPageRoute/RelatedJobs')

dotenv.config()
app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;

const client = new MongoClient(process.env.MONGODB_CONNECTION, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        await client.connect();

        const database = client.db("newjobex");
        const otpVerificationCollection = database.collection('otp_verifications');
        const jobsCollection = database.collection('jobs')

        //home route
        app.use('/', homeRoute())

        //send email for get otp code
        app.use("/api/send-email", verificationRoute(otpVerificationCollection))

        //get otp for verification user
        app.use("/api/verify-otp", getOtp(otpVerificationCollection))

        //get all jobs
        app.use('/api/jobs', getJobs(jobsCollection))

        //get job by id
        app.use('/api/jobs', getJobsById(jobsCollection))

        //get related job
        app.use('/api/related-jobs', getRelatedJobs(jobsCollection))

    } finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});