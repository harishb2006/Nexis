
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDatabase = () => {
    mongoose
        .connect(process.env.DB_URL)
        .then((data) => {
              console.log("Database connected successfully");
        })
        .catch((err) => {
            console.error("Database connection error:", err);
            process.exit(1); 
        });
};

export default connectDatabase;