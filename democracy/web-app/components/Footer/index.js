import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'antd';

import Link from 'Components/shared/Link';

const FooterElem = styled.footer`
  text-align: center;
  padding-top: ${({ stickyFooter, theme }) => (stickyFooter ? '0' : `${theme.space(1)}px`)};
  padding-bottom: ${({ stickyFooter, theme }) => (stickyFooter ? '0' : `${theme.space(1)}px`)};
  background-color: ${({ stickyFooter, theme }) =>
    stickyFooter ? 'rgba(255,255,255,0.9)' : theme.backgrounds.primary};

  box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.5);
  color: ${({ theme }) => theme.colors.link};
  font-size: ${({ theme, stickyFooter }) => (stickyFooter ? '15px' : theme.fontSizes.small)};
  position: ${({ stickyFooter }) => (stickyFooter ? 'fixed' : 'static')};
  bottom: ${({ stickyFooter }) => (stickyFooter ? '0' : 'auto')};
  width: ${({ stickyFooter }) => (stickyFooter ? '100%' : 'auto')};
`;

const Footer = ({ stickyFooter }) => {
  return (
    <FooterElem stickyFooter={stickyFooter}>
      <Link href="https://www.democracy-deutschland.de" external>
        DEMOCRACY Deutschland e.V.
      </Link>
      &nbsp; <Icon type="minus" /> &nbsp;
      <Link href="https://www.democracy-deutschland.de/#!impressum" external>
        Impressum
      </Link>
      &nbsp; <Icon type="minus" /> &nbsp;
      <Link href="https://www.democracy-deutschland.de/#!nutzungsbedingungen" external>
        Nutzungsbedingungen
      </Link>
      &nbsp; <Icon type="minus" /> &nbsp;
      <Link href="https://www.democracy-deutschland.de/#!datenschutz" external>
        Datenschutz
      </Link>
    </FooterElem>
  );
};

Footer.propTypes = {
  stickyFooter: PropTypes.bool,
};

Footer.defaultProps = {
  stickyFooter: false,
};

export default withRouter(Footer);
