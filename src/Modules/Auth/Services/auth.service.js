import Stripe from "stripe";
import bcrypt from "bcrypt";
import cryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

import UserModel from "../../../DB/models/user.model.js";
import { generateOtpEmail } from "../../../Utils/email-template.js";
import sendEmail  from "../../../Utils/send-email.js";
import { addTokenToBlacklist } from "../../../Utils/token-blacklist.js";

export const register = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        const missingFields = [];
        if (!fullname) missingFields.push("Fullname");
        if (!email) missingFields.push("Email");
        if (!password) missingFields.push("Password");

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `${missingFields.join(", ")} ${
                    missingFields.length > 1 ? "are" : "is"
                } required`,
            });
        }

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists",
            });
        }

        // CREATING A CUSTOMER IN STRIPE FOR SAVING PAYMENT METHOD
        const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
        const customer = await stripe.customers.create({ email });

        // FIXED: Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        await UserModel.create({
            fullname,
            email,
            password: hashedPassword, // FIXED: Use hashed password
            phone: "",
            date_of_birth: "",
            gender: "",
            image: "",
            address: null,
            customer_id: customer.id,
        });

        return res.status(201).json({
            message: "User registered successfully",
        });
    } catch (error) {
        console.error("Register error:", error.message);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: `${!email ? "Email" : ""} ${
                    !password ? "Password" : ""
                } ${!email && !password ? "are" : "is"} required`.trim(),
            });
        }

        const user = await UserModel.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        const token = jwt.sign(
            { id: user._id.toString() }, 
            process.env.JWT_SECRET_LOGIN, 
            {
                jwtid: uuidv4()
            }
        );

        // Convert to JSON and remove password
        const userObj = user.toObject();
        delete userObj.password;

        return res.status(200).json({
            message: "User logged in successfully",
            user: userObj,
            token,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await UserModel.findOne({ email }).select("+password +otp_code +otp_expires_at");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate cryptographically secure 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        const encryptedOTP = cryptoJS.AES.encrypt(
            otp,
            process.env.ENCRYPT_SECRET,
        ).toString();

        user.otp_code = encryptedOTP;
        user.otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        sendEmail.emit("SendEmail", {
            to: email,
            subject: "Reset Password OTP",
            html: generateOtpEmail(otp),
        });

        return res.status(200).json({
            message: "OTP sent successfully",
        });
    } catch (error) {
        console.error("Forget Password Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ 
                message: "Email and OTP are required" 
            });
        }

        const user = await UserModel.findOne({ email }).select("+password +otp_code +otp_expires_at");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if OTP exists
        if (!user.otp_code) {
            return res.status(400).json({ message: "No OTP found. Please request a new one." });
        }

        // Check if OTP has expired
        if (user.otp_expires_at && user.otp_expires_at < new Date()) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        const decryptedOtp = cryptoJS.AES.decrypt(
            user.otp_code,
            process.env.ENCRYPT_SECRET
        ).toString(cryptoJS.enc.Utf8);

        if (otp !== decryptedOtp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        return res.status(200).json({
            message: "OTP verified successfully",
        });
    } catch (error) {
        console.error("Verify OTP Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmNewPassword } = req.body;

        if (!email || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const user = await UserModel.findOne({ email }).select("+password");
        if (!user) {
            return res.status(404).json({ message: "email not found" });
        }

        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res
                .status(400)
                .json({ message: "New password cannot be same as old password" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, +process.env.SALT);

        await UserModel.updateOne(
            { _id: user._id },
            {
                $set: { password: hashedPassword },
            },
        );

        return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = async (req, res) => {
    try {
        // Better error handling for missing authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ 
                message: "No authorization token provided" 
            });
        }

        const token = authHeader.split(" ")[1];
        if (token) {
            addTokenToBlacklist(token);
        }
        
        return res
            .status(200)
            .json({ message: "User logged out successfully" });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};