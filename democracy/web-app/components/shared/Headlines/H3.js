import styled from 'styled-components';

const Headline = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
`;

const H3 = ({ children }) => {
  return <Headline>{children}</Headline>;
};

export { H3 };
