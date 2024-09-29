import { extractHtmlMetadata, Metadata } from "../domain/metadata";
import { Result } from "../domain/results";
import { retrieveHtmlData, createHtmlFilePath, saveHtmlFile, readHtmlFile } from "../infrastructure/document"
import { ResponseData } from "../domain/responsedata";
import { HttpStatusCode } from "axios";
import { getHtmlMetaData, setHtmlMetaData } from "../infrastructure/redis"
import { queue } from 'async';
import { envConfig } from "../config/env_config";
import { fixUrl, isValidUrl } from "../helpers/url";

export const dataExtractor = (metadataMode: boolean, cacheMode: boolean) => {
    const extractDataFromUrl = async (url: string): Promise<Result> => {
        try {
            //do validation here, return immediately if not valid
            url = fixUrl(url)
            const validUrl: boolean = isValidUrl(url);
            if (!validUrl) {
                return {
                    url: url,
                    invalid: true,
                    last_fetched: new Date().toUTCString()
                }
            }
            //if cache mode enabled, get from cache, if cache miss, proceed to get from latest data
            if (cacheMode) {
                const cachedHtmlData = await getHtmlMetaData(url);
                if (cachedHtmlData) {
                    const result: Result = JSON.parse(cachedHtmlData);
                    return result;
                }
            }

            const { data, status, statusText }: ResponseData = await retrieveHtmlData(url);

            const htmlFilepath: string = createHtmlFilePath(url);
            await saveHtmlFile(htmlFilepath, data);
            if (metadataMode) {
                const metadata: Metadata = await extractHtmlMetadata(url, data);
                const result: Result = {
                    url: url,
                    htmlFile: htmlFilepath,
                    metadata: metadata ? metadata : {
                        url: url,
                        title: "",
                        description: "",
                        numOfLinks: 0,
                        links: [],
                        numOfImages: 0,
                        imageLinks: [],
                    },
                    invalid: false,
                    last_fetched: new Date().toUTCString()
                }
                //set the cache or replace it
                await setHtmlMetaData(url, JSON.stringify(result))
                return result
            } else {
                return {
                    url: url,
                    htmlFile: htmlFilepath,
                    invalid: false,
                    last_fetched: new Date().toUTCString()
                }
            }

        } catch (error) {
            const errorMessage: string = (error instanceof Error) ? error.message : String(error);
            return {
                url: url,
                invalid: true,
                last_fetched: new Date().toUTCString(),
                error: errorMessage
            }
        }
    }

    const results: Result[] = [];
    let urlProccessed = 0;
    //do concurrency processing in the event theres like 100  urls, gotta track progress
    const batchExtraction = async (websiteUrls: string[]): Promise<Result[]> => {
        const processingUrlBatches = async (batch: string[]) => {
            const resultsData = await Promise.all(batch.map(async (url) => {
                try {
                    console.log(`Processing website: ${url}`);
                    const result = await extractDataFromUrl(url);
                    console.log(`Finished processing website: ${url}`);
                    return result;
                } catch (error) {
                    console.error(`Error processing website ${url}:`, error);
                    return null;
                } finally {
                    urlProccessed++;
                    console.log(`Website processed: ${urlProccessed}/${websiteUrls.length}`);
                }
            }));

            results.push(...resultsData.filter(r => r !== null));
        };

        //depends on how many to process per cycle,. configurable
        for (let i = 0; i < websiteUrls.length; i += envConfig.concurrencyNum) {
            const batch = websiteUrls.slice(i, i + envConfig.concurrencyNum);
            await processingUrlBatches(batch);
        }

        console.log("All URLs processed");
        console.log();
        return results;
    };

    return { batchExtraction };
}