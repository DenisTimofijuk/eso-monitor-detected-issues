import { Application } from './app';
import { Config } from './config/config';

async function bootstrap() {
    const app = new Application(Config);
    
    // Setup graceful shutdown
    const shutdown = async (signal: string) => {
        console.log(`\n${signal} received. Initiating graceful shutdown...`);
        await app.stop();
        process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Global error handlers
    process.on('uncaughtException', async (error) => {
        console.error('Uncaught Exception:', error);
        await app.stop();
        process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        await app.stop();
        process.exit(1);
    });

    try {
        await app.start();
    } catch (error) {
        console.error('Failed to start application:', error);
        process.exit(1);
    }
}

bootstrap();