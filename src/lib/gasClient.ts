import { GasFetchResponse, UpdateRequest } from './types';

const GAS_URL = process.env.GAS_WEB_APP_URL!;
const SECRET = process.env.GAS_SHARED_SECRET!;

export async function fetchFromGas(): Promise<GasFetchResponse> {
  if (!GAS_URL || !SECRET) {
    throw new Error('Missing GAS environment variables');
  }

  const response = await fetch(GAS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'fetch_data',
      app_secret: SECRET
    }),
    cache: 'no-store' // Always fetch fresh data for SVs
  });

  if (!response.ok) {
    throw new Error(`GAS request failed: ${response.statusText}`);
  }

  return response.json();
}

export async function submitToGas(request: UpdateRequest) {
  if (!GAS_URL || !SECRET) {
    throw new Error('Missing GAS environment variables');
  }

  const payload = {
    request_id: request.requestId,
    actor_employee_id: request.actorEmployeeId,
    task_id: request.taskId,
    status_after: request.statusAfter,
    memo: request.memo,
    raw_input: request.rawInput,
    ai_json: request.aiJson,
    source: request.source,
    app_secret: SECRET
  };

  const response = await fetch(GAS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`GAS request failed: ${response.statusText}`);
  }

  const json = await response.json();
  if (!json.success) {
    console.error('GAS Error Response:', json);
    throw new Error(`GAS Error: ${json.error || json.message || 'Unknown error'}`);
  }

  return json;
}

export async function sendToGas(payload: any) {
  if (!GAS_URL || !SECRET) {
    throw new Error('Missing GAS environment variables');
  }

  payload.app_secret = SECRET;

  const response = await fetch(GAS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`GAS request failed: ${response.statusText}`);
  }

  return response.json();
}
