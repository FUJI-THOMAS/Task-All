import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: '/login', // カスタムログインページを使用
  },
  callbacks: {
    async session({ session, token }) {
      // 本番運用ではここでメールアドレス等から employee_id を特定してsessionにセットします
      return session;
    }
  }
});

export { handler as GET, handler as POST };
