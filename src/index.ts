import express from 'express';
import { config } from "./config/config";
import ZoneChecker from "./ZoneChecker";
import EmailService from "./services/EmailService";
import { appHandler } from "./appHandler";
import SchedulerService from "./services/SchedulerService";
import { createHTMLMessageUsingTemplate } from "./utils/createHTMLMessageUsingTemplate";

async function main() {
    const notifier = new EmailService(
        config.emailUser,
        config.emailPassword,
        config.recEmail
    );
    const checker = new ZoneChecker();
    checker.addRectangleZone(
        "Pikutiškės",
        config.zone.topLeft,
        config.zone.bottomRight
    );

    const scheduler = new SchedulerService(config.intervalInHours);
    scheduler.addJob(async () => {
        await appHandler(checker, notifier);
        return;
    });

    const initTitle = "ESO monitoring - Script Started";
    const initMessage = createHTMLMessageUsingTemplate(
        initTitle,
        "Email notification system is now active!",
        "INFO"
    );

    try {
        await notifier.send(initTitle, initMessage);
        console.log("🚀 Email notification system started");
    } catch (error) {
        console.error("Failed to send test notification:", error);
        console.log("Exiting script due to notification failure.");
        return;
    }

    // Event listeners for monitoring
    scheduler.on("cycle:success", (data) => {
        // Log to monitoring system, update metrics, etc.
        console.log(`✅ Cycle ${data.cycleNumber} completed successfully`);
    });

    scheduler.on("cycle:error", (data) => {
        // Send alerts, log to error tracking system, etc.
        console.error(`❌ Cycle ${data.cycleNumber} failed: ${data.error}`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal: any) => {
        console.log(`\n${signal} received. Initiating graceful shutdown...`);
        await scheduler.stop();
        process.exit(0);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    // Uncaught exception handling
    process.on("uncaughtException", (error) => {
        console.error("Uncaught Exception:", error);
        scheduler.stop().then(() => process.exit(1));
    });

    process.on("unhandledRejection", (reason, promise) => {
        console.error("Unhandled Rejection at:", promise, "reason:", reason);
        scheduler.stop().then(() => process.exit(1));
    });

    const app = express();
    
    app.get("/health", (req, res) => {
        res.json(scheduler.getHealthCheck());
    });
    
    app.get("/status", (req, res) => {
        res.json(scheduler.getStatus());
    });
    
    app.listen(3000, () => {
        console.log("Server is up and running.")
        console.log(
            "Health check endpoint available at http://localhost:3000/health"
        );
        console.log(
            "Status check endpoint available at http://localhost:3000/status"
        );
    });
    

    // Start the scheduler
    await scheduler.start();
}

// Error handling for main function
main().catch((error) => {
    console.error("Failed to start scheduler:", error);
    process.exit(1);
});