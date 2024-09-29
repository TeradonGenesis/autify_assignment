import { Cheerio } from 'cheerio';
import { HTML_ELEMENTS } from '../constants/html.constant';
import { isValidUrl } from '../helpers/url';

const cheerio = require('cheerio');

export interface Metadata {
    url: string;
    title: string;
    description: string;
    numOfLinks: number;
    links: string[];
    numOfImages: number;
    imageLinks: string[];
}

export const extractHtmlMetadata = (url: string, html: string): Metadata => {
    const initialUrl = new URL(url);
    const $ = cheerio.load(html);

    let metadata: Metadata = {
        url: url,
        title: $(HTML_ELEMENTS.TITLE).text().trim(),
        description: $(HTML_ELEMENTS.DESCRIPTION).attr('content')?.trim() || '',
        numOfLinks: $(HTML_ELEMENTS.LINKS).length,
        links: [],
        numOfImages: $(HTML_ELEMENTS.IMAGES).length,
        imageLinks: [],
    }

    //convert relative links
    const convertToAbsoluteImgUrl = (srcLink: string): string => {
        return new URL(srcLink, initialUrl).href;
    }

    const convertToAbsoluteLinkUrl = (link: string): string => {
        //just ignore page anchors for now
        if (link !== "#" && !isValidUrl(link)) {
            link = new URL(link, initialUrl).href;
        }
        return link;
    }

    if ($(HTML_ELEMENTS.IMAGES).length > 0) {
        $(HTML_ELEMENTS.IMAGES).each((index: number, image: any) => {
            const srcLink: string = $(image).attr('src') || '';
            const imageLink: string = convertToAbsoluteImgUrl(srcLink);
            metadata.imageLinks.push(imageLink)
        });
    }

    if ($(HTML_ELEMENTS.LINKS).length > 0) {
        $(HTML_ELEMENTS.LINKS).each((index: number, link: any) => {
            const hreflink: string = $(link).attr('href') || '';
            const internalUrl: string = convertToAbsoluteLinkUrl(hreflink)
            metadata.links.push(internalUrl)
        })
    }
    return metadata
}

