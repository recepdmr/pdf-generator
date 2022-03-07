import express, { Request } from "express";
import puppeteer from "puppeteer";

const defaultPort = 3000;

const app = express();
const port = process.env.PORT || defaultPort;
const templateMicroserviceEndpoint = "http://localhost:3001";

interface TemplateGenerateRequest {
  templateUrl: string;
  dataUrl: string;
}

interface LinkGenerateRequest {
  url: string;
}

type QueryString = LinkGenerateRequest | TemplateGenerateRequest;

app.get("/", async (req: Request<any, any, any, QueryString>, res) => {
  if (!queryStringIsValid(req.query)) {
    res.status(400).send("invalid query paramaters");
    return;
  }
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let requestUrl: string;

    if ((req.query as LinkGenerateRequest).url) {
      const linkRequest = req.query as LinkGenerateRequest;
      requestUrl = linkRequest.url;
    } else {
      const templateRequest = req.query as TemplateGenerateRequest;

      requestUrl = `${templateMicroserviceEndpoint}?templateUrl=${templateRequest.templateUrl}&dataUrl=${templateRequest.dataUrl}`;
    }
    await page.goto(requestUrl);

    const buffer = await page.pdf({ format: "a4" });
    res.type("application/pdf");
    res.send(buffer);

    await browser.close();
  } catch (error) {
    console.error("There is error", error);
    res.sendStatus(400).send(JSON.stringify(error));
  }
});

const isValidURL = (candidate: string) => {
  if (candidate && candidate !== null && candidate !== "") {
    var res = candidate.match(
      /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
    );
    return res !== null;
  }
  return false;
};

const queryStringIsValid = (query: QueryString) => {
  if (
    !!(query as LinkGenerateRequest).url &&
    isValidURL((query as LinkGenerateRequest).url)
  ) {
    return true;
  } else if (
    !!((query as TemplateGenerateRequest).templateUrl &&
      (query as TemplateGenerateRequest).dataUrl,
    isValidURL((query as TemplateGenerateRequest).dataUrl)) &&
    isValidURL((query as TemplateGenerateRequest).templateUrl)
  ) {
    return true;
  }
  return false;
};

app.listen(port);
