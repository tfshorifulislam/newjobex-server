const express = require("express");


module.exports = (otpVerificationCollection) => {
    const router = express.Router();

    router.post("/", async (req, res) => {
        try {
            const { email, otp } = req.body;
            console.log("Email:", email);

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

    return router;
}