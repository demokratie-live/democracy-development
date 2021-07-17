import { Component } from 'react';
import PropTypes from 'prop-types';
import PropTypesStyle from 'react-style-proptype';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex: 1;
`;

const Button = styled.div`
  display: flex;
  flex: 1;
  cursor: pointer;
  justify-content: center;
  align-self: center;
`;

const OpenedConent = styled.div`
  position: absolute;
  background-color: #fff;
  top: 60px;
  left: 0;
  right: 0;
  z-index: 99999;
  padding: ${({ theme }) => theme.space(1)}px;
`;

class MobileNavButton extends Component {
  state = {
    opened: false,
  };

  constructor(props) {
    super(props);
  }

  setWrapperRef = element => {
    this.wrapperRef = element;
  };

  setButtonRef = element => {
    this.buttonRef = element;
  };

  componentDidMount() {
    document.addEventListener('mouseup', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.handleClickOutside);
  }

  handleClickOutside = event => {
    if (
      this.wrapperRef &&
      !this.wrapperRef.contains(event.target) &&
      this.buttonRef &&
      !this.buttonRef.contains(event.target)
    ) {
      this.setState({ opened: false });
    }
  };

  toggleDropdown = () => {
    this.setState({ opened: !this.state.opened });
  };

  render() {
    const { children, onClick, className, dropDownContentStyle } = this.props;
    const dropDownContent = React.Children.map(this.props.dropDownContent, child => {
      return React.cloneElement(child, {
        toggleVisibility: this.toggleDropdown,
      });
    });
    return (
      <Wrapper className={className}>
        <Button innerRef={this.setButtonRef} onClick={onClick || this.toggleDropdown}>
          {children}
        </Button>

        {dropDownContent &&
          this.state.opened && (
            <OpenedConent style={dropDownContentStyle} innerRef={this.setWrapperRef}>
              {dropDownContent}
            </OpenedConent>
          )}
      </Wrapper>
    );
  }
}

MobileNavButton.propTypes = {
  onClick: PropTypes.any,
  dropDownContent: PropTypes.any,
  dropDownContentStyle: PropTypesStyle,
};

MobileNavButton.defaultProps = {
  onClick: undefined,
  dropDownContent: undefined,
};

export default MobileNavButton;
