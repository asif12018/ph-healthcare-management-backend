import { Server } from "http";
import app from "./app";

import { seedSuperAdmin } from "./app/utils/seed";
import { envVars } from "./config/env";

let server: Server;

const bootstrap = async () => {
    try {
        await seedSuperAdmin();
        server = app.listen(envVars.PORT, () => {
            console.log(`Server is running on http://localhost:${envVars.PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

const shutdown = (signal: string, exitCode: number = 0) => {
    console.log(`${signal} received. Shutting down server...`);
    if (server) {
        server.close(() => {
            console.log("Server closed gracefully.");
            process.exit(exitCode);
        });
    } else {
        process.exit(exitCode);
    }
};

// SIGTERM signal handler
process.on("SIGTERM", () => shutdown("SIGTERM", 0));

// SIGINT signal handler
process.on("SIGINT", () => shutdown("SIGINT", 0));

// Uncaught exception handler
process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception Detected... Shutting down server", error.stack || error);
    shutdown("uncaughtException", 1);
});

// Unhandled rejection handler
process.on("unhandledRejection", (error) => {
    console.error("Unhandled Rejection Detected... Shutting down server", error);
    shutdown("unhandledRejection", 1);
});

bootstrap().catch((err) => {
    console.error("Unhandled bootstrap error:", err);
    process.exit(1);
});