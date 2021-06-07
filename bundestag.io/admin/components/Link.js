import Link from "next/link";
import styled from "styled-components";
import { withRouter } from "next/router";

const A = styled.a`
  font-size: 14px;
  margin-right: 15px;
  text-decoration: ${({ active }) => (active ? "underline" : "none")};
`;

const LinkA = ({ router: { pathname }, href, prefetch = true, children }) => {
  return (
    <Link prefetch={prefetch} href={href}>
      <A active={pathname === href} href={href}>
        {children}
      </A>
    </Link>
  );
};

export default withRouter(LinkA);
