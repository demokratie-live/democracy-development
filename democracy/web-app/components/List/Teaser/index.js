import PropTypes from 'prop-types';
import speakingurl from 'speakingurl';
import styled from 'styled-components';

// Components
import { Card as CardComponent } from 'antd';
import { ChartLegendTitle, ChartLegendDescription } from './Charts';

import SubjectIcon from '../../shared/SubjectIcon';
import Ribbon from './Ribbon';
import Time from './Time';
import Charts from './Charts';
import Link from 'Components/shared/Link';
import Title from 'Components/shared/Ellipsis';
import ActivityIndex from 'Components/shared/ActivityIndex';
import DateTime from 'Components/shared/DateTime';

// Context
import { Consumer as FilterConsumer } from 'Context/filter';
import { Consumer as SearchConsumer } from 'Context/search';

// Helpers
import { getImage } from 'Helpers/subjectGroupToIcon';

const TitleRow = styled.div`
  display: flex;
  > h2 {
    flex: 1;
  }
`;

const SubjectGroups = styled.div`
  float: right;
  margin-top: ${({ theme }) => theme.space(5)}px;
  height: 100%;
`;

const Image = styled.img`
  width: 100%;
`;

// Do not pass listType to DOM
// eslint-disable-next-line no-unused-vars
const Card = styled(({ listType, ...props }) => <CardComponent {...props} />)`
  &:hover ${Image} {
    filter: blur(2px) brightness(0.7);
  }
  &:hover ${ChartLegendTitle}, &:hover ${ChartLegendDescription} {
    display: block;
  }
`;

const ImageContainer = styled.div`
  display: block;
  height: 0;
  padding-bottom: 55%;
  overflow: hidden;
`;

const Teaser = ({
  title,
  procedureId,
  type,
  votes,
  communityVotes,
  voteDate,
  subjectGroups,
  voteResults,
  currentStatus,
  listType,
}) => (
  <SearchConsumer>
    {consumerProps => {
      if (!consumerProps) return null;
      const { changeSearchTerm } = consumerProps;
      const isCanceled = ['Zurückgezogen', 'Für erledigt erklärt'].some(s => s === currentStatus);
      return (
        <Link
          as={`/${type.toLowerCase()}/${procedureId}/${speakingurl(title)}`}
          href={`/details?id=${procedureId}&title=${speakingurl(title)}`}
          onClick={() => changeSearchTerm('')}
        >
          <article>
            <Card
              onClick={() => changeSearchTerm('')}
              hoverable
              listType={listType}
              cover={
                <>
                  {voteDate && (
                    <Time>
                      <DateTime colored date={voteDate} />
                    </Time>
                  )}
                  <ImageContainer>
                    <Image src={`${getImage(subjectGroups[0])}_648.jpg`} alt={subjectGroups[0]} />
                  </ImageContainer>
                  <Charts
                    communityVotes={communityVotes}
                    voteResults={voteResults}
                    currentStatus={currentStatus}
                    isCanceled={isCanceled}
                  />
                </>
              }
            >
              <TitleRow>
                <Title tag={'h2'} lines={3}>
                  {title}
                </Title>
                <ActivityIndex>{votes}</ActivityIndex>
              </TitleRow>

              <div style={{ display: 'flex' }}>
                <FilterConsumer>
                  {({ selectType }) => (
                    <Ribbon
                      onClick={e => {
                        e.preventDefault();
                        selectType(type);
                      }}
                    >
                      {type}
                    </Ribbon>
                  )}
                </FilterConsumer>
                <SubjectGroups
                  style={{
                    display: 'flex',
                    overflow: 'hidden',
                    height: '40px',
                    flex: 1,
                    justifyContent: 'flex-end',
                  }}
                >
                  <div>
                    <FilterConsumer>
                      {({ selectSubjectGroup }) => {
                        return subjectGroups.map(group => (
                          <SubjectIcon
                            key={group}
                            group={group}
                            onClick={e => {
                              e.preventDefault();
                              selectSubjectGroup(group);
                            }}
                          />
                        ));
                      }}
                    </FilterConsumer>
                  </div>
                </SubjectGroups>
              </div>
            </Card>
          </article>
        </Link>
      );
    }}
  </SearchConsumer>
);

Teaser.propTypes = {
  title: PropTypes.string.isRequired,
  procedureId: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  votes: PropTypes.number.isRequired,
  communityVotes: PropTypes.shape(),
  voteDate: PropTypes.string,
  subjectGroups: PropTypes.array.isRequired,
  voteResults: PropTypes.shape(),
  listType: PropTypes.string,
  currentStatus: PropTypes.string,
};

export default Teaser;
