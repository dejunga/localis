// pdf-parse@1.1.1 root entry pokušava čitati ./test/data/*.pdf kad se učita izvan svog paketa
// (module.parent je null u ESM/vitestu), pa testovi uvoze lib datoteku izravno. Tipovi su isti.
declare module "pdf-parse/lib/pdf-parse.js" {
  import pdfParse from "pdf-parse";
  export = pdfParse;
}
