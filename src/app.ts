import express, { Express } from 'express';
import ZoneChecker from './ZoneChecker';
import EmailService from './services/EmailService';
import SchedulerService from './services/SchedulerService';
import { appHandler } from './appHandler';
import { createHTMLMessageUsingTemplate } from './utils/createHTMLMessageUsingTemplate';
import { Config } from './config/config';
import { setupEventListeners } from './eventListeners';

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
            'Pikutiškės',
            this.config.zone.topLeft,
            this.config.zone.bottomRight
        );

        // Configure scheduler job
        this.scheduler.addJob(async () => {
            await appHandler(this.zoneChecker, this.emailService);
        });

        // Setup event listeners
        setupEventListeners(this.scheduler);
    }

    private setupServer(): void {
        this.server.get('/health', (req, res) => {
            res.json(this.scheduler.getHealthCheck());
        });

        this.server.get('/status', (req, res) => {
            res.json(this.scheduler.getStatus());
        });
    }

    async start(): Promise<void> {
        try {
            // Send startup notification
            await this.sendStartupNotification();
            
            // Start HTTP server
            this.serverInstance = this.server.listen(3000, () => {
                console.log('🚀 Server is up and running on port 3000');
                console.log('Health check: http://localhost:3000/health');
                console.log('Status check: http://localhost:3000/status');
            });

            // Start scheduler
            await this.scheduler.start();
            console.log('📅 Scheduler started successfully');
            
        } catch (error) {
            console.error('Failed to start application:', error);
            throw error;
        }
    }

    async stop(): Promise<void> {
        console.log('🛑 Stopping application...');
        
        // Stop scheduler
        if (this.scheduler) {
            await this.scheduler.stop();
            console.log('📅 Scheduler stopped');
        }

        // Stop HTTP server
        if (this.serverInstance) {
            this.serverInstance.close();
            console.log('🔌 HTTP server stopped');
        }
    }

    private async sendStartupNotification(): Promise<void> {
        const title = 'ESO monitoring - Script Started';
        const message = createHTMLMessageUsingTemplate(
            title,
            'Email notification system is now active!',
            'INFO'
        );

        try {
            await this.emailService.send(title, message);
            console.log('📧 Startup notification sent successfully');
        } catch (error) {
            console.error('Failed to send startup notification:', error);
            throw new Error('Notification system is not working. Aborting startup.');
        }
    }
}