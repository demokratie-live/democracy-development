import styled from 'styled-components';
import PropTypes from 'prop-types';

const Icon = styled.i.attrs({})`
  &:before {
    font-size: ${({ fontSize }) => `${fontSize}px`};
    position: relative;
    top: ${({ top }) => `${top}px`};
    left: 0px;
  }
`;

const IconComponent = ({ type, fontSize, className, top, style }) => {
  return (
    <Icon className={`icon-${type} ${className}`} fontSize={fontSize} top={top} style={style} />
  );
};

IconComponent.propTypes = {
  type: PropTypes.string.isRequired,
  fontSize: PropTypes.number,
  className: PropTypes.string,
  top: PropTypes.number,
};

IconComponent.defaultProps = {
  fontSize: 22,
  top: 4,
  className: '',
};

export default IconComponent;
