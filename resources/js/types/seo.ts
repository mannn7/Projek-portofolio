export type SeoData = {
    title: string;
    description: string;
    canonical: string;
    image?: string;
    publishedAt?: string;
    schema: Record<string, unknown>;
};
