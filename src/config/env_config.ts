import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(__dirname, '../../.env') })

export interface EnvConfig {
    redisUrl: string;
    concurrencyNum: number;
    cacheExpiryInSeconds: number;
    rateLimit: number;
    htmlOutputDirectory: string;
    metadataOutputDirectory: string;
    errorLogDirectory: string;
    timeout: number;
}

export const getEnvConfig = (): EnvConfig => ({
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    concurrencyNum: parseInt(process.env.CONCURRENCY_NUM || '10', 10),
    cacheExpiryInSeconds: parseInt(process.env.CACHE_EXPIRY_IN_SECONDS || '36000', 10),
    rateLimit: parseInt(process.env.RATE_LIMIT || '36000', 10),
    htmlOutputDirectory: process.env.HTML_FILE_OUTPUT_DIR || 'resources/saved_html',
    metadataOutputDirectory: process.env.METADATA_OUTPUT_DIR || 'resources/metadata_output',
    errorLogDirectory: process.env.ERROR_LOG_DIR || 'errors',
    timeout: parseInt(process.env.CACHE_EXPIRY_IN_SECONDS || '18000', 10),
});

export const envConfig = getEnvConfig();
