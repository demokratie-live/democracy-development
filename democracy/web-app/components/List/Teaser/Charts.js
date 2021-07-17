import PropTypes from 'prop-types';
import styled from 'styled-components';
import _ from 'lodash';

// Components
import PieChart from './PieChart';
import PieChartCanceled from './PieChartCanceled';

const Wrapper = styled.div`
  width: 100%;
  padding-top: 40%;
  position: relative;
  margin-top: -32%;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
`;

const ChartWrapper = styled.div`
  width: 30%;
  height: 100%;
`;

const ChartLegend = styled.div`
  text-align: center;
  color: #fff;
  padding-bottom: 8px;
  font-size: 12px;
  height: 60px;
`;

const ChartLegendTitle = styled.div`
  display: none;
  font-size: 17px;
  text-shadow: 0 0 20px #000;
`;

const ChartLegendDescription = styled.div`
  display: none;
  font-size: 12px;
  text-shadow: 0 0 10px #000;
`;

const Chart = styled.div`
  background-color: #fff;
  border-radius: 50%;
  padding: 5px;
  margin-left: 5px;
  margin-right: 5px;
`;

const TeaserCharts = ({ communityVotes, voteResults, currentStatus, isCanceled }) => {
  const hasCommunityVotes = !!communityVotes;
  const hasPartyVotes = isCanceled || (!!voteResults && (voteResults.yes > 0 || voteResults.no > 0));
  const communityVoteCount = !!communityVotes ? communityVotes.yes + communityVotes.no + communityVotes.abstination : null;
  const partyVoteCount = !!voteResults ? voteResults.yes + voteResults.no + voteResults.abstination + voteResults.notVoted : null;

  let partyVoteDesc = !!voteResults ? voteResults.namedVote ? `${partyVoteCount} Abgeordnete` : '6 Fraktionen' : null;
  partyVoteDesc = isCanceled ? currentStatus : partyVoteDesc;

  return (
    <Wrapper>
      <Container>
        {hasPartyVotes && (
          <ChartWrapper>
            <ChartLegend>
              <ChartLegendTitle>Bundestag</ChartLegendTitle>
              <ChartLegendDescription>{partyVoteDesc}</ChartLegendDescription>
            </ChartLegend>
            <Chart>
              {!isCanceled ? (
                <PieChart
                  key="partyChart"
                  data={_.map(
                    voteResults,
                    (value, label) =>
                      label !== '__typename' && typeof value === 'number'
                        ? {
                            value,
                            label,
                            fractions: voteResults.namedVote
                              ? null
                              : voteResults.partyVotes.filter(
                                  ({ main }) => label === main.toLowerCase(),
                                ).length,
                            percentage: Math.round((value / partyVoteCount) * 100),
                          }
                        : false,
                  ).filter(e => e)}
                  colorScale={['#99C93E', '#4CB0D8', '#D43194', '#B1B3B4']}
                  label="Abgeordnete"
                />
              ) : (
                <PieChartCanceled
                  colorScale={['#B1B3B4']}
                  label="Zurückgezogen"
                  showNumbers={false}
                />
              )}
            </Chart>
          </ChartWrapper>
        )}
        {hasCommunityVotes && (
          <ChartWrapper>
            <ChartLegend>
              <ChartLegendTitle>Community</ChartLegendTitle>
              <ChartLegendDescription>
                {communityVoteCount} Abstimmende
              </ChartLegendDescription>
            </ChartLegend>
            <Chart>
              <PieChart
                key="partyChart"
                data={_.map(
                  communityVotes,
                  (value, label) =>
                    label !== '__typename' && typeof value === 'number'
                      ? {
                          value,
                          label,
                          fractions: null,
                          percentage: Math.round((value / communityVoteCount) * 100),
                        }
                      : false,
                ).filter(e => e)}
                colorScale={['#15C063', '#2C82E4', '#EC3E31']}
                label="Abgeordnete"
              />
            </Chart>
          </ChartWrapper>
        )}
      </Container>
    </Wrapper>
  );
};

TeaserCharts.propTypes = {
  communityVotes: PropTypes.shape(),
  voteResults: PropTypes.shape(),
  currentStatus: PropTypes.string,
  isCanceled: PropTypes.bool,
};

export default TeaserCharts;
export { ChartLegendTitle, ChartLegendDescription };
