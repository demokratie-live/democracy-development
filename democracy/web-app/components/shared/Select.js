import { Select as SelectComponent } from 'antd';
import styled from 'styled-components';

const Select = styled(SelectComponent)`
  font-size: ${({ theme }) => theme.fontSizes.default};

  & .ant-select-selection {
    border: 0;
    box-shadow: none;
    & .ant-select-arrow {
      color: ${({ theme }) => theme.colors.primary};
      font-size: ${({ theme }) => theme.fontSizes.small};
      font-weight: bold;
      top: 14px;
    }
  }

  & .ant-select-selection__rendered {
    float: left;

    &:before {
      font-family: icons !important;
      padding-right: 10px;
      content: '${({ prefix }) => prefix}';
      display: block;
      float: left;
    }
  }
`;

export default Select;
