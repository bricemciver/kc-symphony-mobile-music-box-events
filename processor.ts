import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Extend dayjs with the plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export type ConcertEntry = {
  location: string;
  date: string;
  alert?: string;
  address?: string;
  sponsor?: string;
  notes?: string;
};

const parsers: Record<string, (line: string, entry: ConcertEntry) => string | null> = {
  date: (line, entry) => {
    const iso = convertDateToISO(line);
    if (iso) {
      entry.date = iso;
      return 'location';
    }
    entry.alert = line;
    return null; // stay on "date"
  },
  location: (line, entry) => {
    const parts = line.split(/ [-–] /g);
    if (parts.length === 2 && isLikelyAddress(parts[1])) {
      entry.location = parts[0];
      entry.address = parts[1];
      return 'sponsor';
    }
    entry.location = parts[0];
    if (parts.length === 2) entry.notes = parts[1];
    return 'address';
  },
  address: (line, entry) => {
    if (isLikelyAddress(line)) {
      entry.address = line.replace(/[-–] /g, '');
      return 'sponsor';
    }
    const cleanNotes = line.replace(/^[-–] /g, '');
    entry.notes = cleanNotes;
    return null; // stay on "address"
  },
  sponsor: (line, entry) => {
    const match = /Sponsored by (.*)/.exec(line);
    if (match) {
      entry.sponsor = match[1];
      return 'done';
    }
    return null;
  },
};

export const processEntry = (root: cheerio.Root, entry: cheerio.Element): ConcertEntry => {
  const concertEntry: ConcertEntry = {
    address: '',
    location: '',
    sponsor: '',
    notes: '',
    date: '',
    alert: '',
  };

  const cleanedEntry = root(entry)
    ?.html()
    ?.replace(/<.*?>/g, '<tag>')
    ?.replace(/\n/g, '')
    ?.replace(/&nbsp;/g, '');
  const lines = cleanedEntry?.split('<tag>')?.filter(item => item?.length > 0) ?? [];

  let state = 'date';
  for (const line of lines) {
    if (state === 'done') break;
    const nextState = parsers[state]?.(line?.trim(), concertEntry);
    if (nextState) state = nextState;
  }

  if (concertEntry.address && !concertEntry.notes && !isLikelyAddress(concertEntry.address)) {
    concertEntry.notes = concertEntry.address;
    concertEntry.address = '';
  }

  return concertEntry;
};

const convertDateToISO = (dateString: string): string => {
  let [datePart, timePart] = dateString.split(' at ');
  if (!timePart) {
    // No "at" string so try old time
    [datePart, timePart] = dateString.split(' @ ');
    if (!timePart) {
      // If that doesn't work, probably not a date
      return '';
    }
  }
  const year = new Date().getFullYear();
  // Normalize the datePart: Remove day of week, just keep month and day
  const normalizedDatePart = datePart.replace(
    /(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s*,/gi,
    '',
  );
  // Normalize the timePart: remove spaces and periods and typos, and convert to uppercase
  let normalizedTimePart = timePart.replace(/[\s.[\]]/g, '').toUpperCase();
  // If we don't have minutes (no ':'), add it in with '00' as the minutes
  if (normalizedTimePart.indexOf(':') == -1) {
    const timeStr = /(\d{1,2})(AM|PM)/.exec(normalizedTimePart);
    if (timeStr) {
      normalizedTimePart = `${timeStr[1]}:00${timeStr[2]}`;
    }
  }
  const dateStr = `${normalizedDatePart}, ${year} ${normalizedTimePart}`;
  const date = dayjs.tz(dateStr, 'MMMM D, YYYY h:mmA', 'America/Chicago');
  return date.format();
};

const isLikelyAddress = (str: string) => {
  // Check for a comma followed by two uppercase letters (state) at the end
  let maybeAddress = /,\s*[A-Z]{2}\s*$/.test(str);
  if (!maybeAddress) {
    // check for a KC metro area zipcode at the end
    maybeAddress = /[6][46]\d{3}\s*$/.test(str);
  }
  return maybeAddress;
};
