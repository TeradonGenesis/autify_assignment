import axios from "axios";
import fs from 'fs/promises';
import { ResponseData } from "../domain/responsedata";
import path from 'path';
import { envConfig } from "../config/env_config";

export const retrieveHtmlData = async (url: string): Promise<ResponseData> => {
    const timeout = envConfig.timeout * 1000
    const resp = await axios.get(url, { timeout: timeout });
    return {
        data: resp.data as string,
        status: resp.status as number,
        statusText: resp.statusText
    }
}

export const readHtmlFile = async (filepath: string): Promise<string> => {
    return fs.readFile(filepath, 'utf-8');
}

export const saveHtmlFile = async (filepath: string, content: string): Promise<void> => {
    const exist: boolean = await checkFolderExist(envConfig.htmlOutputDirectory);
    if (!exist) {
        await createDirectory(envConfig.htmlOutputDirectory);
    }
    await fs.writeFile(filepath, content);
}

export const saveMetadataJson = async (filepath: string, data: any): Promise<void> => {
    const exist: boolean = await checkFolderExist(envConfig.metadataOutputDirectory);
    if (!exist) {
        await createDirectory(envConfig.metadataOutputDirectory);
    }
    await fs.writeFile(filepath, JSON.stringify(data));
}

export const createHtmlFilePath = (url: string): string => {
    let filepath: string = "";
    const urlData = new URL(url);
    const sanitizeUrl = urlData.pathname.trim().replace(/\//g, '');
    filepath = path.join(envConfig.htmlOutputDirectory, `${urlData.hostname}${sanitizeUrl}.html`);
    return filepath;
}

const createDirectory = async (dirPath: string): Promise<void> => {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
        console.error('Error creating directory:', error);
    }
};

export const readHTMLDirectory = async () => {
    return await fs.readdir(envConfig.htmlOutputDirectory);
}

const checkFolderExist = async (relativePath: string): Promise<boolean> => {
    const absolutePath = path.resolve(relativePath);
    try {
        const stats = await fs.stat(absolutePath);
        return stats.isDirectory();
    } catch (error) {
        return false;
    }
}