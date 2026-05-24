import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';

/**
 * Get the current logged-in employee ID from cookies.
 * In Phase 1, this is a simple plaintext cookie.
 */
export async function getCurrentEmployeeId(): Promise<string | null> {
  const session = await getServerSession();
  if (session?.user?.email) {
    // Phase 1.5: 本番運用ではここでDBと照合して employee_id を取得します
    // 今回は検証用のため固定の "E0001" を返します
    return "E0001";
  }

  const cookieStore = await cookies();
  const empId = cookieStore.get('employee_id');
  return empId ? empId.value : null;
}
