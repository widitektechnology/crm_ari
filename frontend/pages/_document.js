import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#2563eb" />
        <meta
          name="description"
          content="Sistema ERP modular, escalable y configurable"
        />
      </Head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f5f5f5' }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}