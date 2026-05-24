import { NextResponse } from 'next/server';
import { submitToGas } from '@/lib/gasClient';
import { UpdateRequest } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const payload = await request.json() as UpdateRequest;
    
    // Server-side call hides the GAS_SHARED_SECRET from the browser
    const gasResponse = await submitToGas(payload);

    if (!gasResponse.success) {
      return NextResponse.json({ success: false, error: gasResponse.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, eventId: gasResponse.event_id });
  } catch (error: any) {
    console.error('GAS update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
