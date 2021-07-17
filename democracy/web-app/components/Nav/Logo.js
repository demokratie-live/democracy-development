import styled from 'styled-components';

// Components
import Link from 'Components/shared/Link';

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    min-width: 256px;
    max-width: 256px;
  }
`;

const WrapperLink = styled(Link)`
  display: flex;
  flex: 1;
  height: 40px;
  width: 40px;
  align-items: center;
  justify-content: center;
  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    justify-content: flex-start;
    padding-left: ${({ theme }) => theme.space(1)}px;
  }
`;

const Img = styled.img`
  margin-right: ${({ theme }) => theme.space(1)}px;
  height: 40px;
  width: 40px;
`;

const H1 = styled.h1`
  display: none;
  margin: 0;
  font-family: edosz;

  font-size: 35px;
  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    display: block;
  }
`;

const Logo = () => (
  <Wrapper>
    <WrapperLink href="/" secondary>
      <Img alt="DEMOCRACY Deutschland" src="/static/images/Bubble.png" />
      <H1>DEMOCRACY</H1>
    </WrapperLink>
  </Wrapper>
);

export default Logo;
