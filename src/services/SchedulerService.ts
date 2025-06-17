import EventEmitter from "events";

export default class SchedulerService extends EventEmitter {
    isRunning: boolean;
    timer: NodeJS.Timeout | null;
    cycleCount: number;
    lastRunTime: Date | null;
    errors: {
        cycleNumber: number;
        timestamp: Date;
        error: any;
        stack: any;
    }[];
    startTime: Date | null;
    jobs: (() => void | Promise<void>)[];

    constructor(
        private schedulerInterval: number
    ) {
        super();
        this.isRunning = false;
        this.timer = null;
        this.cycleCount = 0;
        this.lastRunTime = null;
        this.errors = [];
        this.startTime = null;
        this.jobs = [];
    }

    addJob(job: () => void | Promise<void>) {
        this.jobs.push(job);
    }

    start() {
        if (this.isRunning) {
            console.log("Scheduler is already running");
            return;
        }

        this.isRunning = true;
        console.log(
            `Starting website monitoring every ${this.schedulerInterval} hour(s)`
        );

        this.startTime = new Date();

        // Run immediately, then schedule next runs
        this.runCycle();
        this.scheduleNext();
    }

    async runCycle() {
        const startTime = new Date();
        this.cycleCount++;

        try {
            console.log(
                `${startTime.toLocaleString()} - Cycle #${
                    this.cycleCount
                }: Initiating handler...`
            );

            if(this.jobs.length === 0){
                throw({
                    message: "No jobs found to execute."
                });
            }

            for(let job of this.jobs){
                await job();
            }

            const endTime = new Date();
            const duration = endTime.getTime() - startTime.getTime();
            this.lastRunTime = endTime;

            console.log(
                `${endTime.toLocaleString()} - Cycle #${
                    this.cycleCount
                }: Handler finished in ${duration}ms. Next run in ${
                    this.schedulerInterval
                } hour(s).`
            );

            this.emit("cycle:success", {
                cycleNumber: this.cycleCount,
                startTime,
                endTime,
                duration,
            });
        } catch (error: any) {
            const errorInfo = {
                cycleNumber: this.cycleCount,
                timestamp: new Date(),
                error: error.message,
                stack: error.stack,
            };

            this.errors.push(errorInfo);
            // Keep only last 10 errors
            if (this.errors.length > 10) {
                this.errors = this.errors.slice(-10);
            }

            console.error(
                `${new Date().toLocaleString()} - Cycle #${
                    this.cycleCount
                }: Handler failed:`,
                error.message
            );

            this.emit("cycle:error", errorInfo);

            // Continue scheduling next cycle even after error
        }
    }

    scheduleNext() {
        if (!this.isRunning) return;

        this.timer = setTimeout(async () => {
            if (this.isRunning) {
                await this.runCycle();
                this.scheduleNext();
            }
        }, this.schedulerInterval * 60 * 60 * 1000);
    }

    async stop() {
        if (!this.isRunning) {
            console.log("Scheduler is not running");
            return;
        }

        console.log("Stopping scheduler...");
        this.isRunning = false;

        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        this.emit("stopped");
        console.log("Scheduler stopped gracefully");
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            cycleCount: this.cycleCount,
            lastRunTime: this.lastRunTime,
            intervalHours: this.schedulerInterval,
            recentErrors: this.errors.slice(-5), // Last 5 errors
        };
    }

    // Health check endpoint data
    getHealthCheck() {
        const now = new Date();
        const expectedNextRun = this.lastRunTime
            ? new Date(
                  this.lastRunTime.getTime() +
                      this.schedulerInterval * 60 * 60 * 1000
              )
            : null;

        return {
            status: this.isRunning ? "running" : "stopped",
            uptime: this.isRunning
                ? now.getTime() - this.startTime!.getTime()
                : 0,
            cycleCount: this.cycleCount,
            lastRunTime: this.lastRunTime,
            expectedNextRun,
            recentErrorCount: this.errors.length,
        };
    }
}
