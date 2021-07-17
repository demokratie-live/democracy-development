import { Component } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { VictoryChart, VictoryBar, VictoryStack, VictoryAxis, VictoryLabel } from 'victory';

const VoteResultsWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
`;

const VoteResultsPieWrapper = styled.div.attrs({
  pointerEvents: 'none',
})``;

class BarChart extends Component {
  getPartyColor = party => {
    switch (party) {
      case 'Union':
        return '#4b4b4b';
      case 'SPD':
        return '#ed170d';
      case 'AfD':
        return '#18a7d8';
      case 'FDP':
        return '#ffd32c';
      case 'Linke':
        return '#aa4581';
      case 'Grüne':
        return '#34ac14';
      default:
        return 'grey';
    }
  };

  prepareChartData = data => {
    const chartData = data.map(party => {
      const { yes, abstination, no, notVoted } = party.value;
      const result = [
        {
          x: 'Zustimmungen',
          y: yes,
          fillColor: this.getPartyColor(party.label),
          party: party.label,
        },
        {
          x: 'Enthaltungen',
          y: abstination,
          fillColor: this.getPartyColor(party.label),
          party: party.label,
        },
        {
          x: 'Ablehnungen',
          y: no,
          fillColor: this.getPartyColor(party.label),
          party: party.label,
        },
      ];

      if (notVoted) {
        result.push({
          x: 'Nicht abg.',
          y: notVoted,
          fillColor: this.getPartyColor(party.label),
          party: party.label,
        });
      }

      return result;
    });
    return chartData;
  };

  labelStyle = () => ({
    display: 'blue',
  });

  render() {
    const { data } = this.props;
    const dataSet = this.prepareChartData(data);
    return (
      <VoteResultsWrapper>
        <VoteResultsPieWrapper>
          <VictoryChart height={465} padding={{ left: 50, bottom: 25, right: 50 }}>
            <VictoryStack>
              {dataSet.map(chartData => (
                <VictoryBar
                  padding={5}
                  key={chartData[0].y}
                  barRatio={1.5}
                  data={chartData}
                  labels={d => {
                    if (d.y >= 40) {
                      return d.party;
                    }
                    return '';
                  }}
                  labelComponent={<VictoryLabel dy={30} />}
                  style={{
                    labels: { fill: 'white' },
                    data: {
                      fill: d => {
                        if (!d.fillColor) {
                          // console.log("STYLE VictoryBar", d);
                        }
                        return d.fillColor;
                      },
                    },
                  }}
                />
              ))}
            </VictoryStack>
            <VictoryAxis
              style={{
                axis: { stroke: 'none' },
                tickLabels: { display: 'none', bfontWeight: '100', padding: 5 },
              }}
            />
          </VictoryChart>
        </VoteResultsPieWrapper>
      </VoteResultsWrapper>
    );
  }
}

BarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  colorScale: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  showNumbers: PropTypes.bool,
};

BarChart.defaultProps = {
  showNumbers: true,
};

export default BarChart;
