import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html prefix='og: http://ogp.me/ns#' lang={'ja'}>
      <Head>
        <meta name='format-detection' content='telephone=no' />
        <meta charSet={'utf-8'} />
        <meta name='msapplication-TileColor' content='#da532c' />
        <meta name='theme-color' content='#ffffff' />
      </Head>
      <body style={{ padding: 0, margin: 0 }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
