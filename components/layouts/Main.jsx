import React from "react";
import PropTypes from "prop-types";
import Head from "next/head";

const Layout = ({ children }) => (
  <div>
    <Head>
      <link
        rel="stylesheet"
        href="/static/bootstrap/css/bootstrap.min.css"
        crossOrigin="anonymous"
      />
      <script
        src="/static/bootstrap/js/bootstrap.min.js"
        crossOrigin="anonymous"
      />
    </Head>
    <nav className="nav" />
    <div className="container">{children}</div>
  </div>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;
