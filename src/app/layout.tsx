import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { getCurrentEmployeeId } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SV-DX Platform",
  description: "Task Management for SVs",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const empId = await getCurrentEmployeeId();

  return (
    <html lang="ja">
      <body className={`${inter.className} bg-gray-50 min-h-screen flex flex-col`}>
        <nav className="bg-indigo-600 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link href="/" className="flex-shrink-0 flex items-center font-bold text-xl tracking-wider">
                  SV-DX
                </Link>
                {empId && (
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <Link href="/tasks" className="border-transparent text-white hover:border-indigo-300 hover:text-indigo-100 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                      タスク一覧
                    </Link>
                    <Link href="/report" className="border-transparent text-white hover:border-indigo-300 hover:text-indigo-100 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                      AI一括報告
                    </Link>
                    <Link href="/admin" className="border-transparent text-white hover:border-indigo-300 hover:text-indigo-100 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                      本部管理
                    </Link>
                  </div>
                )}
              </div>
              <div className="flex items-center">
                {empId ? (
                  <span className="text-sm font-medium bg-indigo-700 px-3 py-1 rounded-full shadow-inner">
                    ID: {empId}
                  </span>
                ) : (
                  <Link href="/login" className="text-sm font-medium hover:text-indigo-200">ログイン</Link>
                )}
              </div>
            </div>
          </div>
          {empId && (
            <div className="sm:hidden bg-indigo-700 px-2 pt-2 pb-3 space-y-1">
               <Link href="/tasks" className="text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600">タスク一覧</Link>
               <Link href="/report" className="text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600">AI一括報告</Link>
               <Link href="/admin" className="text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-600">本部管理</Link>
            </div>
          )}
        </nav>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
          {children}
        </main>
      </body>
    </html>
  );
}
