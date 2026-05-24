import { NextResponse } from 'next/server';
import { sendToGas } from '@/lib/gasClient';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId, actorEmployeeId } = body;

    if (!campaignId || !actorEmployeeId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const payload = {
      action: 'rollout_campaign',
      campaign_id: campaignId,
      actor_employee_id: actorEmployeeId
    };

    const gasResponse = await sendToGas(payload);

    if (gasResponse.success) {
      return NextResponse.json({ success: true, data: gasResponse });
    } else {
      return NextResponse.json({ success: false, error: gasResponse.error || 'Failed to rollout' }, { status: 500 });
    }

  } catch (error) {
    console.error('Rollout API Route Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
