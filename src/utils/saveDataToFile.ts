import fs from "fs";
import path from "path";
import type { Mapdata } from "../types/Mapdata.type";
import { Config } from "../config/config";

// Ensure log directory exists
try {
    if (!fs.existsSync(Config.logDir)) {
        fs.mkdirSync(Config.logDir, { recursive: true });
        console.log(`Created log directory: ${Config.logDir}`);
    }
} catch (error: any) {
    if (error.code === "EACCES") {
        console.error(
            `Permission denied creating ${Config.logDir}. Running as root or fix permissions.`
        );
        // Fallback to a writable directory
        Config.logDir = "/tmp/logs";
        fs.mkdirSync("/tmp/logs", { recursive: true });
        console.log("Using /tmp/logs as fallback");
    } else {
        throw error;
    }
}

export default function saveDataToFile(data: Mapdata) {
    const timestamp = new Date().toISOString();
    const logTitle = `Time - ${timestamp}\n`;
    const logContent = JSON.stringify(data);
    const content = logTitle + logContent;
    const fileName = `eso-data-${new Date().toISOString().split("T")[0]}.txt`;
    const logFile = path.join(Config.logDir, fileName);

    fs.writeFile(logFile, content, (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log("Successfully saved to file:", fileName);
        }
    });
}
