import app from "./app.js";
import connectDatabase from "./db/Database.js";
import dotenv from "dotenv";

process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err);
    process.exit(1);
});

if (process.env.NODE_ENV !== "PRODUCTION") {
    dotenv.config({
        path: ".env",
    });
}

connectDatabase();

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Rejection:", err);
    server.close(() => {
        process.exit(1); 
    });
});