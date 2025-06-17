import dotenv from "dotenv";
import { EnvVars } from "../types/Env.type";
import { getEnvVar } from "../utils/getEnvVar";

dotenv.config();

const requiredEnvVariables: (keyof EnvVars)[] = [
    "REC_EMAIL",
    "EMAIL_SERVICE",
    "EMAIL_AUTH_USER",
    "EMAIL_AUTH_PASS",
    "PORT",
    "ESO_URL",
    "TOP_LEFT_LAT",
    "TOP_LEFT_LNG",
    "BOTTOM_RIGHT_LAT",
    "BOTTOM_RIGHT_LNG",
    "LOG_DIR",
];

const missingVariables = requiredEnvVariables.filter(
    (variable) => !process.env[variable]
);
if (missingVariables.length > 0) {
    console.error(
        "Missing environment variables:",
        missingVariables.join(", ")
    );
    process.exit(1); // Exit with non-zero code indicating failure
} else {
    console.log("All environment variables are defined properly.");
}

const env: EnvVars = {
    REC_EMAIL: getEnvVar("REC_EMAIL", "REC_EMAIL"),
    EMAIL_SERVICE: getEnvVar("EMAIL_SERVICE", "EMAIL_SERVICE"),
    EMAIL_AUTH_USER: getEnvVar("EMAIL_AUTH_USER", "EMAIL_AUTH_USER"),
    EMAIL_AUTH_PASS: getEnvVar("EMAIL_AUTH_PASS", "EMAIL_AUTH_PASS"),
    PORT: getEnvVar("PORT", "3000"),
    ESO_URL: getEnvVar("ESO_URL", "ESO_URL"),
    TOP_LEFT_LAT: getEnvVar("TOP_LEFT_LAT", "54.80689960730842"),
    TOP_LEFT_LNG: getEnvVar("TOP_LEFT_LNG", "25.102873703280622"),
    BOTTOM_RIGHT_LAT: getEnvVar("BOTTOM_RIGHT_LAT", "54.767800118842906"),
    BOTTOM_RIGHT_LNG: getEnvVar("BOTTOM_RIGHT_LNG", "25.161858516471884"),
    LOG_DIR: getEnvVar("LOG_DIR", "LOG_DIR"),
    INTERVAL_H: getEnvVar("INTERVAL_H", "1")
};

export const config = {
    eso_api_url: env.ESO_URL,
    zone: {
        topLeft: {
            lat: Number(env.TOP_LEFT_LAT),
            lng: Number(env.TOP_LEFT_LNG)
        },
        bottomRight: {
            lat: Number(env.BOTTOM_RIGHT_LAT),
            lng: Number(env.BOTTOM_RIGHT_LNG),
        },
    },
    logDir: env.LOG_DIR,
    recEmail: env.REC_EMAIL,
    emailService: env.EMAIL_SERVICE,
    emailUser: env.EMAIL_AUTH_USER,
    emailPassword: env.EMAIL_AUTH_PASS,
    intervalInHours: Number(env.INTERVAL_H)
};
