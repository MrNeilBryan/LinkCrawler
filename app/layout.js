import './globals.css';

export const metadata = {
    title: 'Link Crawler',
    description: 'Recursively discover and visualize sublinks',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
