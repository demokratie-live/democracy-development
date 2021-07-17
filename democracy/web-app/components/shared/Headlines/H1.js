import styled from 'styled-components';

const Headline = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
`;

const H1 = ({ children }) => {
  return <Headline>{children}</Headline>;
};

export { H1 };
