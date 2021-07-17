import styled from 'styled-components';

// components
import VoteButton from './VoteButton';
import Link from 'Components/shared/Link';
import IconComponent from 'Components/shared/Icon';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const H3 = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  text-align: center;
`;

const VoteButtons = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 80vw;
  max-width: 400px;
  padding-top: ${({ theme }) => theme.space(2)}px;
  padding-bottom: ${({ theme }) => theme.space(3)}px;
`;

const StoreLink = styled.div`
  display: flex;
  width: 100%;
  max-width: 400px;
  align-items: center;
  flex-direction: column;
  padding-top: ${({ theme }) => theme.space(2)}px;
  @media (min-width: 500px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const AppStoreIcon = styled(IconComponent)`
  &:before {
    font-size: ${({ type }) => (type === 'appstore' ? '64px' : '60px')};
  }

  @media (min-width: 555px) {
    &:before {
      font-size: 60px;
    }
  }

  &:hover {
    &:before {
      color: black;
    }
  }
`;

const AppStimmen = () => (
  <Wrapper>
    <VoteButtons>
      <VoteButton type="thumb-up" />
      <VoteButton type="thumb-left" />
      <VoteButton type="thumb-down" />
    </VoteButtons>
    <H3>
      Um mitzustimmen, lade Dir bitte das
      <Link href="https://www.democracy-deutschland.de/" external primary>
        <b>&nbsp;10X-Improvement</b> für unsere Demokratie&nbsp;
      </Link>
      herunter
    </H3>
    <StoreLink>
      <Link
        href="https://itunes.apple.com/us/app/democracy/id1341311162"
        external
        style={{ color: 'rgb(74,74,74)' }}
      >
        <AppStoreIcon type="appstore" />
      </Link>

      <Link
        href="https://play.google.com/store/apps/details?id=de.democracydeutschland.app"
        external
        style={{ color: 'rgb(74,74,74)' }}
      >
        <AppStoreIcon type="playstore" />
      </Link>
    </StoreLink>
  </Wrapper>
);

export default AppStimmen;
