import styled from 'styled-components';

const Headline = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
`;

const H2 = ({ children }) => {
  return <Headline>{children}</Headline>;
};

export { H2 };
