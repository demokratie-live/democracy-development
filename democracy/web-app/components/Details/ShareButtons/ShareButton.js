import PropTypes from 'prop-types';
import styled from 'styled-components';

// Components
import ButtonComponent from 'Components/shared/Button';
import IconComponent from 'Components/shared/Icon';

const shareTypes = ['facebook', 'twitter', 'mail'];

const Button = styled(ButtonComponent)`
  height: 30px !important;
  width: 30px !important;
  background-color: transparent;
  border: 2px solid rgba(0, 0, 0, 0.6);
  float: right;

  &:hover {
    background-color: rgba(0, 0, 0, 0.2);
    border-color: rgba(0, 0, 0, 0.3);
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.2);
    border-color: rgba(0, 0, 0, 0.5);
  }
  &:focus {
    background-color: transparent;
    border: 2px solid rgba(0, 0, 0, 0.6);
  }

  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    border: 2px solid rgb(143, 142, 148);
    margin-bottom: 15px;
    height: 55px !important;
    width: 55px !important;
  }
`;

const Icon = styled(IconComponent)`
  width: 30px;
  height: 30px;
  display: block;
  &:before {
    color: rgba(0, 0, 0, 0.6);
    font-size: 16px;
    left: -2px;
  }
  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    width: 51px;
    height: 55px;
    display: block;
    padding-top: 7px;
    &:before {
      color: rgb(143, 142, 148);
      font-size: 32px;
      left: 0px;
    }
  }
`;

const ShareButton = ({ type, className }) => (
  <Button type="primary" shape="circle" size="large" className={className}>
    <Icon type={type} fontSize={30} style={{}} />
  </Button>
);

ShareButton.propTypes = {
  type: PropTypes.oneOf(shareTypes).isRequired,
};

export default ShareButton;
