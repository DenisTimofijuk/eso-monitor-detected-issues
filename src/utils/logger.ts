import fs from "fs";
import path from "path";
import type { Mapdata } from "../types/Mapdata.type";
import { Config } from "../config/config";

type LogLevel = "error" | "warn" | "info" | "debug";
const isProduction = Config.nodeEnv === "prod";

// Ensure log directory exists
const logsDir = Config.logDir;
try {
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true, mode: 0o755 });
        console.log(`Created log directory: ${logsDir}`);
    }
} catch (error: any) {
    if (error.code === "EACCES") {
        console.error(
            `Permission denied creating ${logsDir}. Running as root or fix permissions.`
        );
        // Fallback to a writable directory
        Config.logDir = "/tmp/logs";
        fs.mkdirSync("/tmp/logs", { recursive: true, mode: 0o755 });
        console.log("Using /tmp/logs as fallback");
    } else {
        throw error;
    }
}

export function saveDataToFile(data: Mapdata) {
    const timestamp = new Date();
    const content = JSON.stringify(data);
    const fileName = `eso-data-${timestamp.toISOString().split("T")[0]}_${timestamp.getTime()}.json`;
    const logFile = path.join(logsDir, fileName);

    fs.writeFile(logFile, content, (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log("Successfully saved to file:", fileName);
        }
    });
}

export function saveLog() {
    const writeToFile = (logMessage: string) => {
        const logLine = logMessage + "\n";

        // Generate filename on each call
        const fileName = `app-${new Date().toISOString().split("T")[0]}.log`;
        const logFile = path.join(logsDir, fileName);

        try {
            fs.appendFileSync(logFile, logLine);
            if (!isProduction) {
                console.log(logLine);
            }
        } catch (error: any) {
            console.error("Failed to write to log file:", error.message);
            console.log(logMessage);
        }
    };

    const formatMessage = (level: LogLevel, message: string, meta = {}) => {
        const timestamp = new Date().toISOString();
        const logObject = {
            timestamp,
            level: level.toUpperCase(),
            message,
            ...meta,
        };

        if (isProduction) {
            return JSON.stringify(logObject);
        }

        const metaStr = Object.keys(meta).length
            ? ` ${JSON.stringify(meta)}`
            : "";
        return `${timestamp} [${level.toUpperCase()}] ${message}${metaStr}`;
    };

    const log = (level: LogLevel, message: string, meta = {}) => {
        const formattedMessage = formatMessage(level, message, meta);
        writeToFile(formattedMessage);
    };

    return {
        error: (message: string, meta = {}) => {
            log("error", message, meta);
        },

        warn: (message: string, meta = {}) => {
            log("warn", message, meta);
        },

        info: (message: string, meta = {}) => {
            log("info", message, meta);
        },

        debug: (message: string, meta = {}) => {
            log("debug", message, meta);
        },
    };
}