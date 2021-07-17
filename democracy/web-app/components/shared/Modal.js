import { Component } from 'react';
import styled from 'styled-components';

// Components
import RenderToBody from './RenderToBody';

const Wrapper = styled.div`
  display: ${({ visible }) => (visible ? 'block' : 'none')};
  position: absolute; /* Stay in place */
  z-index: 1; /* Sit on top */
  position: absolute;
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto;
  background-color: transparent;

  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    background-color: rgba(0, 0, 0, 0.2);
  }
`;

class Modal extends Component {
  constructor(props) {
    super(props);
    this.id = Math.random()
      .toString(36)

      .substr(2, 9);
  }

  handleClickOutside = e => {
    if (e.target === this.outer) {
      this.props.handleVisibleChange(false);
    }
  };

  render() {
    const { children, ...props } = this.props;
    return (
      <RenderToBody id={this.id}>
        <Wrapper
          innerRef={outer => (this.outer = outer)}
          onClick={this.handleClickOutside}
          {...props}
        >
          {children}
        </Wrapper>
      </RenderToBody>
    );
  }
}

export default Modal;
