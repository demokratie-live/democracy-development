import React from 'react';
import Head from 'next/head';

const Layout = ({ children }) => (
  <div>
    <Head>
      <link
        rel="stylesheet"
        href="/static/bootstrap/css/bootstrap.min.css"
        integrity="sha384-9gVQ4dYFwwWSjIDZnLEWnxCjeSWFphJiwGPXr1jddIhOegiu1FwO5qRGvFXOdJZ4"
        crossOrigin="anonymous"
      />
      <script
        src="/static/bootstrap/js/bootstrap.min.js"
        integrity="sha384-uefMccjFJAIv6A+rW+L4AHf99KvxDjWSu1z9VI8SKNVmz4sk7buKt/6v9KI65qnm"
        crossOrigin="anonymous"
      />
    </Head>
    <nav className="nav">
      <a className="nav-link" href="#">
        Active
      </a>
    </nav>
    <div className="container">{children}</div>
  </div>
);

export default Layout;
