import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // ログイン画面、APIルート、静的ファイルは許可
  if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Phase 1 の簡易認証クッキー
  const empIdCookie = request.cookies.get('employee_id');
  
  // Phase 1.5 の NextAuth セッショントークン
  const sessionToken = request.cookies.get('next-auth.session-token') || request.cookies.get('__Secure-next-auth.session-token');

  // どちらの認証情報もなければログイン画面へリダイレクト
  if (!empIdCookie && !sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
