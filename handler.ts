import type { Handler } from "aws-lambda";
import axios from "axios";
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Extend dayjs with the plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

type ConcertEntry = {
  location: string;
  date: string;
  alert?: string;
  address?: string;
  sponsor?: string;
  notes?: string;
};

const getEventsPage = async (url?: string) => {
  return axios.get<string>(
    url ?? process.env.EVENTS_URL ?? "https://www.kcsymphony.org/concerts-tickets/neighborhood-concerts/",
  );
};

const convertDateToISO = (dateString: string): string => {
  const [datePart, timePart] = dateString.split(" at ");
  const year = new Date().getFullYear();
  const dateStr = `${datePart}, ${year} ${timePart}`;
  const date = dayjs.tz(dateStr, "MMMM D, YYYY h:mmA", "America/Chicago");
  return date.format();
};

const findType = (text: string): Partial<Record<keyof ConcertEntry, string>> => {
  let match = /<span class="text-alert">(.*?)<\/span>/.exec(text);
  if (match) {
    return { alert: match[1]};
  }
  match = /Sponsored by (.*)/.exec(text);
  if (match) {
    return { sponsor: match[1]};
  }
  match = /<em>(.*?)<\/em>/.exec(text);
  if (match) {
    return { notes: match[1]};
  }
  match = /(?:Sun|Mon|Tues|Wednes|Thurs|Fri|Satur)day, (.*? at .*?[AP]M)/.exec(text);
  if (match) {
    return { date: convertDateToISO(match[1])};
  }
  match = /<(?:strong|b)>(.*?)\s*(?:[–-]\s*<\/(?:strong|b)>\s*|<\/(?:strong|b)>\s*[–-]\s*)(.*)/.exec(text);
  if (match) {
    return { location: match[1], address: match[2]};
  }
  match = /<(?:strong|b)>(.*?)<\/(?:strong|b)>/.exec(text);
  if (match) {
    return { location: match[1]};
  }
  return {};
};

const parsePage = (html: string) => {
  const events: ConcertEntry[] = [];
  const $ = cheerio.load(html);

  // Find the concert calendar
  const calendar = $('a.accordion-toggle').filter((i, el) => {
    return $(el).text().trim().toLowerCase().includes("concert calendar");
  });

  if (calendar.length === 0) {
    console.log("Unable to find calendar section");
    return events;
  }

  // Get the accordion content
  const concertAccordion = calendar.next();

  if (concertAccordion.length === 0) {
    console.log("Unable to find entries");
    return events;
  }

  // Iterate over the entries
  concertAccordion.find('p').each((i, entry) => {
    let concertEntry: ConcertEntry = {
      address: "",
      location: "",
      sponsor: "",
      notes: "",
      date: "",
      alert: "",
    };
    const lines = $(entry).html()?.split("<br>");
    if (lines) {
      for (const line of lines) {
        const trimmedLine = line.trim();
        const type = findType(trimmedLine);
        concertEntry = { ...concertEntry, ...type };
      }
    }
    if (concertEntry.date && concertEntry.location) {
      events.push(concertEntry);
    }
  });

  return events;
};

export const hello: Handler = async (event) => {
  try {
    const page = await getEventsPage(event.queryStringParameters?.url);
    const events = parsePage(page.data);
    return {
      statusCode: 200,
      body: JSON.stringify(events),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: axios.isAxiosError(error) ? error.toJSON() : error,
    };
  }
};

