import express, { Express } from "express";
import ZoneChecker from "./services/ZoneChecker";
import EmailService from "./services/EmailService";
import SchedulerService from "./services/SchedulerService";
import { appHandler } from "./appHandler";
import { createHTMLMessageUsingTemplate } from "./utils/createHTMLMessageUsingTemplate";
import { Config } from "./config/config";
import { setupEventListeners } from "./eventListeners";
import { AREA } from "./config/area";
import { saveLog } from "./utils/logger";

const logger = saveLog();

export class Application {
    private emailService: EmailService;
    private zoneChecker: ZoneChecker;
    private scheduler: SchedulerService;
    private server: Express;
    private serverInstance: any;

    constructor(private config: typeof Config) {
        this.emailService = new EmailService(
            config.emailUser,
            config.emailPassword,
            config.recEmail
        );
        this.zoneChecker = new ZoneChecker();
        this.scheduler = new SchedulerService(config.intervalInHours);
        this.server = express();

        this.setupServices();
        this.setupServer();
    }

    private setupServices(): void {
        // Configure zone checker
        this.zoneChecker.addRectangleZone(
            "Pikutiškės-rectangle",
            this.config.zone.topLeft,
            this.config.zone.bottomRight
        );

        this.zoneChecker.addPolygonZone(
            "Pikutiškės-poligon",
            AREA.coordinates[0].map((element) => {
                return { lng: element[0], lat: element[1] };
            })
        );

        // Configure scheduler job
        this.scheduler.addJob(async () => {
            await appHandler(this.zoneChecker, this.emailService);
        });

        // Setup event listeners
        setupEventListeners(this.scheduler);
    }

    private setupServer(): void {
        this.server.get("/health", (req, res) => {
            res.json(this.scheduler.getHealthCheck());
        });

        this.server.get("/status", (req, res) => {
            res.json(this.scheduler.getStatus());
        });
        this.server.get("/config", (req, res) => {
            res.json(this.config);
        });
    }

    async start(): Promise<void> {
        try {
            // Send startup notification
            await this.sendStartupNotification();

            // Start HTTP server
            this.serverInstance = this.server.listen(3000, () => {
                [
                    "🚀 Server is up and running on port 3000",
                    "Health check: http://localhost:3000/health",
                    "Status check: http://localhost:3000/status",
                    "Config check: http://localhost:3000/config",
                ].forEach((message) => {
                    logger.info(message);
                });
            });

            // Start scheduler
            await this.scheduler.start();
            logger.info("📅 Scheduler started successfully");
        } catch (error:any) {
            logger.error("Failed to start application:", error);
            throw error;
        }
    }

    async stop(): Promise<void> {
        logger.info("🛑 Stopping application...");

        // Stop scheduler
        if (this.scheduler) {
            await this.scheduler.stop();
            logger.info("📅 Scheduler stopped");
        }

        // Stop HTTP server
        if (this.serverInstance) {
            this.serverInstance.close();
            logger.info("🔌 HTTP server stopped");
        }
    }

    private async sendStartupNotification(): Promise<void> {
        const title = "ESO monitoring - Script Started";
        const message = createHTMLMessageUsingTemplate(
            title,
            "Email notification system is now active!",
            "INFO"
        );

        try {
            await this.emailService.send(title, message);
            logger.info("📧 Startup notification sent successfully");
        } catch (error:any) {
            logger.error("Failed to send startup notification:", error);
            throw new Error(
                "Notification system is not working. Aborting startup."
            );
        }
    }
}
