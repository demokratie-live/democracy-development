const createDateFormatter = (locale: string) => {
  const formatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return (date: Date) => formatter.format(date);
};

const formatGermanDate = createDateFormatter('de-DE');

export { createDateFormatter, formatGermanDate };
