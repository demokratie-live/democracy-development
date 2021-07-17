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

const VoteResultsPanel = ({ colorScale }) => {
  return (
    <Wrapper>
      <svg
        viewBox="0 0 400 400"
        style={{
          width: '100%',
          height: 'auto',
        }}
      >
        <VictoryPie
          standalone={false}
          allowZoom={false}
          colorScale={colorScale}
          data={[{ x: 'Canceled', y: 1 }]}
          padding={0}
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
  colorScale: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default VoteResultsPanel;
