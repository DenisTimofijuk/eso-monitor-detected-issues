import SchedulerService from "./services/SchedulerService";

export function setupEventListeners(scheduler: SchedulerService): void {
    scheduler.on("cycle:success", (data) => {
        console.log(`✅ Cycle ${data.cycleNumber} completed successfully`);
        // Add monitoring/metrics logging here
    });

    scheduler.on("cycle:error", (data) => {
        console.error(`❌ Cycle ${data.cycleNumber} failed: ${data.error}`);
        // Add error tracking/alerting here
    });
}
