import { NextRequest, NextResponse } from 'next/server';

const INDEXNOW_KEY = 'a7aabd4921d842259916936e31ab2880';
const BASE_URL = 'https://www.shepherdaitech.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'urls array required' }, { status: 400 });
    }

    const indexNowPayload = {
      host: 'www.shepherdaitech.com',
      key: INDEXNOW_KEY,
      keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls.slice(0, 10000),
    };

    const response = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(indexNowPayload),
    });

    console.log(`IndexNow response: ${response.status}`);

    return NextResponse.json({
      success: response.status === 200 || response.status === 202,
      status: response.status,
      urlsSubmitted: urls.length,
    });
  } catch (error) {
    console.error('IndexNow error:', error);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
