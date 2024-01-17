/* eslint-disable @typescript-eslint/ban-ts-comment */
import { parse } from 'cookie';
import { NextRequest, NextResponse } from 'next/server';
import { Context, CookieTransitionDataStore, ManifestV2, UNIFORM_DEFAULT_COOKIE_NAME } from '@uniformdev/context';
import { createUniformEdgeMiddleware } from '@uniformdev/context-edge-vercel';
import { RedirectClient, WithMemoryCache } from '@uniformdev/redirect';
import { STORE_ANONYMOUS_ID_COOKIE_NAME } from './modules/segment/constants';
import { STORE_USER_COOKIE_NAME } from './modules/auth/constants';
import { formatQuirksFormTraits } from './modules/segment/utilities';
// @ts-ignore: It is assumed that each application implements the createUniformContext function at the appropriate location
import manifest from '@/context/manifest.json';

const SKIP_MIDDLEWARE_FOR_SSR_PAGES = ['/profile'];

const client = new RedirectClient({
  apiHost: process.env.UNIFORM_CLI_BASE_URL || 'https://uniform.app',
  apiKey: process.env.UNIFORM_API_KEY,
  projectId: process.env.UNIFORM_PROJECT_ID,
  dataCache: new WithMemoryCache({ prePopulate: true, refreshRate: 20000 }),
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next
     * - static (static files)
     * - favicon.ico (favicon file)
     */
    '/(.*?trpc.*?|(?!static|.*\\..*|_next|images|img|api|favicon.ico).*)',
  ],
};

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const result = await client.processUrlBestMatch(url.pathname, undefined, true);
  if (result) {
    return NextResponse.redirect(new URL(result.url, request.url), result.definition?.redirect.targetStatusCode ?? 301);
  }

  const isSsrPage = SKIP_MIDDLEWARE_FOR_SSR_PAGES.includes(url.pathname);
  const data = request.headers.get('x-nextjs-data');
  const previewDataCookie = request.cookies.get('__next_preview_data');
  const {
    nextUrl: { search },
  } = request;

  const urlSearchParams = new URLSearchParams(search);
  const params = Object.fromEntries(urlSearchParams.entries());

  // disabling middleware in preview or locally
  if (
    Boolean(previewDataCookie) ||
    Boolean(data) ||
    params.is_incontext_editing_mode === 'true' ||
    !process.env.VERCEL_URL ||
    isSsrPage
  ) {
    return NextResponse.next();
  }

  const serverCookieValue = request
    ? parse(request.headers.get('cookie') ?? '')[UNIFORM_DEFAULT_COOKIE_NAME]
    : undefined;

  const context = new Context({
    defaultConsent: true,
    manifest: manifest as ManifestV2,
    transitionStore: new CookieTransitionDataStore({
      serverCookieValue,
    }),
  });

  const userId = request.cookies.get(STORE_USER_COOKIE_NAME)?.value || '';
  const anonymousId = request.cookies.get(STORE_ANONYMOUS_ID_COOKIE_NAME)?.value || '';

  if (userId || anonymousId) {
    await fetch(`https://${process.env.VERCEL_URL}/api/user/traits?user_id=${userId}&anonymous_id=${anonymousId}`)
      .then(result => result.json())
      .then(quirks => context.update({ quirks: formatQuirksFormTraits(quirks) }))
      .catch(e => console.error(e));
  }

  const handler = createUniformEdgeMiddleware();

  const response = await handler({
    context,
    origin: new URL(request.url),
    request,
  });

  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');

  return response;
}
