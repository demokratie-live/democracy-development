import { Component } from 'react';
import Error from 'next/error';
import speakingurl from 'speakingurl';
import PropTypes from 'prop-types';

// Context
import { Consumer as SearchConsumer } from 'Context/search';

// Components
import SearchList from '../components/List/SearchList';
import LayoutDefault from '../layouts/LayoutDefault';
import Details from '../components/Details';
import apolloClient from '../lib/init-apollo';

// GraphQl
import PROCECURE_URL_DATA from 'GraphQl/queries/procedureUrlData';

class DetailsLayout extends Component {
  static async getInitialProps(ctx) {
    /**
     * Check correct URL only on server side
     */
    if (ctx.res) {
      const {
        req: { params },
        res,
      } = ctx;
      const client = apolloClient();
      const { data, error } = await client
        .query({
          query: PROCECURE_URL_DATA,
          variables: {
            id: params.id,
          },
        })
        .catch(() => {
          return { error: { statusCode: 404 } };
        });
      if (error) {
        return { statusCode: error.statusCode };
      }
      const { title, type } = data.procedure;
      if (speakingurl(title) !== params.title || speakingurl(type) !== params.type) {
        res.writeHead(302, {
          Location: `/${speakingurl(type)}/${params.id}/${speakingurl(title)}`,
        });
        res.end();
      }
      return { title };
    }
    return {};
  }
  render() {
    if (this.props.statusCode) {
      return <Error statusCode={this.props.statusCode} />;
    }

    return (
      <LayoutDefault page="detail">
        <SearchConsumer>
          {consumerProps => {
            const { term } = consumerProps;

            if (term.trim()) {
              return <SearchList term={term} />;
            } else {
              return <Details />;
            }
          }}
        </SearchConsumer>
      </LayoutDefault>
    );
  }
}

DetailsLayout.propTypes = {
  statusCode: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
};

DetailsLayout.defaultProps = {
  statusCode: false,
};

export default DetailsLayout;
