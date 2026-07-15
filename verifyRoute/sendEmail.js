require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
});



module.exports = (otpVerificationCollection) => {
    const router = express.Router();
    router.post("/", async (req, res) => {
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

    return router;
}