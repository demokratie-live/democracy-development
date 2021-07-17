import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Timeline } from 'antd';

const Wrapper = styled.div`
  padding-top: ${({ theme }) => theme.space(1)}px;
`;

const Dot = styled.div`
  width: 17px;
  height: 17px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
`;

const History = ({ currentStatusHistory, currentStatus }) => {
  return (
    <Wrapper>
      <Timeline>
        {currentStatusHistory.map(status => {
          let color = currentStatus === status ? '#0076ff' : '#4494d3';
          if (status === '2. Beratung / 3. Beratung' || status === '1. Beratung') {
            color = '#9b9b9b';
          }
          return (
            <Timeline.Item dot={<Dot color={color} />} color={color} key={status}>
              {status}
            </Timeline.Item>
          );
        })}
      </Timeline>
    </Wrapper>
  );
};

History.propTypes = {
  currentStatusHistory: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentStatus: PropTypes.string.isRequired,
};

export default History;
