import Document, { Html, Head, Main, NextScript } from 'next/document';

import Navigation from '@/components/molecules/Navigation';
import { AppConfig } from '@/utils/AppConfig';

// Need to create a custom _document because i18n support is not compatible with `next export`.
class MyDocument extends Document {
  // eslint-disable-next-line class-methods-use-this
  render() {
    return (
      <Html lang={AppConfig.locale}>
        <Head />
        <body className="bg-gray-100 ">
          <Navigation />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
