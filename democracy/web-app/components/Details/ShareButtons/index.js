import PropTypes from 'prop-types';
import styled from 'styled-components';
import ShareButtonComponent from './ShareButton';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;

  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    width: 50px;
    flex-direction: column;
  }
`;

const ShareButton = styled(ShareButtonComponent)`
  margin-right: ${({ theme }) => theme.space(1)}px;

  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    margin-right: 0;
  }
`;

const ShareButtons = ({ url }) => (
  <Wrapper>
    <a
      href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <ShareButton type="facebook" />
    </a>
    <a href={`http://www.twitter.com/share?url=${url}`} target="_blank" rel="noopener noreferrer">
      <ShareButton type="twitter" />
    </a>
    <a href={`mailto:@?body=${url}`} rel="noopener noreferrer">
      <ShareButton type="mail" />
    </a>
  </Wrapper>
);

ShareButtons.propTypes = {
  url: PropTypes.string.isRequired,
};

export default ShareButtons;
