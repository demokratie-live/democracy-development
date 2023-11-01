declare class Pdf2Json {
  constructor() {}
  loadPDF(path: string): void;
  on(event: "pdfParser_dataReady", cb: (data: any) => void): void;
}

declare module "pdf2json" {
  export = Pdf2Json;
  export interface TextBlock {
    x: number;
    y: number;
    w: number;
    sw: number;
    clr: number;
    A: "left" | "center" | "right";
    R: [
      {
        T: string;
        S: number;
        TS: [number, number, 0 | 1, 0 | 1];
      }
    ];
  }
}
