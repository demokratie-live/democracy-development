const Scraper = require("dip21-scraper");
const scraper = new Scraper();

const program = require("commander");
const inquirer = require("inquirer");
const _progress = require("cli-progress");
const jsonfile = require("jsonfile");
const fs = require("fs-extra");

program
  .version("0.0.1")
  .description("Bundestag scraper")
  .option(
    "-p, --period [PeriodenNummer|Alle]",
    "Select a specified period [null]",
    null
  )
  .option(
    "-t, --operationtypes <OperationTypeNummer|Alle>",
    "Select specified OperationTypes [null]",
    null
  )
  .parse(process.argv);

async function selectPeriod(periods) {
  var selectedPeriod = program.period;
  if (!selectedPeriod) {
    const period = await inquirer.prompt({
      type: "list",
      name: "value",
      message: "Wähle eine Legislaturperiode",
      choices: periods
    });
    selectedPeriod = period.value;
  } else if (
    !periods.find(function(period) {
      return period.name === selectedPeriod;
    })
  ) {
    console.log(`'${selectedPeriod}' is not a valid option for period`);
    process.exit(1);
  }
  if (selectedPeriod === "Alle") {
    selectedPeriod = "";
  }
  console.log(`Selected Period '${selectedPeriod}'`);
  return selectedPeriod;
}

async function selectOperationTypes(operationTypes) {
  let selectedOperationTypes = [];
  if (!program.operationtypes) {
    const operationType = await inquirer.prompt({
      type: "checkbox",
      name: "values",
      message: "Wähle Vorgangstyp(en)",
      choices: operationTypes
    });
    selectedOperationTypes = operationType.values;
  } else {
    const selectedOperationTypes_proto = program.operationtypes.split(",");
    selectedOperationTypes = selectedOperationTypes_proto
      .map(sNumber => {
        const selection = operationTypes.find(
          ({ number }) => number === sNumber
        );
        if (selection) {
          return selection.value;
        }
      })
      .filter(v => v !== undefined);
  }
  return selectedOperationTypes;
}

async function finished() {
  console.log("############### FINISH ###############");
}

var barLink = new _progress.Bar(
  {
    format:
      "[{bar}] {percentage}% | ETA: {eta_formatted} | duration: {duration_formatted} | {value}/{total}"
  },
  _progress.Presets.shades_classic
);

async function startLinkProgress(sum, current) {
  console.log("Eintragslinks sammeln");

  barLink.start(sum, current);
}

async function updateLinkProgress(current) {
  barLink.update(current);
}

async function stopLinkProgress() {
  barLink.stop();
}

var barData = new _progress.Bar(
  {
    format:
      "[{bar}] {percentage}% | ETA: {eta_formatted} | duration: {duration_formatted} | {value}/{total} | {errorCounter}"
  },
  _progress.Presets.shades_classic
);

async function startDataProgress(sum, errorCounter) {
  console.log("Einträge downloaden");
  barData.start(sum, 0, errorCounter);
}

async function updateDataProgress(current, errorCounter) {
  barData.update(current, errorCounter);
}

async function stopDataProgress() {
  barData.stop();
}

async function logLinks(links) {
  jsonfile.writeFile(
    `links-${program.period}-${program.operationtypes}.json`,
    links,
    {
      spaces: 2,
      EOL: "\r\n"
    },
    err => {}
  );
}

async function logData(process, processData) {
  const directory = `files/${processData.VORGANG.WAHLPERIODE}/${
    processData.VORGANG.VORGANGSTYP
  }`;
  await fs.ensureDir(directory);
  jsonfile.writeFile(
    `${directory}/${process}.json`,
    processData,
    {
      spaces: 2,
      EOL: "\r\n"
    },
    err => {}
  );
}

function doScrape({ id, url, date }) {
  //console.log(id, url, date);
  return Math.random() >= 0.5;
}

try {
  scraper.scrape({
    selectedPeriod: selectPeriod,
    selectedOperationTypes: selectOperationTypes,
    startLinkProgress,
    updateLinkProgress,
    stopLinkProgress,
    startDataProgress,
    updateDataProgress,
    stopDataProgress,
    finished,
    logLinks,
    logData,
    doScrape,
    stackSize: 7
  });
} catch (error) {
  console.error(error);
}
