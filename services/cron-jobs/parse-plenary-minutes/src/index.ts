import axios from "axios";
import { xml2js } from "xml-js";
import { PlenaryMinuteModel } from "@democracy-deutschland/bundestagio-common";

import mongoConnect from "./mongoose";

const axiosInstance = axios.create();

const flattenElements = (elements: any) => {
  return elements.reduce((prev: any[], el: any) => {
    if ("elements" in el) {
      return [...prev, ...flattenElements(el.elements)];
    } else if (el.type === "text") {
      return [...prev, el.text];
    }
    return prev;
  }, []);
};

const start = async () => {
  const plenaryMinute = await PlenaryMinuteModel.findOne();
  if (plenaryMinute) {
    const { data } = await axiosInstance.get(plenaryMinute.xml);
    const json = await xml2js(data, {
      compact: false,
    });
    const protocol = json.elements.find(
      ({ name }: { name: string }) => name === "dbtplenarprotokoll"
    );
    const sessionHistory = protocol.elements.find(
      ({ name }: { name: string }) => name === "sitzungsverlauf"
    );

    const output: string[] = flattenElements(sessionHistory.elements);
    const resultIndexes = output.reduce<number[]>((prev, text, index) => {
      if (text.indexOf("19/17342") !== -1) {
        return [...prev, index];
      }
      return prev;
    }, []);
    const outputLines = resultIndexes.reduce<string[][]>((prev, line) => {
      return [
        ...prev,
        [
          output[line - 1],
          output[line],
          output[line + 1],
          output[line + 2],
          output[line + 3],
          output[line + 4],
          output[line + 5],
        ],
      ];
    }, []);
    console.log(outputLines);
  }
};

(async () => {
  console.info("START");
  console.info("process.env", process.env.DB_URL);
  if (!process.env.DB_URL) {
    throw new Error("you have to set environment variable: DB_URL");
  }
  await mongoConnect();
  console.log("PlenaryMinutes", await PlenaryMinuteModel.countDocuments({}));
  await start().catch(() => {
    // process.exit(1);
  });
  // process.exit(0);
})();
