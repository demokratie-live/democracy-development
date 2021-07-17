import styled from 'styled-components';
import PropTypes from 'prop-types';

// Components
import ListLink from './ListLink';
import Search from './Search';
import Filter from './Filter';
import Logo from './Logo';
import Download from './Download';
import Donate from './Donate';

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: ${({ theme }) => theme.backgrounds.primary};
`;

const FirstRow = styled.div`
  display: flex;
  align-self: stretch;
  height: 60px;
  border-bottom-color: ${({ theme }) => theme.backgrounds.secondary};
  border-bottom-width: 1px;
  border-bottom-style: solid;
  > div:not(:last-child) {
    border-right-color: ${({ theme }) => theme.backgrounds.secondary};
    border-right-width: 1px;
    border-right-style: solid;
  }

  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    border: 0;
    > div:not(:last-child) {
      border: 0;
    }
  }
`;

const ListRow = styled.div`
  display: flex;
  align-self: center;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  max-width: 600px;
  height: 40px;
  > a {
    flex: 1;
    text-align: center;
  }
`;

const Header = ({ page }) => (
  <Nav>
    <FirstRow>
      <Logo />
      <Search />
      {page !== 'detail' && <Filter />}
      <Download />
      <Donate />
      {/*<MenuLink href="https://www.democracy-deutschland.de/#!donate" secondary external>
        <HeartIcon /> Unterstützen
      </MenuLink> */}
    </FirstRow>
    <ListRow>
      <ListLink listType="in-abstimmung">in Abstimmung</ListLink>
      <ListLink listType="vergangen">Vergangen</ListLink>
      <ListLink listType="whats-hot">Populär</ListLink>
      <ListLink listType="in-vorbereitung">in Vorbereitung</ListLink>
    </ListRow>
  </Nav>
);

Header.propTypes = {
  page: PropTypes.string,
};

Header.defaultProps = {
  page: '',
};

export default Header;
