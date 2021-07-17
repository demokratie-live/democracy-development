import PropTypes from 'prop-types';
import styled from 'styled-components';

const VoteResultNumbers = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  max-width: 464px;
  padding-top: 18px;
  flex-direction: row;
  justify-content: space-around;
`;

const VoteResult = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const VoteResultCircleNumber = styled.div`
  display: flex;
  flex-direction: row;
`;

const VoteResultNumber = styled.span`
  color: #4a4a4a;
  font-size: 12px;
`;
const VoteResultLabel = styled.span`
  color: rgb(142, 142, 147);
  font-size: 10px;
`;

const VoteResultCircle = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${props => props.color};
  margin-top: 3px;
  margin-right: 5px;
`;

const ResultNumbers = props => {
  const { data, colorScale, ...restProps } = props;

  const getTotals = data => {
    const {
      voteResults: { namedVote },
    } = props;
    const totals = data.reduce(
      (prev, party) => {
        const { yes, abstination, no, notVoted } = party.value;
        if (namedVote) {
          return {
            yes: prev.yes + yes,
            abstination: prev.abstination + abstination,
            no: prev.no + no,
            notVoted: prev.notVoted + notVoted,
          };
        }
        return {
          yes: prev.yes + (yes === Math.max(yes, abstination, no, notVoted) ? 1 : 0),
          abstination:
            prev.abstination + (abstination === Math.max(yes, abstination, no, notVoted) ? 1 : 0),
          no: prev.no + (no === Math.max(yes, abstination, no, notVoted) ? 1 : 0),
          notVoted: prev.notVoted + (notVoted === Math.max(yes, abstination, no, notVoted) ? 1 : 0),
        };
      },
      { yes: 0, abstination: 0, no: 0, notVoted: 0 },
    );

    const totalsResult = [
      {
        label: 'yes',
        value: totals.yes,
      },
      {
        label: 'abstination',
        value: totals.abstination,
      },
      {
        label: 'no',
        value: totals.no,
      },
    ];
    if (totals.notVoted) {
      totalsResult.push({
        label: 'notVoted',
        value: totals.notVoted,
      });
    }

    return totalsResult;
  };

  const getLabel = label => {
    const labels = {
      yes: 'Zustimmungen',
      abstination: 'Enthaltungen',
      no: 'Ablehnungen',
      notVoted: 'Nicht abg.',
    };
    return labels[label] || label;
  };

  const getColor = (label, colors) => {
    switch (label) {
      case 'yes':
        return colors[0];
      case 'abstination':
        return colors[1];
      case 'no':
        return colors[2];
      default:
        return colors[3];
    }
  };

  return (
    <VoteResultNumbers {...restProps}>
      {getTotals(data).map(entry => (
        <VoteResult key={entry.label}>
          <VoteResultCircleNumber>
            <VoteResultCircle color={getColor(entry.label, colorScale)} />
            <VoteResultNumber>{entry.value !== null ? entry.value : '?'}</VoteResultNumber>
          </VoteResultCircleNumber>
          <VoteResultLabel>{getLabel(entry.label)}</VoteResultLabel>
        </VoteResult>
      ))}
    </VoteResultNumbers>
  );
};

ResultNumbers.propTypes = {
  data: PropTypes.array.isRequired,
  colorScale: PropTypes.array.isRequired,
  voteResults: PropTypes.shape().isRequired,
};

export default ResultNumbers;
