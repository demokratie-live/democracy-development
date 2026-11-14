import { Head, Html, Main, NextScript } from 'next/document';

// German, so the browser hyphenates long titles
export default function Document() {
  return (
    <Html lang="de">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
