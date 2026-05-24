'use server';

import { submitToGas } from '@/lib/gasClient';
import { getCurrentEmployeeId } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateTaskAction(taskId: string, newStatus: string, memo: string) {
  const empId = await getCurrentEmployeeId();
  if (!empId) throw new Error("Unauthorized");

  try {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    await submitToGas({
      requestId: requestId,
      actorEmployeeId: empId,
      taskId: taskId,
      statusAfter: newStatus,
      memo: memo,
      rawInput: "Quick update from list",
      aiJson: "",
      source: "web"
    });

    revalidatePath('/tasks');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
