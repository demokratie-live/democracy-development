import { Component } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { VictoryChart, VictoryBar, VictoryStack, VictoryAxis } from 'victory';

const VoteResultsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const VoteResultsPieWrapper = styled.div.attrs({
  pointerEvents: 'none',
})``;

class PartyChart extends Component {
  prepareChartData = data => {
    const chartData = data.reduce(
      (prev, party) => {
        const { yes, abstination, no, notVoted } = party.value;
        const total = yes + abstination + no + notVoted;
        // yes
        prev[0].push({
          x: party.label,
          y: party.value.yes / total,
          fillColor: '#99c93e',
        });
        // abstination
        prev[1].push({
          x: party.label,
          y: party.value.abstination / total,
          fillColor: '#4cb0d8',
        });
        // no
        prev[2].push({
          x: party.label,
          y: party.value.no / total,
          fillColor: '#d43194',
        });
        // notVoted
        prev[3].push({
          x: party.label,
          y: party.value.notVoted / total,
          fillColor: '#b1b3b4',
        });
        // nix
        return prev;
      },
      [[], [], [], []],
    );
    return chartData;
  };

  render() {
    const { data } = this.props;
    const dataSet = this.prepareChartData(data);
    return (
      <VoteResultsWrapper>
        <VoteResultsPieWrapper>
          <VictoryChart height={440} padding={{ left: 80, top: 20, bottom: 20, right: 20 }}>
            <VictoryStack horizontal>
              {dataSet.map(chartData => (
                <VictoryBar
                  padding={5}
                  key={chartData[0].y}
                  barRatio={0.7}
                  data={chartData.reverse()}
                  style={{
                    data: {
                      fill: d => {
                        return d.fillColor;
                      },
                    },
                    labels: {
                      axis: { stroke: 'none' },
                    },
                  }}
                />
              ))}
            </VictoryStack>
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: 'none' },
                tickLabels: { fontWeight: '100', padding: 15 },
              }}
            />
          </VictoryChart>
        </VoteResultsPieWrapper>
      </VoteResultsWrapper>
    );
  }
}

PartyChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  colorScale: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  showNumbers: PropTypes.bool,
};

PartyChart.defaultProps = {
  showNumbers: true,
};

export default PartyChart;
