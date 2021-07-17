import styled from 'styled-components';
import PropTypes from 'prop-types';

// Components
import ActivityIndex from 'Components/shared/ActivityIndex';
import DateTime from 'Components/shared/DateTime';
import SubjectIcon from '../shared/SubjectIcon';

const Wrapper = styled.div`
  padding: ${({ theme }) => theme.space(1)}px;
  background-color: ${({ theme }) => theme.backgrounds.primary};
  @media (min-width: ${({ theme }) => theme.responsive.mobileWidth}) {
    padding: ${({ theme }) => theme.space(3)}px;
  }
`;

const TitleRow = styled.div`
  display: flex;
  > h2 {
    flex: 1;
    word-break: break-word;
  }
`;

const SubjectGroups = styled.div`
  padding-top: ${({ theme }) => theme.space(2)}px;
  height: 100%;
`;

const CurrentStatus = styled.span`
  padding-left: ${({ theme }) => theme.space(1)}px;
`;

const Overview = ({ title, votes, subjectGroups, voteDate, currentStatus }) => (
  <Wrapper>
    <TitleRow>
      <h2>{title}</h2>
      <ActivityIndex>{votes}</ActivityIndex>
    </TitleRow>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <SubjectGroups
        style={{
          display: 'flex',
          overflow: 'hidden',
          height: '60px',
          flex: 1,
          justifyContent: 'flex-start',
        }}
      >
        <div>
          {subjectGroups.map(group => (
            <SubjectIcon
              key={group}
              group={group}
              style={{ marginRight: '6px', marginLeft: '0' }}
            />
          ))}
          <CurrentStatus>{currentStatus}</CurrentStatus>
        </div>
      </SubjectGroups>
      {voteDate && <DateTime long colored date={voteDate} />}
    </div>
  </Wrapper>
);

Overview.propTypes = {
  title: PropTypes.string.isRequired,
  votes: PropTypes.number.isRequired,
  subjectGroups: PropTypes.array.isRequired,
  voteDate: PropTypes.string,
  currentStatus: PropTypes.string.isRequired,
};

export default Overview;
