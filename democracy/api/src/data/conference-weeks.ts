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
    start: parseDate('08.11.2021'),
    end: parseDate('12.11.2021'),
  },
  {
    start: parseDate('15.11.2021'),
    end: parseDate('19.11.2021'),
  },
  {
    start: parseDate('06.12.2021'),
    end: parseDate('10.12.2021'),
  },
  {
    start: parseDate('13.12.2021'),
    end: parseDate('17.12.2021'),
  },
  {
    start: parseDate('10.01.2022'),
    end: parseDate('14.01.2022'),
  },
  {
    start: parseDate('24.01.2022'),
    end: parseDate('28.01.2022'),
  },
  {
    start: parseDate('14.02.2022'),
    end: parseDate('18.02.2022'),
  },
  {
    start: parseDate('14.03.2022'),
    end: parseDate('18.03.2022'),
  },
  {
    start: parseDate('21.03.2022'),
    end: parseDate('25.03.2022'),
  },
  {
    start: parseDate('04.04.2022'),
    end: parseDate('08.04.2022'),
  },
  {
    start: parseDate('25.04.2022'),
    end: parseDate('29.04.2022'),
  },
  {
    start: parseDate('02.05.2022'),
    end: parseDate('06.05.2022'),
  },
  {
    start: parseDate('16.05.2022'),
    end: parseDate('20.05.2022'),
  },
  {
    start: parseDate('30.05.2022'),
    end: parseDate('03.06.2022'),
  },
  {
    start: parseDate('20.06.2022'),
    end: parseDate('24.06.2022'),
  },
  {
    start: parseDate('04.07.2022'),
    end: parseDate('08.07.2022'),
  },
  {
    start: parseDate('05.09.2022'),
    end: parseDate('09.09.2022'),
  },
  {
    start: parseDate('19.09.2022'),
    end: parseDate('23.09.2022'),
  },
  {
    start: parseDate('26.09.2022'),
    end: parseDate('30.09.2022'),
  },
  {
    start: parseDate('10.10.2022'),
    end: parseDate('14.10.2022'),
  },
  {
    start: parseDate('17.10.2022'),
    end: parseDate('21.10.2022'),
  },
  {
    start: parseDate('07.11.2022'),
    end: parseDate('11.11.2022'),
  },
  {
    start: parseDate('21.11.2022'),
    end: parseDate('25.11.2022'),
  },
  {
    start: parseDate('28.11.2022'),
    end: parseDate('02.12.2022'),
  },
  {
    start: parseDate('12.12.2022'),
    end: parseDate('16.12.2022'),
  },
];

// return the current or next conference week
export const getCurrentConferenceWeek = (): {
  calendarWeek: number;
  start: Date;
  end: Date;
} => {
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
