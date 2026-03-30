import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import axios from 'axios';
import { load } from 'cheerio';
import { type ConcertEntry, processEntry } from './processor';

const getEventsPage = async (url?: string) => {
  return axios.get<string>(
    url ?? process.env.EVENTS_URL ?? 'https://www.kcsymphony.org/concerts-tickets/neighborhood-concerts/',
  );
};

const parsePage = (html: string) => {
  const events: ConcertEntry[] = [];
  const $ = load(html);

  // Find the concert calendar
  const calendar = $('a.accordion-toggle').filter((_i, el) => {
    return $(el).text().trim().toLowerCase().includes('concert calendar');
  });

  if (calendar.length === 0) {
    console.log('Unable to find calendar section');
    return events;
  }

  // Get the accordion content
  const concertAccordion = calendar.next();

  if (concertAccordion.length === 0) {
    console.log('Unable to find entries');
    return events;
  }

  // Iterate over the entries
  concertAccordion.find('p').each((_i, entry) => {
    const concertEntry = processEntry($, entry);
    if (concertEntry.date && concertEntry.location) {
      events.push(concertEntry);
    }
  });

  return events;
};

export const eventHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const page = await getEventsPage(event.queryStringParameters?.url);
    const events = parsePage(page.data);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events }),
    } as APIGatewayProxyResult;
  } catch (error) {
    return {
      statusCode: axios.isAxiosError(error) ? error.response?.status : 500,
      headers: {
        'Content-Type': axios.isAxiosError(error) ? error.response?.headers : 'text/plain',
      },
      body: axios.isAxiosError(error) ? error.toJSON() : error,
    } as APIGatewayProxyResult;
  }
};
