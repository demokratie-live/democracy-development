import styled from 'styled-components';

// Components
import DateTime from 'Components/shared/DateTime';

const DefinitionLists = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  dt:not(:first-child) {
    padding-top: ${({ theme }) => theme.space(1)}px;
  }
`;

const DefinitionList = styled.dl`
  flex: 1;
`;

const DT = styled.dt`
  color: ${({ theme }) => theme.colors.highlight};
  padding-right: ${({ theme }) => theme.space(1)}px;
`;

const DD = styled.dd`
  margin: 0;
`;

const Table = styled.table``;

const TR = styled.tr``;

const H4 = styled.h4`
  color: ${({ theme }) => theme.colors.highlight};
`;

const TH = styled.th`
  font-weight: normal;
  text-align: right;
  color: ${({ theme }) => theme.colors.highlight};
  padding-right: ${({ theme }) => theme.space(1)}px;
`;

const TD = styled.td``;

const DetailsPanel = ({
  subjectGroups,
  currentStatus,
  type,
  procedureId,
  submissionDate,
  voteDate,
  abstract,
}) => (
  <>
    <DefinitionLists>
      <DefinitionList>
        <DT>Sachgebiete</DT>
        {subjectGroups.map(subjectGroup => (
          <DD key={subjectGroup}>{subjectGroup}</DD>
        ))}
        <DT>Aktueller Stand</DT>
        <DD>{currentStatus}</DD>
      </DefinitionList>
      <Table>
        <tbody>
          <TR>
            <TH>Typ</TH>
            <TD>{type}</TD>
          </TR>
          <TR>
            <TH>Vorgang</TH>
            <TD>{procedureId}</TD>
          </TR>
          <TR>
            <TH>erstellt am</TH>
            <TD>
              <DateTime date={submissionDate} />
            </TD>
          </TR>
          {voteDate && (
            <TR>
              <TH>Abstimmung</TH>
              <TD>
                <DateTime colored date={voteDate} />
              </TD>
            </TR>
          )}
        </tbody>
      </Table>
    </DefinitionLists>

    <H4>Inhalt</H4>
    {abstract}
  </>
);

export default DetailsPanel;
