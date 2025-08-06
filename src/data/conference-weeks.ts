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
  // 2023
  {
    start: parseDate('16.01.2023'),
    end: parseDate('20.01.2023'),
  },
  {
    start: parseDate('23.01.2023'),
    end: parseDate('27.01.2023'),
  },
  {
    start: parseDate('06.02.2023'),
    end: parseDate('10.02.2023'),
  },
  {
    start: parseDate('27.02.2023'),
    end: parseDate('03.03.2023'),
  },
  {
    start: parseDate('13.03.2023'),
    end: parseDate('17.03.2023'),
  },
  {
    start: parseDate('27.03.2023'),
    end: parseDate('31.03.2023'),
  },
  {
    start: parseDate('17.04.2023'),
    end: parseDate('21.04.2023'),
  },
  {
    start: parseDate('24.04.2023'),
    end: parseDate('28.04.2023'),
  },
  {
    start: parseDate('08.05.2023'),
    end: parseDate('12.05.2023'),
  },
  {
    start: parseDate('22.05.2023'),
    end: parseDate('26.05.2023'),
  },
  {
    start: parseDate('12.06.2023'),
    end: parseDate('16.06.2023'),
  },
  {
    start: parseDate('19.06.2023'),
    end: parseDate('23.06.2023'),
  },
  {
    start: parseDate('03.07.2023'),
    end: parseDate('07.07.2023'),
  },
  {
    start: parseDate('04.09.2023'),
    end: parseDate('08.09.2023'),
  },
  {
    start: parseDate('18.09.2023'),
    end: parseDate('22.09.2023'),
  },
  {
    start: parseDate('25.09.2023'),
    end: parseDate('29.09.2023'),
  },
  {
    start: parseDate('09.10.2023'),
    end: parseDate('13.10.2023'),
  },
  {
    start: parseDate('16.10.2023'),
    end: parseDate('20.10.2023'),
  },
  {
    start: parseDate('06.11.2023'),
    end: parseDate('10.11.2023'),
  },
  {
    start: parseDate('13.11.2023'),
    end: parseDate('17.11.2023'),
  },
  {
    start: parseDate('27.11.2023'),
    end: parseDate('01.12.2023'),
  },
  {
    start: parseDate('11.12.2023'),
    end: parseDate('15.12.2023'),
  },
  // https://www.bundestag.de/parlament/plenum/sitzungskalender/bt2024-941110
  {
    start: parseDate('15.01.2024'),
    end: parseDate('19.01.2024'),
  },
  {
    start: parseDate('29.01.2024'),
    end: parseDate('02.02.2024'),
  },
  {
    start: parseDate('19.02.2024'),
    end: parseDate('23.02.2024'),
  },
  {
    start: parseDate('11.03.2024'),
    end: parseDate('15.03.2024'),
  },
  {
    start: parseDate('18.03.2024'),
    end: parseDate('22.03.2024'),
  },
  {
    start: parseDate('08.04.2024'),
    end: parseDate('12.04.2024'),
  },
  {
    start: parseDate('22.04.2024'),
    end: parseDate('26.04.2024'),
  },
  {
    start: parseDate('13.05.2024'),
    end: parseDate('17.05.2024'),
  },
  {
    start: parseDate('03.06.2024'),
    end: parseDate('07.06.2024'),
  },
  {
    start: parseDate('10.06.2024'),
    end: parseDate('14.06.2024'),
  },
  {
    start: parseDate('24.06.2024'),
    end: parseDate('28.06.2024'),
  },
  {
    start: parseDate('01.07.2024'),
    end: parseDate('05.07.2024'),
  },
  {
    start: parseDate('09.09.2024'),
    end: parseDate('13.09.2024'),
  },
  {
    start: parseDate('23.09.2024'),
    end: parseDate('27.09.2024'),
  },
  {
    start: parseDate('07.10.2024'),
    end: parseDate('11.10.2024'),
  },
  {
    start: parseDate('14.10.2024'),
    end: parseDate('18.10.2024'),
  },
  {
    start: parseDate('04.11.2024'),
    end: parseDate('08.11.2024'),
  },
  {
    start: parseDate('11.11.2024'),
    end: parseDate('15.11.2024'),
  },
  {
    start: parseDate('25.11.2024'),
    end: parseDate('29.11.2024'),
  },
  {
    start: parseDate('02.12.2024'),
    end: parseDate('06.12.2024'),
  },
  {
    start: parseDate('16.12.2024'),
    end: parseDate('20.12.2024'),
  },
  // 2025
  {
    start: parseDate('27.01.2025'),
    end: parseDate('31.01.2025'),
  },
  {
    start: parseDate('10.02.2025'),
    end: parseDate('11.02.2025'),
  },
  {
    start: parseDate('25.03.2025'),
    end: parseDate('25.03.2025'),
  },
  {
    start: parseDate('12.05.2025'),
    end: parseDate('16.05.2025'),
  },
  {
    start: parseDate('19.05.2025'),
    end: parseDate('23.05.2025'),
  },
  {
    start: parseDate('02.06.2025'),
    end: parseDate('06.06.2025'),
  },
  {
    start: parseDate('23.06.2025'),
    end: parseDate('27.06.2025'),
  },
  {
    start: parseDate('07.07.2025'),
    end: parseDate('11.07.2025'),
  },
  {
    start: parseDate('08.09.2025'),
    end: parseDate('12.09.2025'),
  },
  {
    start: parseDate('15.09.2025'),
    end: parseDate('18.09.2025'),
  },
  {
    start: parseDate('22.09.2025'),
    end: parseDate('26.09.2025'),
  },
  {
    start: parseDate('06.10.2025'),
    end: parseDate('10.10.2025'),
  },
  {
    start: parseDate('13.10.2025'),
    end: parseDate('17.10.2025'),
  },
  {
    start: parseDate('03.11.2025'),
    end: parseDate('07.11.2025'),
  },
  {
    start: parseDate('10.11.2025'),
    end: parseDate('14.11.2025'),
  },
  {
    start: parseDate('24.11.2025'),
    end: parseDate('28.11.2025'),
  },
  {
    start: parseDate('01.12.2025'),
    end: parseDate('05.12.2025'),
  },
  {
    start: parseDate('15.12.2025'),
    end: parseDate('19.12.2025'),
  },
  // https://www.bundestag.de/parlament/plenum/sitzungskalender/bt2026-1084980
  {
    start: parseDate('12.01.2026'),
    end: parseDate('16.01.2026'),
  },
  {
    start: parseDate('26.01.2026'),
    end: parseDate('30.01.2026'),
  },
  {
    start: parseDate('23.02.2026'),
    end: parseDate('27.02.2026'),
  },
  {
    start: parseDate('02.03.2026'),
    end: parseDate('06.03.2026'),
  },
  {
    start: parseDate('16.03.2026'),
    end: parseDate('20.03.2026'),
  },
  {
    start: parseDate('23.03.2026'),
    end: parseDate('27.03.2026'),
  },
  {
    start: parseDate('13.04.2026'),
    end: parseDate('17.04.2026'),
  },
  {
    start: parseDate('20.04.2026'),
    end: parseDate('24.04.2026'),
  },
  {
    start: parseDate('04.05.2026'),
    end: parseDate('08.05.2026'),
  },
  {
    start: parseDate('18.05.2026'),
    end: parseDate('22.05.2026'),
  },
  {
    start: parseDate('08.06.2026'),
    end: parseDate('12.06.2026'),
  },
  {
    start: parseDate('22.06.2026'),
    end: parseDate('26.06.2026'),
  },
  {
    start: parseDate('06.07.2026'),
    end: parseDate('10.07.2026'),
  },
  {
    start: parseDate('07.09.2026'),
    end: parseDate('11.09.2026'),
  },
  {
    start: parseDate('21.09.2026'),
    end: parseDate('25.09.2026'),
  },
  {
    start: parseDate('05.10.2026'),
    end: parseDate('09.10.2026'),
  },
  {
    start: parseDate('12.10.2026'),
    end: parseDate('16.10.2026'),
  },
  {
    start: parseDate('02.11.2026'),
    end: parseDate('06.11.2026'),
  },
  {
    start: parseDate('09.11.2026'),
    end: parseDate('13.11.2026'),
  },
  {
    start: parseDate('23.11.2026'),
    end: parseDate('27.11.2026'),
  },
  {
    start: parseDate('07.12.2026'),
    end: parseDate('11.12.2026'),
  },
  {
    start: parseDate('14.12.2026'),
    end: parseDate('18.12.2026'),
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
