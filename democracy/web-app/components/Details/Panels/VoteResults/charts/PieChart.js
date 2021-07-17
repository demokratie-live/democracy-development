import PropTypes from 'prop-types';
import styled from 'styled-components';

// Components
import { VictoryPie } from 'victory';

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const CheckIcon = styled.svg`
  position: relative;
  left: 200px;
`;

const VoteResultsPanel = ({ data, colorScale }) => {
  const preparedData = data.map(o => {
    switch (o.label) {
      case 'yes':
        return { ...o, sortKey: 1 };
      case 'abstination':
        return { ...o, sortKey: 2 };
      case 'no':
        return { ...o, sortKey: 3 };
      default:
        return { ...o, sortKey: 4 };
    }
  });
  let voteResultColor = '#65AFD4';
  if (
    preparedData.find(({ label }) => label === 'yes').percentage >
    preparedData.find(({ label }) => label === 'no').percentage
  ) {
    voteResultColor = '#99C93E';
  } else if (
    preparedData.find(({ label }) => label === 'yes').percentage <
    preparedData.find(({ label }) => label === 'no').percentage
  ) {
    voteResultColor = '#D43194';
  }

  return (
    <Wrapper>
      <svg
        viewBox="0 0 400 400"
        style={{
          width: '100%',
          height: 'auto',
        }}
      >
        <CheckIcon
          viewBox="64 64 896 896"
          data-icon="check"
          width="50"
          height="50"
          fill={voteResultColor}
          aria-hidden="true"
          x="175"
          y="175"
        >
          {preparedData.find(({ label }) => label === 'yes').percentage >
            preparedData.find(({ label }) => label === 'no').percentage && (
            <g>
              <path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z" />
            </g>
          )}
          {preparedData.find(({ label }) => label === 'yes').percentage <
            preparedData.find(({ label }) => label === 'no').percentage && (
            <g>
              <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z" />
            </g>
          )}
          {preparedData.find(({ label }) => label === 'yes').percentage ===
            preparedData.find(({ label }) => label === 'no').percentage && (
            <g>
              <path d="M304 176h80v672h-80zm408 0h-64c-4.4 0-8 3.6-8 8v656c0 4.4 3.6 8 8 8h64c4.4 0 8-3.6 8-8V184c0-4.4-3.6-8-8-8z" />
            </g>
          )}
        </CheckIcon>
        <VictoryPie
          standalone={false}
          allowZoom={false}
          colorScale={colorScale}
          data={preparedData.map((entry, index) => ({
            x: index,
            y: entry.value,
            label: entry.percentage >= 5 ? `${entry.percentage}%` : ' ',
            sortKey: entry.sortKey,
          }))}
          sortKey="sortKey"
          padding={5}
          width={400}
          height={400}
          innerRadius={400 / 5.6}
          labelRadius={400 / 4}
          style={{
            labels: {
              display: 'none',
            },
          }}
        />
      </svg>
    </Wrapper>
  );
};

VoteResultsPanel.propTypes = {
  data: PropTypes.array.isRequired,
  colorScale: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default VoteResultsPanel;
