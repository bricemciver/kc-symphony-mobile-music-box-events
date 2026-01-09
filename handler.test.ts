import axios from "axios";
import { hello } from "./handler";
import type { APIGatewayProxyEvent } from "aws-lambda";


describe("hello handler", () => {
  it("should return events from the page", async () => {
    // test against the current page and the last 10 captures from Wayback Machine
    const urls = [
      "https://www.kcsymphony.org/concerts-tickets/neighborhood-concerts/",
    ];
    const result = await axios.get("http://web.archive.org/cdx/search/cdx", {
      params: {
        url: "https://www.kcsymphony.org/concerts-tickets/neighborhood-concerts/",
        limit: -10,
        filter: "statuscode:200",
        fl: "timestamp,original",
        fastLatest: true,
      },
    });
    // read result line by line
    for (const line of result.data.split("\n")) {
      const [timestamp, url] = line.split(" ");
      if (timestamp && url) {
        urls.push(`https://web.archive.org/web/${timestamp}/${url}`);
      }
    }
    for (const url of urls) {
      const lambdaResult = await hello({
        queryStringParameters: {
          url,
        },
        body: null,
        headers: {},
        multiValueHeaders: {},
        httpMethod: 'GET',
        isBase64Encoded: false,
        path: "",
        pathParameters: null,
        multiValueQueryStringParameters: null,
        stageVariables: null,
        requestContext: {} as any,
        resource: "",
      } as APIGatewayProxyEvent, {} as any, {} as any);
      console.log(`Testing ${url}`);
      expect(lambdaResult.statusCode).toBe(200);
      expect(lambdaResult.body.length).toBeGreaterThan(0);
      const events = JSON.parse(lambdaResult.body);
      if (events.length > 0) {
        for (const event of events) {
          expect(event.date).toBeTruthy();
          expect(event.location).toBeTruthy();
        }
      }
    }
  }, 60000);
});
