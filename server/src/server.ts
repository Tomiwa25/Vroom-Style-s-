import dotenv from "dotenv";
import app from "./app.js";
import prisma from "./config/database.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log("Vroom Style(s) DB connected successfully");

        app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    });
    } catch (error) {
        console.error("Vroom Style(s) DB connection failed:", error)
        process.exit(1);
    }
};

startServer();


