// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login', // Redirect here if not authenticated
  },
});

// Protect all routes under dashboard, drivers, and vehicles
export const config = {
  matcher: ['/dashboard/:path*', '/drivers/:path*', '/vehicles/:path*', '/qr/:path*'],
};
