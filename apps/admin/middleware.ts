export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/superadmin/:path*',
    '/api/members/:path*',
    '/api/contributions/:path*',
    '/api/loans/:path*',
    '/api/chama/:path*',
    '/api/superadmin/chamas/:path*',
    '/api/superadmin/stats/:path*'
  ],
};
