import { put, list } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const BLOB_NAME = 'family-tree-blob.json';

// Default data if no blob exists yet
const DEFAULT_DATA = {
    members: [],
    settings: { direction: 'TB' },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            // Try to find existing blob
            const { blobs } = await list({ prefix: BLOB_NAME });

            if (blobs.length > 0) {
                // Fetch the blob content
                const response = await fetch(blobs[0].url);
                const data = await response.json();
                return res.status(200).json(data);
            }

            // No blob exists, return default data
            return res.status(200).json(DEFAULT_DATA);
        }

        if (req.method === 'POST') {
            const data = req.body;

            // Upload to Vercel Blob (overwrites if exists)
            const blob = await put(BLOB_NAME, JSON.stringify(data, null, 2), {
                access: 'public',
                addRandomSuffix: false,
            });

            return res.status(200).json({ success: true, url: blob.url });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}