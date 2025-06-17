import type { EnvVars } from "../types/Env.type";

// Implementation
export function getEnvVar(name: keyof EnvVars, defaultValue?: string) {
    const value = process.env[name] || defaultValue;
    if (value === undefined) {
        throw new Error(`Environment variable ${name} is required`);
    }
    return value;
}
