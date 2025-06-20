import SchedulerService from "./services/SchedulerService";
import { saveLog } from "./utils/logger";

const logger = saveLog();

export function setupEventListeners(scheduler: SchedulerService): void {
    scheduler.on("cycle:success", (data) => {
        logger.info(`✅ Cycle ${data.cycleNumber} completed successfully`)
    });

    scheduler.on("cycle:error", (data) => {
        logger.error(`❌ Cycle ${data.cycleNumber} failed: ${data.error}`)
    });
}
