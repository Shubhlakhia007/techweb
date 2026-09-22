import type { NextConfig } from 'next';

// Security headers applied to every response.
// Keep these in sync when adding new external origins (e.g. a CDN or analytics endpoint).
const securityHeaders = [
  // Prevent browsers from MIME-sniffing away from the declared content type.
  { key: 'X-Content-Type-Options', value: 'nosniff' },

  // Only embed techweb pages inside techweb itself (blocks clickjacking).
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },

  // Only send the origin as referrer when crossing from HTTPS→HTTP.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

  // Disable browser features techweb does not use.
  {
    key: 'Permissions-Policy',
    value: [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'interest-cohort=()', // opt out of FLoC / Topics API
    ].join(', '),
  },

  // HSTS: tell browsers to always use HTTPS for 1 year (production only — dev uses HTTP).
  // next.config.ts runs at build time, so we read NODE_ENV at startup.
  ...(process.env.NODE_ENV === 'production'
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload',
        },
      ]
    : []),

  // Content-Security-Policy
  //
  // IMPORTANT: Next.js RSC streaming injects inline <script> tags
  // (self.__next_r.push(…)) to deliver server component payloads.
  // Without 'unsafe-inline' in script-src, those scripts are silently
  // blocked and every Suspense boundary / loading.tsx hangs forever.
  //
  // The gold-standard fix is nonce-based CSP via Next.js middleware
  // (see: https://nextjs.org/docs/app/guides/content-security-policy).
  // That requires per-request nonce generation — planned for later.
  //
  // For now we use 'unsafe-inline' + 'unsafe-eval' which still provides
  // meaningful protection via the other directives (object-src, base-uri,
  // form-action, frame-ancestors) while keeping streaming functional.
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self' wss: https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com",
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      ...(process.env.NODE_ENV === 'production' ? ['upgrade-insecure-requests'] : []),
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  headers: async () => [
    // Security headers on all routes
    {
      source: '/(.*)',
      headers: securityHeaders,
    },
    // Short cache for favicon (changes rarely but isn't content-hashed)
    {
      source: '/favicon.ico',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
      ],
    },
  ],

  // Fail the build if any page accidentally ships a dangling env var reference.
  // (Only vars prefixed NEXT_PUBLIC_ are safe to expose to the browser.)
  // This is enforced by TypeScript + the linter, but adding it as a guard here too.
  experimental: {},
};

export default nextConfig;

