import Document, { Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

export default class MyDocument extends Document {
  static getInitialProps({ renderPage }) {
    const sheet = new ServerStyleSheet();
    const page = renderPage(App => props => sheet.collectStyles(<App {...props} />));
    const styleTags = sheet.getStyleElement();
    return { ...page, styleTags };
  }

  render() {
    const { styleTags } = this.props;
    return (
      <html>
        <Head>
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=ng9A9GOMAA" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=ng9A9GOMAA" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=ng9A9GOMAA" />
          <link rel="manifest" href="/site.webmanifest?v=ng9A9GOMAA" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg?v=ng9A9GOMAA" color="#4494d3" />
          <link rel="shortcut icon" href="/favicon.ico?v=ng9A9GOMAA" />
          <meta name="msapplication-TileColor" content="#4494d3" />
          <meta name="theme-color" content="#4494d3" />
          {styleTags}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
