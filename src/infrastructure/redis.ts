import { createClient } from "redis";
import { envConfig } from "../config/env_config";

const redisClient = createClient({
    url: envConfig.redisUrl
});

export const connectRedis = async () => {
    await redisClient.connect();
};

export const quitRedis = async () => {
    await redisClient.quit();
};

export const setHtmlMetaData = async (url: string, data: string): Promise<void> => {
    await redisClient.set(
        url,
        data,
        {
            EX: envConfig.cacheExpiryInSeconds
        }
    )
}

export const getHtmlMetaData = async (url: string): Promise<string | null> => {
    return redisClient.get(url)
}

