import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import Papa from 'papaparse';

// UPDATE THIS NUMBER MONTHLY WHEN NEW DATA IS RELEASED
const CURRENT_TABLE_ID = 18100205; // October 2025 data

let cachedData: any[] | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // Cache for 24 hours

export async function GET() {
    // Return cached data if available
    if (cachedData && Date.now() - cacheTime < CACHE_DURATION) {
        console.log(`✓ Cache hit - Returning ${cachedData.length} records`);
        return NextResponse.json(cachedData);
    }

    console.log(`Fetching table ${CURRENT_TABLE_ID}...`);

    try {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(`https://www150.statcan.gc.ca/n1/tbl/csv/${CURRENT_TABLE_ID}-eng.zip`)}`;

        const response = await fetch(proxyUrl);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        console.log(`Downloaded: ${arrayBuffer.byteLength} bytes`);

        const zip = await JSZip.loadAsync(arrayBuffer);
        const csvFile = zip.file(`${CURRENT_TABLE_ID}.csv`);

        if (!csvFile) {
            throw new Error('CSV file not found in ZIP');
        }

        const csvText = await csvFile.async('text');
        console.log(`CSV size: ${csvText.length} characters`);

        const result = await new Promise<any[]>((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => resolve(results.data),
                error: reject,
            });
        });

        cachedData = result;
        cacheTime = Date.now();

        console.log(`✓ SUCCESS! Loaded ${result.length} records`);
        return NextResponse.json(result);

    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}