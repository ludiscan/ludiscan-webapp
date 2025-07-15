import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html prefix='og: http://ogp.me/ns#' lang={'ja'}>
      <Head>
        <meta property='og:type' content='website' />
        <meta property='og:title' content='Ludiscan Web App' />
        <meta property='og:description' content='' />
        <meta property='og:image' content='https://ludiapp.matuyuhi.com/ogp.png' />
        <meta property='og:url' content='https://ludiapp.matuyuhi.com' />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:title' content='Ludiscan Web App' />
        <meta name='twitter:description' content='' />
        <meta name='twitter:image' content='https://ludiapp.matuyuhi.com/ogp.png' />
        <meta name='theme-color' content='#000000' /> {/* WebViewやAndroid Chromeでのステータスバー色 */}
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='Ludiscan Web App' />
        <meta name='format-detection' content='telephone=no' />
        <meta charSet={'utf-8'} />
        <meta name='msapplication-TileColor' content='#da532c' />
        <link rel='icon' type='image/png' href='/favicon/favicon-96x96.png' sizes='96x96' />
        <link rel='icon' type='image/svg+xml' href='/favicon/favicon.svg' />
        <link rel='shortcut icon' href='/favicon/favicon.ico' />
        <link rel='apple-touch-icon' sizes='180x180' href='/favicon/apple-touch-icon.png' />
        <link rel='manifest' href='/favicon/site.webmanifest' />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
        <link href='https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap' rel='stylesheet' />
      </Head>
      <body style={{ padding: 0, margin: 0 }} suppressHydrationWarning>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
