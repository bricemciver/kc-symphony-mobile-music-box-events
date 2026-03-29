import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";

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

export const convertDateToISO = (dateString: string): string => {
  const [datePart, timePart] = dateString.split(" at ");
  const year = new Date().getFullYear();
  // Normalize the datePart: Remove day of week, just keep month and day
  const normalizedDatePart = datePart.replace(/(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s*,/gi, "")
  // Normalize the timePart: remove spaces and periods, and convert to uppercase
  let normalizedTimePart = timePart.replace(/[\s.]/g, "").toUpperCase();
  // If we don't have minutes (no ':'), add it in with '00' as the minutes
  if (normalizedTimePart.indexOf(":") == -1) {
    const timeStr = /(\d*)([PpAa][Mm])/gi.exec(normalizedTimePart)
    if (timeStr) {
      normalizedTimePart = timeStr[1] + ":00" + timeStr[2]
    }
  }
  const dateStr = `${normalizedDatePart}, ${year} ${normalizedTimePart}`;
  const date = dayjs.tz(dateStr, "MMMM D, YYYY h:mmA", "America/Chicago");
  return date.format();
};

export const isLikelyAddress = (str: string) => {
  // Check for a comma followed by two uppercase letters (state) at the end
  let maybeAddress = /,\s*[A-Z]{2}\s*$/.test(str);
  if (!maybeAddress) {
    // check for a KC metro area zipcode at the end
    maybeAddress = /[6][46]\d{3}\s*$/.test(str);
  }
  return maybeAddress;
};

export const findType = (
  text: string,
): Partial<Record<keyof ConcertEntry, string>> => {
  let match = /<span class="text-alert">(.*?)<\/span>/.exec(text);
  if (match) {
    return { alert: match[1] };
  }
  match = /Sponsored by (.*)/.exec(text);
  if (match) {
    return { sponsor: match[1] };
  }
  match = /<em>(.*?)<\/em>/.exec(text);
  if (match) {
    return { notes: match[1] };
  }
  match =
    /(?:Sun|Mon|Tues|Wednes|Thurs|Fri|Satur)day, (.*? at .*?[AaPp]\.?[Mm]\.?)/.exec(
      text,
    );
  if (match) {
    return { date: convertDateToISO(match[1]) };
  }
  match = /<(?:strong|b)>(.*?)\s* [–-] \s*(.*?)<\/(?:strong|b)>/.exec(text);
  if (match) {
    if (isLikelyAddress(match[2])) {
      return { location: match[1], address: match[2] };
    } else {
      return { location: match[1], notes: match[2] };
    }
  }
  match = /<(?:strong|b)>(.*?)<\/(?:strong|b)>/.exec(text);
  if (match) {
    return { location: match[1] };
  }
  if (isLikelyAddress(text)) {
    return { address: text };
  }
  return {};
};
