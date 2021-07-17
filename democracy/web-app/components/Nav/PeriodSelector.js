import styled from 'styled-components';

// Components
import SelectComponent from 'Components/shared/Select';

const Select = styled(SelectComponent).attrs({})`
  margin-left: -${({ theme }) => theme.space(4)}px;
  padding-left: ${({ theme }) => theme.space(4)}px;
  margin-bottom: ${({ theme }) => theme.space(0.5)}px;

  .ant-select-selection__rendered {
    margin-left: 0;
  }
`;

const Option = styled(SelectComponent.Option)`
  padding-left: ${({ theme }) => theme.space(4)}px;
  background-color: red;
  height: 50px !important;
`;

const OptionContent = styled.div`
  text-align: right;
  padding-right: 30px;
`;

const PeriodSelector = () => {
  //
  return (
    <Select defaultValue="19. Bundestag (2017-2021)" dropdownClassName="select-dropdown-period">
      <Option value="19">
        <OptionContent>19. Bundestag (2017-2021)</OptionContent>
      </Option>
    </Select>
  );
};

export default PeriodSelector;
