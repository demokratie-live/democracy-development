import styled from 'styled-components';

// Components
import MobileNavButton from './MobileNavButton';

const Mobile = styled(MobileNavButton)`
  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    display: none;
  }
`;

const Desktop = styled.div`
  display: none;
  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    display: block;
  }
`;

export { Mobile, Desktop };
