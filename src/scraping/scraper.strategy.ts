export interface Job {
    title: string;
    url: string;
    description: string;
    source: string;
}

export interface ScraperStrategy {
    scrape(keywords: string): Promise<Job[]>;
}