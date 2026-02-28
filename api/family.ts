import type { VercelRequest, VercelResponse } from '@vercel/node';
import { list, put } from '@vercel/blob';

const BLOB_PATHNAME = 'family-tree-blob.json';

const DEFAULT_DATA = {
    members: [],
    settings: { direction: 'TB' },
};

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
): Promise<void> {
    if (req.method === 'GET') {
        try {
            const { blobs } = await list({ prefix: BLOB_PATHNAME });

            if (blobs.length === 0) {
                res.status(200).json(DEFAULT_DATA);
                return;
            }

            const blob = blobs.find((b) => b.pathname === BLOB_PATHNAME) ?? blobs[blobs.length - 1];
            const blobResponse = await fetch(blob.url);

            if (!blobResponse.ok) {
                res.status(500).json({ error: 'Failed to fetch blob content' });
                return;
            }

            const data = await blobResponse.json();
            res.status(200).json(data);
        } catch (error) {
            console.error('GET /api/family error:', error);
            res.status(500).json({ error: 'Failed to load family data' });
        }
        return;
    }

    if (req.method === 'POST') {
        try {
            const body = req.body;

            if (!body || typeof body !== 'object') {
                res.status(400).json({ error: 'Invalid request body' });
                return;
            }

            await put(BLOB_PATHNAME, JSON.stringify(body), {
                access: 'public',
                contentType: 'application/json',
                allowOverwrite: true,
                addRandomSuffix: false,
            });

            res.status(200).json({ success: true });
        } catch (error) {
            console.error('POST /api/family error:', error);
            res.status(500).json({ error: 'Failed to save family data' });
        }
        return;
    }

    res.status(405).json({ error: 'Method not allowed' });
}
