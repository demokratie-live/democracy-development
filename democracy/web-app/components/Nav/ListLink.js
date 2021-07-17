import PropTypes from 'prop-types';
import { withRouter } from 'next/router';
import styled from 'styled-components';

import LinkComponent from 'Components/shared/Link';

const Link = styled(LinkComponent)`
  font-size: 3vw;

  .anticon {
    font-size: ${({ theme }) => theme.fontSizes.medium};
  }

  @media (min-width: 550px) {
    font-size: ${({ theme }) => theme.fontSizes.default};
  }
`;

const MenuLink = ({ listType, router: { query }, children }) => {
  const asLink = listType !== 'in-abstimmung' ? `/${listType}` : '/';
  return (
    <Link
      prefetch
      secondary={query.listType !== listType}
      href={`/?listType=${listType}`}
      as={asLink}
    >
      {children}
    </Link>
  );
};

MenuLink.propTypes = {
  listType: PropTypes.string.isRequired,
};

export default withRouter(MenuLink);
