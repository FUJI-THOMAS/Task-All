import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import GoogleLoginButton from './GoogleLoginButton';

export default function LoginPage() {
  async function login(formData: FormData) {
    'use server';
    const empId = formData.get('employee_id') as string;
    if (empId) {
      const cookieStore = await cookies();
      cookieStore.set('employee_id', empId, { secure: true, httpOnly: true, path: '/' });
      redirect('/');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-indigo-600 tracking-tight">SV-DX</h1>
        <p className="mt-2 text-lg text-gray-600">スーパーバイザー業務管理プラットフォーム</p>
      </div>

      <form action={login} className="bg-white shadow-xl rounded-2xl px-8 pt-8 pb-8 mb-4 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">ログイン</h2>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="employee_id">
            社員ID (Employee ID)
          </label>
          <input 
            className="shadow-sm appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" 
            id="employee_id" 
            name="employee_id"
            type="text" 
            placeholder="例: E0001" 
            required 
          />
        </div>
        <div className="flex items-center justify-between">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full transition-all shadow-md hover:shadow-lg" type="submit">
            ログインして開始
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-6">
          ※ Phase 1 ではパスワード入力は不要です。シート上の employee_id を入力してください。
        </p>

        <GoogleLoginButton />
      </form>
    </div>
  );
}
