import express, { Request } from "express";
import axios from "axios";
import handlebars from "handlebars";

const defaultPort = 3001;

const app = express();
const port = process.env.PORT || defaultPort;

interface TemplateGenerateRequest {
  templateUrl: string;
  dataUrl: string;
}
app.get(
  "/",
  async (req: Request<any, any, any, TemplateGenerateRequest>, res) => {
    if (!queryStringIsValid(req.query)) {
      res.status(400).send("invalid query paramaters");
      return;
    }
    const templateUrl = req.query.templateUrl;
    const dataUrl = req.query.dataUrl;

    const templateResponse = await axios.get(templateUrl);
    const templateHtml = templateResponse.data;

    const dataResponse = await axios.get(dataUrl);
    const { data } = dataResponse;

    const template = handlebars.compile(templateHtml);
    const resultHtml = template(data);

    res.setHeader("content-type", "text/html; charset=utf-8");

    res.status(200).send(resultHtml);
  }
);
app.listen(port);

const isValidURL = (candidate: string) => {
  var res = candidate.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  );
  return res !== null;
};

const queryStringIsValid = (query: TemplateGenerateRequest) =>
  query &&
  query.dataUrl &&
  query.templateUrl &&
  isValidURL(query.dataUrl) &&
  isValidURL(query.templateUrl);
