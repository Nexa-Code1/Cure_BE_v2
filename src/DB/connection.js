import mongoose from "mongoose";

const connection = async () => {
    try {
        await mongoose.connect(process.env.DATABASE, {
            connectTimeoutMS: 30000, 
            socketTimeoutMS: 30000, 
        });
        console.log("Connected to database");
    } catch (error) {
        console.log("Database connection failed", error);
    }
};

export default connection;
