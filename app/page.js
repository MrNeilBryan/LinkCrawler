'use client';

import { useState } from 'react';

// Recursive component to display the link tree
const LinkTree = ({ node, level = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.links && node.links.length > 0;

    return (
        <div style={{ marginLeft: `${level * 24}px` }} className="mt-3 font-sans">
            <div className="flex items-start group">
                {hasChildren && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mr-3 w-4 mt-1 text-gray-500 hover:text-black transition-colors"
                    >
                        {isExpanded ? '▼' : '▶'}
                    </button>
                )}
                {!hasChildren && <span className="w-4 mr-3"></span>}

                <div className="flex-1">
                    <a
                        href={node.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline break-all transition-colors text-base"
                        title={node.url}
                    >
                        {node.url}
                    </a>
                    {node.error && <span className="ml-2 text-red-600 text-sm font-medium">({node.error})</span>}
                </div>
            </div>

            {hasChildren && isExpanded && (
                <div className="border-l border-gray-200 ml-2 pl-3 pb-1">
                    {node.links.map((child, index) => (
                        <LinkTree key={`${child.url}-${index}`} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function Home() {
    const [url, setUrl] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copySuccess, setCopySuccess] = useState('');

    const handleCrawl = async (e) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError(null);
        setData(null);
        setCopySuccess('');

        try {
            const response = await fetch('/api/crawl', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to crawl');
            }

            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const traverseForCopy = (node, level = 0) => {
        let result = `${'  '.repeat(level)}${node.url}\n`;
        if (node.links && node.links.length > 0) {
            node.links.forEach((child) => {
                result += traverseForCopy(child, level + 1);
            });
        }
        return result;
    };

    const handleCopy = () => {
        if (!data) return;
        const text = traverseForCopy(data);
        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, (err) => {
            console.error('Failed to copy: ', err);
        });
    };

    return (
        <main className="min-h-screen p-6 md:p-20 bg-white">
            <div className="max-w-4xl mx-auto flex flex-col items-center animate-fade-in">
                <h1 className="text-6xl font-black mb-6 text-gray-900 tracking-tight text-center leading-tight">
                    Link Crawler
                </h1>

                <p className="text-gray-600 mb-10 text-center max-w-lg text-lg">
                    Recursively discover and visualize sublinks.
                </p>

                <form onSubmit={handleCrawl} className="w-full max-w-2xl flex flex-col sm:flex-row gap-3 mb-12">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        required
                        className="flex-1 p-3 rounded-lg clean-input text-base"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-3 rounded-lg primary-button text-base whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
                    >
                        {loading ? 'Crawling...' : 'Start Crawl'}
                    </button>
                </form>

                {error && (
                    <div className="w-full max-w-2xl p-4 mb-8 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center animate-fade-in">
                        {error}
                    </div>
                )}

                {data && (
                    <div className="w-full clean-panel rounded-xl p-8 animate-fade-in bg-slate-50 relative">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
                            <h2 className="text-lg font-semibold text-gray-900">Results</h2>
                            <button
                                onClick={handleCopy}
                                className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 transition-colors text-gray-700 font-medium"
                            >
                                {copySuccess || 'Copy Results'}
                            </button>
                        </div>
                        <LinkTree node={data} />
                    </div>
                )}

                {!data && !loading && !error && (
                    <div className="mt-12 text-gray-400 text-sm">
                        Max Depth: 2 • Max Links: 10/page
                    </div>
                )}
            </div>
        </main>
    );
}
