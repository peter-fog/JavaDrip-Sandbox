import React from 'react';
import Head from 'next/head';
import { AppContext } from 'next/app';
import { CookiesProvider } from 'react-cookie';
import { parse } from 'cookie';
import { RootComponentInstance } from '@uniformdev/canvas';
import { UniformContext } from '@uniformdev/context-react';
import { UniformAppProps } from '@uniformdev/context-next';
import createUniformContext from '@/context/createUniformContext';
import '@/canvas';
import FakeCartContextProvider from '@/modules/fake-cart/FakeCartProvider';
import TrackersProvider, { GoogleAnalyticsGtag } from '@/modules/google-analytics/TrackersProvider';
import { formatQuirksFormTraits } from '@/modules/segment/utilities';
import SegmentDataContextProvider from '@/modules/segment/SegmentDataProvider';
import '@/styles/globals.scss';

const VERCEL_URL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';

const clientContext = createUniformContext();

export const App = ({
  Component,
  pageProps,
  serverUniformContext,
}: UniformAppProps<{ segmentData?: Types.SegmentData; data: RootComponentInstance; context?: unknown }>) => {
  const { data: composition } = pageProps || {};
  const {
    pageTitle,
    pageMetaDescription,
    pageKeywords,
    openGraphTitle,
    openGraphDescription,
    openGraphImage,
    overlayTitleToOgImage,
    twitterTitle,
    twitterDescription,
    twitterImage,
    overlayTitleToTwitterImage,
    twitterCard,
  } = composition?.parameters || {};
  //This is workaround because spaces removes from query params and not parsing automatically.
  //Space should be encoded as %20 http://www.faqs.org/rfcs/rfc1738.html
  const ogTitle = (openGraphTitle?.value as string)?.replaceAll?.(' ', '%20');
  const twTitle = (twitterTitle?.value as string)?.replaceAll?.(' ', '%20');
  const title: string = pageTitle?.value as string;

  const compositionHeader = composition?.slots?.pageHeader?.[0];

  const favicon = compositionHeader?.parameters?.favicon;

  const renderOgImageElement = () => {
    if (overlayTitleToOgImage?.value && openGraphImage?.value) {
      return (
        <meta
          property="og:image"
          content={`${VERCEL_URL}/api/og?title=${ogTitle ?? title?.replaceAll?.(' ', '%20')}&image=${
            openGraphImage.value
          }`}
        />
      );
    }
    if (openGraphImage?.value) return <meta property="og:image" content={openGraphImage?.value as string} />;
  };

  const renderTwitterImageElement = () => {
    if (overlayTitleToTwitterImage?.value && twitterImage?.value) {
      return (
        <meta
          property="twitter:image"
          content={`${VERCEL_URL}/api/og?title=${twTitle ?? title?.replaceAll?.(' ', '%20')}&image=${
            twitterImage.value
          }`}
        />
      );
    }
    if (twitterImage?.value) return <meta property="twitter:image" content={twitterImage?.value as string} />;
  };
  const context = serverUniformContext ?? clientContext;
  const quirks = formatQuirksFormTraits(pageProps.segmentData?.traits);

  if (!!Object.keys(quirks).length) {
    context
      .update({
        quirks,
      })
      .then(() => console.info('The context has been updated based on the traits from Segment'))
      .catch(e => console.error(e));
  }

  return (
    <>
      <Head>
        {/* page metadata */}
        <title>{(pageTitle?.value as string) ?? 'Uniform Component Starter Kit'}</title>
        <meta property="og:description" content={pageMetaDescription?.value as string} />
        <meta name="keywords" content={pageKeywords?.value as string} />
        {/* Open Graph */}
        <meta property="og:title" content={(openGraphTitle?.value as string) ?? pageTitle?.value} />
        <meta
          property="og:description"
          content={(openGraphDescription?.value as string) ?? pageMetaDescription?.value}
        />
        {renderOgImageElement()}
        {/* Twitter */}
        <meta name="twitter:title" content={(twitterTitle?.value as string) ?? pageTitle?.value} />
        <meta name="twitter:card" content={(twitterCard?.value as string) ?? 'summary'} />
        <meta
          name="twitter:description"
          content={(twitterDescription?.value as string) ?? pageMetaDescription?.value}
        />
        {renderTwitterImageElement() as any} {/* eslint-disable-line @typescript-eslint/no-explicit-any */}
        {/* Other stuff */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="version" content={process.env.NEXT_PUBLIC_APP_VERSION} />
        {favicon?.value && <link rel="shortcut icon" href={favicon?.value as string} />}
        <GoogleAnalyticsGtag />
      </Head>
      <CookiesProvider>
        <UniformContext context={context}>
          <SegmentDataContextProvider data={pageProps?.segmentData}>
            <Component {...pageProps} providers={FakeCartContextProvider} />
          </SegmentDataContextProvider>
          <TrackersProvider />
        </UniformContext>
      </CookiesProvider>
    </>
  );
};

App.getInitialProps = async (context: AppContext) => {
  const ajs_anonymous_id = parse(context.ctx?.req?.headers?.cookie || '')?.['ajs_anonymous_id'];
  const statusCode = context.ctx.res?.statusCode;

  const SEGMENT_SPACE_ID = process.env.SEGMENT_SPACE_ID;
  const SEGMENT_API_KEY = process.env.SEGMENT_API_KEY;
  if (!ajs_anonymous_id || !SEGMENT_SPACE_ID || !SEGMENT_API_KEY || statusCode === 404) {
    return { pageProps: { statusCode } };
  }

  const url = `https://profiles.segment.com/v1/spaces/${SEGMENT_SPACE_ID}/collections/users/profiles/anonymous_id:${ajs_anonymous_id}/traits`;
  const basicAuth = Buffer.from(SEGMENT_API_KEY + ':').toString('base64');
  const segmentResponse = await fetch(url, {
    headers: {
      Authorization: `Basic ${basicAuth}`,
      'accept-encoding': '*',
    },
  });

  if (!segmentResponse.ok) {
    console.error('Unable to fetch visitor data from Segment', {
      status: segmentResponse.status,
      message: segmentResponse.statusText,
    });
  }

  const segmentData = await segmentResponse.json();
  return { pageProps: { segmentData, statusCode } };
};

export default App;
