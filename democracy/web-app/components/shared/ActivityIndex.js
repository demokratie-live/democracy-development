import styled from 'styled-components';

import IconComponent from 'Components/shared/Icon';

const Wrapper = styled.div`
  font-size: 25px;
  color: ${({ theme }) => theme.colors.inactive};
  text-align: center;
  padding: 0;
  margin-top: -10px;
  padding-left: ${({ theme }) => theme.space(2)}px;
`;

const Icon = styled(IconComponent).attrs({
  fontSize: 40,
})``;

const Text = styled.div`
  margin-top: -${({ theme }) => theme.space(1.4)}px;
`;

const ActivityIndex = ({ children }) => (
  <Wrapper>
    <Icon type="arrow" />
    <Text>{children}</Text>
  </Wrapper>
);

export default ActivityIndex;
