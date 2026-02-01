import Stripe from "stripe";
import bcrypt, { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import UserModel from "../../../DB/models/user.model.js";
import { generateOtpEmail } from "../../../Utils/email-template.js";
import { sendEmail } from "../../../Utils/send-email.js";
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

        // IMPROVED: Better validation message
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

        // FIXED: Now uuidv4 is properly imported
        const token = jwt.sign(
            { id: user._id.toString() }, 
            process.env.JWT_SECRET_LOGIN, 
            {
                expiresIn: "1h",
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
        // IMPROVED: More detailed error logging
        console.error("Login error:", error);
        console.error("Error stack:", error.stack);
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

        const OTP = Math.floor(100000 + Math.random() * 900000).toString();
        const hashOTP = hashSync(OTP, 10);
        const otpExpiration = new Date(Date.now() + 10 * 60 * 1000);

        user.otp_code = hashOTP;
        user.otp_expires_at = otpExpiration;
        await user.save();

        sendEmail.emit("SendEmail", {
            to: email,
            subject: "Reset Password OTP",
            html: generateOtpEmail(OTP),
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

        // ADDED: Check if OTP exists
        if (!user.otp_code) {
            return res.status(400).json({ message: "No OTP found. Please request a new one." });
        }

        // ADDED: Check if OTP has expired
        if (user.otp_expires_at && user.otp_expires_at < new Date()) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        const isOtpValid = compareSync(otp, user.otp_code);
        if (!isOtpValid) {
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
        const { email, otp, newPassword, confirmPassword } = req.body;

        if (!email || !otp || !newPassword || !confirmPassword) {
            return res.status(400).json({ 
                message: "All fields are required" 
            });
        }

        const user = await UserModel.findOne({
            email,
            otp_expires_at: { $gt: new Date() },
        }).select("+password +otp_code +otp_expires_at");

        if (!user) {
            return res.status(404).json({ message: "Invalid or expired OTP" });
        }

        const isOtpValid = compareSync(otp, user.otp_code);
        if (!isOtpValid) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // FIXED: Hash new password before saving
        user.password = await bcrypt.hash(newPassword, 10);
        user.otp_code = null;
        user.otp_expires_at = null;
        await user.save();

        return res.status(200).json({
            message: "Password reset successfully",
        });
    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = async (req, res) => {
    try {
        // ADDED: Better error handling for missing authorization header
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