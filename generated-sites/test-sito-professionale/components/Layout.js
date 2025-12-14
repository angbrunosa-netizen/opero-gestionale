
import React from 'react';
import Head from 'next/head';

export default function Layout({ siteData, pageData, children }) {
  return (
    <>
      <Head>
        <title>{pageData?.titolo || siteData?.site_title || 'Sito Web'}</title>
        <meta name="description" content={pageData?.descrizione || siteData?.site_description || ''} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        {children}
      </div>
    </>
  );
}
