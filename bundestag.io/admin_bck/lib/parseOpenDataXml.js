// TODO replace this package with xml2json again once the library is fixed
var parser = require("p3x-xml2json");
var fs = require("fs");

function parseDate(input) {
  if (input.length > 1) {
    var parts = input.match(/(\d+)/g);
    // note parts[1]-1
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
}

const analyseWahlperioden = wahlperioden => {
  let tmp = [];
  if (Array.isArray(wahlperioden)) {
    wahlperioden.forEach(wahlperiode => {
      tmp.push(analyseWahlperiode(wahlperiode));
    });
  } else {
    tmp.push(analyseWahlperiode(wahlperioden));
  }
  return tmp;
};

const analyseWahlperiode = ({ WP, MDBWP_VON, MDBWP_BIS, INSTITUTIONEN }) => {
  return {
    number: parseInt(WP, 10),
    start: parseDate(MDBWP_VON),
    end: parseDate(MDBWP_BIS) || null,
    deputies: 0,
    fractions: [getFraction(INSTITUTIONEN, parseInt(WP, 10))]
  };
};

const getFraction = institution => {
  if (institution) {
    let fraction = false;
    if (Array.isArray(institution.INSTITUTION)) {
      // Log multiple fractions
      // if (
      //   institution.INSTITUTION.filter(
      //     ({ INSART_LANG }) => INSART_LANG === "Fraktion/Gruppe"
      //   ).length > 1
      // ) {
      //   console.log(institution.INSTITUTION);
      // }
      fraction = institution.INSTITUTION.find(
        ({ INSART_LANG }) => INSART_LANG === "Fraktion/Gruppe"
      );
    } else {
      fraction = institution.INSTITUTION;
    }

    if (fraction) {
      return fraction.INS_LANG;
    }

    return "fraktionslos";
  }
};

fs.readFile("./files/MDB_STAMMDATEN.XML", "utf8", (err, data) => {
  var json = parser.toJson(data, {
    object: true
  });

  let periods = [];
  let parties = [];

  json.DOCUMENT.MDB.forEach(
    ({ WAHLPERIODEN: { WAHLPERIODE: wahlperioden }, NAMEN }) => {
      if (Array.isArray(NAMEN.NAME)) {
        console.log(NAMEN.NAME);
      }
      const periodDataArray = analyseWahlperioden(wahlperioden);
      periodDataArray.forEach(periodData => {
        const index = periods.findIndex(
          ({ number }) => number === periodData.number
        );
        if (index === -1) {
          periods.push(periodData);
        } else {
          if (periods[index].start > periodData.start) {
            periods[index].start = periodData.start;
          }
          if (periods[index].end < periodData.end) {
            periods[index].end = periodData.end;
          }
          if (!periods[index].fractions.includes(periodData.fractions[0])) {
            periods[index].fractions.push(periodData.fractions[0]);
          }
        }
      });
    }
  );

  const currentPeriod = Math.max.apply(
    Math,
    periods.map(o => {
      return o.number;
    })
  );

  json.DOCUMENT.MDB.forEach(
    ({ BIOGRAFISCHE_ANGABEN, WAHLPERIODEN: { WAHLPERIODE: wahlperioden } }) => {
      const periodDataArray = analyseWahlperioden(wahlperioden);
      periodDataArray.forEach(periodData => {
        const index = periods.findIndex(
          ({ number }) => number === periodData.number
        );
        if (periodData.number === currentPeriod) {
          if (periods[index].start.getTime() === periodData.start.getTime()) {
            periods[index].deputies += 1;

            // Handle parties
            const partyIndex = parties.findIndex(
              ({ name, period }) =>
                name === BIOGRAFISCHE_ANGABEN.PARTEI_KURZ &&
                period === periodData.number
            );
            if (partyIndex !== -1) {
              parties[partyIndex].members += 1;
            } else {
              parties.push({
                name: BIOGRAFISCHE_ANGABEN.PARTEI_KURZ,
                members: 1,
                period: periodData.number
              });
            }
          }
        } else {
          if (periods[index].end.getTime() === periodData.end.getTime()) {
            periods[index].deputies += 1;

            // Handle parties
            const partyIndex = parties.findIndex(
              ({ name, period }) =>
                name === BIOGRAFISCHE_ANGABEN.PARTEI_KURZ &&
                period === periodData.number
            );
            if (partyIndex !== -1) {
              parties[partyIndex].members += 1;
            } else {
              parties.push({
                name: BIOGRAFISCHE_ANGABEN.PARTEI_KURZ,
                members: 1,
                period: periodData.number
              });
            }
          }
        }
      });
    }
  );

  // console.log(periods);
  // parties.forEach(party => console.log(party));
});
