import PropTypes from 'prop-types';

// Components
import Theme from '../ThemeProvider';
import Nav from 'Components/Nav';
import Footer from 'Components/Footer';

import '../../assets/styles/styles.less';

const LayoutDefault = ({ children, stickyFooter, page }) => (
  <main id="top">
    <Theme>
      <>
        <Nav page={page} />
        {children}
        <Footer stickyFooter={stickyFooter} />
      </>
    </Theme>
  </main>
);

LayoutDefault.propTypes = {
  stickyFooter: PropTypes.bool,
  page: PropTypes.string,
};

LayoutDefault.defaultProps = {
  stickyFooter: false,
  page: '',
};

export default LayoutDefault;
