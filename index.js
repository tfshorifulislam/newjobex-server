const express = require('express')
const app = express()
const dotenv = require('dotenv')
const cors = require('cors')
const nodemailer = require('nodemailer');

dotenv.config()
app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});

app.get('/', (req, res) => {
    res.send('Hello World! Server is running successfully');
});


const port = process.env.PORT || 5000;
// const uri = process.env.MONGODB_CONNECTION;

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
        const companyInfoCollection = database.collection('company_info');
        const otpVerificationCollection = database.collection('otp_verifications');


        app.post("/api/send-email", async (req, res) => {
            try {
                const { email, name } = req.body;

                const otp = Math.floor(
                    100000 + Math.random() * 900000
                ).toString();

                // আগের OTP থাকলে delete করুন
                await otpVerificationCollection.deleteOne({ email });

                // নতুন OTP save করুন
                await otpVerificationCollection.insertOne({
                    email,
                    otp,
                    createdAt: new Date(),
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 মিনিট
                });

                const mailOptions = {
                    from: process.env.EMAIL,
                    to: email,
                    subject: "Verify your NewJobEx account",
                    html: `
                        <h2>Hello ${name},</h2>
        
                        <p>Your verification code is:</p>
        
                        <h1 style="letter-spacing:5px">${otp}</h1>
        
                        <p>This code will expire in 10 minutes.</p>
                    `,
                };

                await transporter.sendMail(mailOptions);

                res.status(200).json({
                    success: true,
                    message: "OTP sent successfully.",
                });

            } catch (error) {
                console.error(error);

                res.status(500).json({
                    success: false,
                    message: "Failed to send OTP.",
                });
            }
        });

        app.post("/api/verify-otp", async (req, res) => {
            try {
                const { email, otp } = req.body;

                const verification = await otpVerificationCollection.findOne({
                    email,
                    otp,
                });

                if (!verification) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid OTP",
                    });
                }

                if (verification.expiresAt < new Date()) {
                    return res.status(400).json({
                        success: false,
                        message: "OTP has expired",
                    });
                }

                // Verify হয়ে গেলে OTP delete করুন
                await otpVerificationCollection.deleteOne({ email });

                res.status(200).json({
                    success: true,
                    message: "OTP verified successfully.",
                });

            } catch (error) {
                console.error(error);

                res.status(500).json({
                    success: false,
                    message: "Something went wrong.",
                });
            }
        });

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});