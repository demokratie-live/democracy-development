import React from 'react';

import Layout from '../../components/layouts/Admin';

export default () => (
  <Layout>
    <div className="alert alert-primary">
      <h1>Wilkommen bei Admin</h1>
    </div>
    <style jsx>
      {`
        h1 {
          color: yellow;
        }
      `}
    </style>
  </Layout>
);
