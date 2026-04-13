import type { ExecutionContext, ExportedHandler } from '@cloudflare/workers-types';
import { load } from 'cheerio';
import { type ConcertEntry, processEntry } from './processor';

const EVENTS_URL_DEFAULT = 'https://www.kcsymphony.org/concerts-tickets/neighborhood-concerts/';

interface Env {
  EVENTS_URL?: string;
}

const getEventsPage = async (url?: string) => {
  const targetUrl = url ?? EVENTS_URL_DEFAULT;
  const response = await fetch(targetUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.text();
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

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);
      const requestedUrl = url.searchParams.get('url');
      const eventsUrl = requestedUrl ?? env.EVENTS_URL ?? EVENTS_URL_DEFAULT;

      const page = await getEventsPage(eventsUrl);
      const events = parsePage(page);

      return Response.json({ events });
    } catch (error) {
      return Response.json(
        { error: error instanceof Error ? error.message : String(error) },
        {
          status: 500,
        },
      );
    }
  },
} satisfies ExportedHandler;
