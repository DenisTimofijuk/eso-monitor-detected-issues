import { Application } from './app';
import { Config } from './config/config';
import { saveLog } from './utils/logger';

const logger = saveLog();

async function bootstrap() {
    const app = new Application(Config);
    
    // Setup graceful shutdown
    const shutdown = async (signal: string) => {
        logger.info(`\n${signal} received. Initiating graceful shutdown...`);
        await app.stop();
        process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Global error handlers
    process.on('uncaughtException', async (error) => {
        logger.error('Uncaught Exception:', error);
        await app.stop();
        process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
        logger.error('Unhandled Rejection at:', [promise, 'reason:', reason]);
        await app.stop();
        process.exit(1);
    });

    try {
        await app.start();
    } catch (error) {
        logger.error('Failed to start application:');
        process.exit(1);
    }
}

bootstrap();