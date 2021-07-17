import styled from 'styled-components';
import PropTypes from 'prop-types';

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.backgrounds.tertiary};
  padding: ${({ theme }) => theme.space(1)}px;
  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    padding-left: ${({ theme }) => theme.space(3)}px;
    padding-right: ${({ theme }) => theme.space(3)}px;
  }
`;

const Tags = ({ tags }) => <Wrapper>{tags.join(', ')}</Wrapper>;

Tags.propTypes = {
  tags: PropTypes.array.isRequired,
};

export default Tags;
