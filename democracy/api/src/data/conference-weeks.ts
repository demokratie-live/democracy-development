// TODO replace this with a scraper for automatiation

// convert german date to js Date
function parseDate(input: string): Date {
  const parts = input.match(/(\d+)/g);
  if (parts) {
    const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));

    // fix german time
    date.setHours(date.getHours() + 2);
    return date;
  }
  throw new Error('Error in conference-weeks');
}

const getWeekNumber = (d: Date) => {
  // Copy date so don't modify original
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  // Return array of year and week number
  //   return [date.getUTCFullYear(), weekNo];
  return weekNo;
};

const conferenceWeeks = [
  {
    start: parseDate('13.01.2020'),
    end: parseDate('17.01.2020'),
  },
  {
    start: parseDate('27.01.2020'),
    end: parseDate('31.01.2020'),
  },
  {
    start: parseDate('10.02.2020'),
    end: parseDate('14.02.2020'),
  },
  {
    start: parseDate('02.03.2020'),
    end: parseDate('06.03.2020'),
  },
  {
    start: parseDate('09.03.2020'),
    end: parseDate('13.03.2020'),
  },
  {
    start: parseDate('23.03.2020'),
    end: parseDate('27.03.2020'),
  },
  {
    start: parseDate('20.04.2020'),
    end: parseDate('24.04.2020'),
  },
  {
    start: parseDate('04.05.2020'),
    end: parseDate('07.05.2020'),
  },
  {
    start: parseDate('11.05.2020'),
    end: parseDate('15.05.2020'),
  },
  {
    start: parseDate('25.05.2020'),
    end: parseDate('29.05.2020'),
  },
  {
    start: parseDate('15.06.2020'),
    end: parseDate('19.06.2020'),
  },
  {
    start: parseDate('29.06.2020'),
    end: parseDate('03.07.2020'),
  },
  {
    start: parseDate('07.09.2020'),
    end: parseDate('11.09.2020'),
  },
  {
    start: parseDate('14.09.2020'),
    end: parseDate('18.09.2020'),
  },
  {
    start: parseDate('28.09.2020'),
    end: parseDate('02.10.2020'),
  },
  {
    start: parseDate('05.10.2020'),
    end: parseDate('09.10.2020'),
  },
  {
    start: parseDate('26.10.2020'),
    end: parseDate('30.10.2020'),
  },
  {
    start: parseDate('02.11.2020'),
    end: parseDate('06.11.2020'),
  },
  {
    start: parseDate('16.11.2020'),
    end: parseDate('20.11.2020'),
  },
  {
    start: parseDate('23.11.2020'),
    end: parseDate('27.11.2020'),
  },
  {
    start: parseDate('07.12.2020'),
    end: parseDate('11.12.2020'),
  },
  {
    start: parseDate('14.12.2020'),
    end: parseDate('18.12.2020'),
  },
];

// return the current or next conference week
export const getCurrentConferenceWeek = () => {
  const curDate = new Date();

  // find actual or return undefined
  const currentConferenceWeek = conferenceWeeks.find(({ start, end }) => {
    return curDate > start && curDate < end;
  });
  // if there is one running return
  if (currentConferenceWeek) {
    return { ...currentConferenceWeek, calendarWeek: getWeekNumber(currentConferenceWeek.start) };
  }

  // else return next conference week
  const nextConferenceWeek = conferenceWeeks.find(({ start }) => {
    return curDate < start;
  });
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return { ...nextConferenceWeek, calendarWeek: getWeekNumber(nextConferenceWeek!.start) };
};
