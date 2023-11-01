import mongoConnect from "./mongoose";
import fs from "fs";
import http from "http";
import PDFParser, { TextBlock } from "pdf2json";

declare function unescape(s: string): string;

import { ProcedureModel } from "@democracy-deutschland/bundestagio-common";

const httpOptions: http.RequestOptions = {
  headers: { "User-Agent": "Mozilla/5.0" },
};

const download = async (url: string, dest: string): Promise<string> => {
  var file = fs.createWriteStream(dest);
  return new Promise((resolve, reject) => {
    http
      .get(url, httpOptions, (response) => {
        response.pipe(file);
        file.on("finish", function () {
          resolve(dest);
        });
      })
      .on("error", function (err) {
        // Handle errors
        fs.unlink(dest, () => {}); // Delete the file async. (But we don't check the result)
        reject(err);
      });
  });
};

const start = async () => {
  console.log("START PARSER");
  const procedure = await ProcedureModel.findOne({});
  if (procedure) {
    const document = procedure.importantDocuments[0];
    // const path = await download(
    //   document.url,
    //   `/tmp/${document.number.replace("/", "0")}.pdf`
    // );
    const path = "/tmp/1901596.pdf";
    console.log(path);
    const pdfParser = new PDFParser();
    pdfParser.loadPDF(path);
    pdfParser.on("pdfParser_dataReady", (data) => {
      const page = data.formImage.Pages[0];
      fs.writeFileSync(`${path}.json`, page);

      // data.formImage.Pages.forEach((page: any) => {
      const texts = page.Texts as any[];
      const textBlocks: string[] = [];
      let tmpText: string;
      texts.forEach((textBlock: TextBlock, index) => {
        const text = decodeURIComponent(textBlock.R[0].T);

        if (index === 0) {
          tmpText = text;
          return;
        }
        const prevText = texts[index - 1];
        if (index < 10) {
          console.log(
            text,
            textBlock,
            textBlock.x + textBlock.sw - (prevText.x + prevText.w)
          );
        }
        if (
          textBlock.x <= prevText.x + prevText.w + 0.1 &&
          textBlock.y < prevText.y + 1
        ) {
          const space =
            textBlock.y > 5 || textBlock.x - (prevText.x + prevText.w) > 0
              ? " "
              : "";
          tmpText += space + text;
          if (index === texts.length - 1) {
            textBlocks.push(tmpText);
          }
        } else {
          textBlocks.push(tmpText);
          tmpText = text;
        }
      });
      console.log(textBlocks);
      // });
    });
  }
  console.log("DONE PARSER");
};

(async () => {
  console.info("START");
  console.info("process.env", process.env.DB_URL);
  if (!process.env.DB_URL) {
    throw new Error("you have to set environment variable: DB_URL");
  }
  await mongoConnect();
  console.log("procedures", await ProcedureModel.countDocuments({}));
  await start().catch(() => process.exit(1));
  // process.exit(0);
})();
