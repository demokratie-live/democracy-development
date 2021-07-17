import styled from 'styled-components';
import PropTypes from 'prop-types';
import { darken } from 'polished';

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.primary};
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
  position: relative;
  left: -31px;
  display: inline-block;
  height: ${({ theme }) => theme.space(4)}px;
  top: 50px;
  &:hover {
    background-color: rgba(68, 148, 211, 0.8);
  }
`;

const Text = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.small};
  margin: 0 15px;
  margin-top: 6px;
  display: table;
  color: ${({ theme }) => theme.backgrounds.primary};
  vertical-align: middle;

  &:before {
    content: '';
    position: absolute;
    display: block;
    border-style: solid;
    border-color: transparent;
    border-top-color: ${({ theme }) => darken(0.2, theme.colors.primary)};
    bottom: -5px;
    left: 0;
    border-width: 5px 0 0 7px;
  }
`;

const Ribbon = ({ children, onClick }) => {
  return (
    <Wrapper onClick={onClick}>
      <Text>{children}</Text>
    </Wrapper>
  );
};

Ribbon.displayName = 'Ribbon';

Ribbon.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default Ribbon;
