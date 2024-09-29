import { Metadata } from "./metadata";

export interface Result {
    url: string
    metadata?: Metadata;
    htmlFile?: string;
    invalid: boolean;
    last_fetched: string;
    error?: string;
}