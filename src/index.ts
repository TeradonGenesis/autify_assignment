import { connectRedis, quitRedis } from "./infrastructure/redis"
import { saveMetadataJson, readHTMLDirectory } from "./infrastructure/document"
import { dataExtractor } from "./application/extract_metadata";
import { MODE } from './constants/mode.constant';
import { envConfig } from "./config/env_config";

const main = async () => {
    try {
        await connectRedis();

        const args = process.argv.slice(2);
        const metaDataMode: boolean = args.includes(`--${MODE.METADATA}`);
        const cacheMode: boolean = args.includes(`--${MODE.CACHE}`);
        const verbose: boolean = args.includes(`--${MODE.VERBOSE}`);
        const list: boolean = args.includes(`--${MODE.LIST}`);
        const urls = args.filter(arg => !arg.startsWith('--'));

        if (urls.length === 0) {
            if (list) {
                const files = await readHTMLDirectory();
                console.log('HTML Files Saved:', files);
                process.exit(1);
            } else {
                console.error('No urls provided, provide at least 1 url');
                process.exit(1);
            }
        }

        const htmlExtractor = dataExtractor(metaDataMode, cacheMode);
        const results = await htmlExtractor.batchExtraction(urls);
        if (metaDataMode) {
            results.forEach(result => {
                if (result.invalid) {
                    console.log(`Invalid Url: ${result.url}`);
                    console.log(`Error: ${result.error}`);
                    console.log(`Last Fetched: ${result.last_fetched}`);
                    console.log();

                } else {
                    if (verbose) {
                        console.log(`Url: ${result.url}`);
                        console.log(`HTML Path: ${result.htmlFile}`);
                        console.log(`Title: ${result.metadata?.title}`);
                        console.log(`Description: ${result.metadata?.description}`);
                        console.log(`Number of Links: ${result.metadata?.numOfLinks}`);
                        console.log(`Links: ${JSON.stringify(result.metadata?.links, null, 2)}`);
                        console.log(`Number of Images: ${result.metadata?.numOfImages}`);
                        console.log(`Images: ${JSON.stringify(result.metadata?.imageLinks, null, 2)}`);
                        console.log(`Last Fetched: ${result.last_fetched}`);
                        console.log();
                    } else {
                        console.log(`Url: ${result.url}`);
                        console.log(`HTML Path: ${result.htmlFile}`);
                        console.log(`Number of Links: ${result.metadata?.numOfLinks}`);
                        console.log(`Number of Images: ${result.metadata?.numOfImages}`);
                        console.log(`Last Fetched: ${result.last_fetched}`);
                        console.log();
                    }
                }
            })

            saveMetadataJson(`${envConfig.metadataOutputDirectory}/metadata.latest.json`, results)
        } else {
            results.forEach(result => {
                if (result.invalid) {
                    console.log(`Invalid Url: ${result.url}`);
                    console.log(`Error: ${result.error}`);
                    console.log(`Last Fetched: ${result.last_fetched}`);
                    console.log();
                } else {
                    console.log(`Url: ${result.url}`);
                    console.log(`HTML Path: ${result.htmlFile}`);
                    console.log(`Last Fetched: ${result.last_fetched}`);
                    console.log();
                }
            })
        }

    } catch (error) {
        console.error("There was an error: ", error)
    } finally {
        await quitRedis();
    }

}

main();