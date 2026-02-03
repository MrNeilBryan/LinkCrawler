import axios from 'axios';
import * as cheerio from 'cheerio';
import { NextResponse } from 'next/server';

// Configuration to prevent abuse/timeouts
const MAX_DEPTH = 2; // recursive depth 0 -> 1 -> 2
const MAX_LINKS_PER_PAGE = 10;
const TIMEOUT_MS = 5000;

async function crawl(targetUrl, currentDepth, visited) {
    // Base cases
    if (currentDepth > MAX_DEPTH) return { url: targetUrl, links: [] };
    if (visited.has(targetUrl)) return { url: targetUrl, links: [] };

    visited.add(targetUrl);

    try {
        const { data } = await axios.get(targetUrl, {
            timeout: TIMEOUT_MS,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Compatible; LinkCrawler/1.0)'
            }
        });

        const $ = cheerio.load(data);
        const links = [];

        $('a').each((i, elem) => {
            if (links.length >= MAX_LINKS_PER_PAGE) return false;

            const href = $(elem).attr('href');
            if (!href) return;

            try {
                const absoluteUrl = new URL(href, targetUrl).href;
                // Only crawl http/https and avoid self-referential anchors
                if (absoluteUrl.startsWith('http') && absoluteUrl !== targetUrl) {
                    links.push(absoluteUrl);
                }
            } catch (e) {
                // Invalid URL, ignore
            }
        });

        // Recursively crawl children if we haven't hit max depth
        const children = [];
        if (currentDepth < MAX_DEPTH) {
            // Process in parallel but limited to avoid overwhelming
            const promises = links.map(link => crawl(link, currentDepth + 1, visited));
            children.push(...await Promise.all(promises));
        } else {
            // Just return the links as leaf nodes
            children.push(...links.map(l => ({ url: l, links: [] })));
        }

        return { url: targetUrl, links: children };

    } catch (error) {
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            return { url: targetUrl, links: [] };
        }
        return { url: targetUrl, error: error.message || 'Failed to fetch', links: [] };
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Validate URL
        try {
            new URL(url);
        } catch (e) {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
        }

        const visited = new Set();
        const result = await crawl(url, 0, visited);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Crawl error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
