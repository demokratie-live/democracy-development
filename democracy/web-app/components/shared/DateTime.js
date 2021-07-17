import PropTypes from 'prop-types';
import styled from 'styled-components';
import m from 'moment';
import _ from 'lodash';

const formatDate = (date, long) => {
  if (date) {
    if (date <= new Date()) {
      return m(date).format('DD.MM.YY');
    }
    const daysDate = m(date).endOf('day');
    const days = Math.floor(m.duration(daysDate.diff(m())).asDays());

    if (days > 1) {
      if (long) {
        return `Abstimmung in ${days} Tagen`;
      }
      return `${days} Tage`;
    } else if (days === 1) {
      if (long) {
        return `Abstimmung morgen`;
      }
      return `morgen`;
    }

    const hours = Math.floor(m.duration(m(date).diff(m())).asMinutes() / 60);
    const minutes = _.padStart(
      `${Math.floor(((m.duration(m(date).diff(m())).asMinutes() / 60) % 1) * 60)}`,
      2,
      '0',
    );
    return `${hours}:${minutes}`;
  }
  return null;
};

const Time = styled.time`
  color: ${({ dateTime, soon, colored }) => {
    if (!colored) {
      return 'inherit';
    }
    if (soon) {
      return '#f5a623';
    } else if (new Date(dateTime) > new Date()) {
      return '#20a736';
    }
    return 'red';
  }};
`;

const DateTime = ({ date, long, fallback, style, colored }) => {
  const localDate = new Date(date);
  localDate.setTime(localDate.getTime() + new Date(date).getTimezoneOffset() * 1000 * 60);
  return (
    <Time
      dateTime={localDate}
      style={style}
      soon={
        formatDate(new Date(localDate)) === 'morgen' ||
        formatDate(new Date(localDate)).indexOf(':') !== -1
      }
      colored={colored}
    >
      {date ? formatDate(new Date(localDate), long) : fallback}
    </Time>
  );
};

DateTime.propTypes = {
  date: PropTypes.string.isRequired,
  fallback: PropTypes.string,
  style: PropTypes.shape(),
  colored: PropTypes.bool,
  long: PropTypes.bool,
};

DateTime.defaultProps = {
  fallback: '',
  style: {},
  colored: false,
  long: false,
};

export default DateTime;
