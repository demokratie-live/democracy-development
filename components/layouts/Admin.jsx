import React from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import Link from "next/link";
import { Button } from "reactstrap";

import initApollo from "../../lib/initApollo";
import redirect from "../../lib/redirect";

const Layout = ({ children }) => {
  const logout = () => {
    const client = initApollo();
    client.resetStore();
    redirect({}, "/logout");
  };

  return (
    <div>
      <Head>
        <link
          rel="stylesheet"
          href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css"
          integrity="sha384-9gVQ4dYFwwWSjIDZnLEWnxCjeSWFphJiwGPXr1jddIhOegiu1FwO5qRGvFXOdJZ4"
          crossOrigin="anonymous"
        />
        <script
          src="https://code.jquery.com/jquery-3.3.1.slim.min.js"
          integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo"
          crossOrigin="anonymous"
        />
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.0/umd/popper.min.js"
          integrity="sha384-cs/chFZiN24E4KMATLdqdvsezGxaGsi4hLGOzlXwp5UZB1LY//20VyM2taTB4QvJ"
          crossOrigin="anonymous"
        />
        <script
          src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/js/bootstrap.min.js"
          integrity="sha384-uefMccjFJAIv6A+rW+L4AHf99KvxDjWSu1z9VI8SKNVmz4sk7buKt/6v9KI65qnm"
          crossOrigin="anonymous"
        />
      </Head>
      <nav className="nav">
        <Link href="/admin">
          <a className="nav-link">Dashboard</a>
        </Link>
        <Link href="/admin/vote-results">
          <a className="nav-link">Vorgänge</a>
        </Link>
        <Button onClick={logout}>Logout</Button>
      </nav>
      <div className="container">{children}</div>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;
