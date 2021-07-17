import PropTypes from 'prop-types';
import styled from 'styled-components';

// Components
import ButtonComponent from 'Components/shared/Button';
import IconComponent from 'Components/shared/Icon';

const voteOptions = ['thumb-up', 'thumb-down', 'thumb-left'];

const backgroundColor = ({ type, oppacity = 1 }) => {
  switch (type) {
    case 'thumb-up':
      return `rgba(21,192,99,${oppacity})`;
    case 'thumb-down':
      return `rgba(236,62,49,${oppacity})`;
    default:
      return `rgba(40,130,228,${oppacity})`;
  }
};

const rotate = ({ type }) => {
  switch (type) {
    case 'thumb-up':
      return 'rotate(0deg)';
    case 'thumb-down':
      return 'rotate(180deg)';
    default:
      return 'rotate(270deg)';
  }
};

const Button = styled(ButtonComponent)`
  min-width: 75px;
  min-height: 75px;
  background-color: ${({ type }) => backgroundColor({ type })};
  transform: ${({ type }) => rotate({ type })};
  border: 0;

  &:hover {
    background-color: ${({ type }) => backgroundColor({ type, oppacity: 0.7 })};
  }

  &:active,
  &:focus,
  &:visited {
    background-color: ${({ type }) => backgroundColor({ type })};
  }

  @media (min-width: 400px) {
    min-width: 100px;
    min-height: 100px;
  }
`;

const Icon = styled(IconComponent)`
  width: 10vw;
  height: 10vw;
  color: #fff;
  &:before {
    font-size: 40px;
    top: 0px;
    left: 0px;
  }

  @media (min-width: 400px) {
    &:before {
      font-size: 60px;
      top: 0px;
      left: 0px;
    }
  }
`;

const VoteButton = ({ type }) => (
  <Button type={type} shape="circle" size="large">
    <Icon type="thumb-up" />
  </Button>
);

VoteButton.propTypes = {
  type: PropTypes.oneOf(voteOptions).isRequired,
};

export default VoteButton;
