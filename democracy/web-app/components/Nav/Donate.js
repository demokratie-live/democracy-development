import { Component } from 'react';
import styled from 'styled-components';

// Components
import Icon from 'Components/shared/Icon';

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    max-width: 130px;
  }
`;

const Text = styled.span`
  display: none;

  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    display: block;
  }
`;

const ExternalLink = styled.a`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.65);
`;

const HeartIcon = styled(Icon).attrs({
  type: 'heart-filled',
  top: 0,
})`
  padding-right: ${({ theme }) => theme.space(0.5)}px;
  color: #d0021b;
`;

class Donate extends Component {
  render() {
    return (
      <Wrapper>
        <ExternalLink target="_blank" href="https://www.democracy-deutschland.de/#!donate">
          <HeartIcon /> <Text>Unterstützen</Text>
        </ExternalLink>
      </Wrapper>
    );
  }
}

export default Donate;
