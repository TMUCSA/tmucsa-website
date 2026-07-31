import { NextResponse } from 'next/server';

export async function POST(request) {
    return NextResponse.json({ error: 'This endpoint is retired. Use the authenticated admin team manager.' }, { status: 410 });
}

export async function GET() {
    return NextResponse.json({ error: 'This endpoint is retired. Use the authenticated admin team manager.' }, { status: 410 });
}
