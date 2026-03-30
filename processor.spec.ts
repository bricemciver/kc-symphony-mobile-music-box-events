import { load } from "cheerio";
import { ConcertEntry, processEntry } from "./processor";

describe("processor", () => {
  describe("test different entry formats", () => {
    it.each([
      ["<p>Wednesday, April 29 at 6:30 p.m.<br><strong>Sar-Ko-Par Trails Park – String Quartet</strong><br>14907 W. 87th St Pkwy, Lenexa, KS 66215<br>Sponsored by UMB and Shook, Hardy &amp; Bacon</p>", {
        "address": "14907 W. 87th St Pkwy, Lenexa, KS 66215",
        "alert": "",
        "date": "2026-04-29T18:30:00-05:00",
        "location": "Sar-Ko-Par Trails Park",
        "notes": "String Quartet",
        "sponsor": "UMB and Shook, Hardy &amp; Bacon",
      }],
      ["<p>Sunday, May 3 at 6 p.m.<br><strong>Smith’s Fork Park Campground – String Quartet</strong><br>1601 DD Highway, Smithville, MO 64081<br>Sponsored by Mark One Electric and U.S. Engineering</p>", {
        "address": "1601 DD Highway, Smithville, MO 64081",
        "alert": "",
        "date": "2026-05-03T18:00:00-05:00",
        "location": "Smith’s Fork Park Campground",
        "notes": "String Quartet",
        "sponsor": "Mark One Electric and U.S. Engineering",
      }],
      ["<p>Tuesday, May 5 at 6 p.m.<br><strong>Meadowbrook Park – Violin Quartet</strong><br>9101 Nall Ave, Prairie Village, KS 66207<br>Sponsored by Burns &amp; McDonnell and Kansas City University</p>", {
        "address": "9101 Nall Ave, Prairie Village, KS 66207",
        "alert": "",
        "date": "2026-05-05T18:00:00-05:00",
        "location": "Meadowbrook Park",
        "notes": "Violin Quartet",
        "sponsor": "Burns &amp; McDonnell and Kansas City University",
      }],
      ["<p>Wednesday, May 6 at 6 p.m.<br><strong>English Landing Park – String Quartet</strong><br>8701 McAfee St, Parkville, MO 64152<br>Sponsored by Helzberg Diamonds and Black &amp; McDonald</p>", {
        "address": "8701 McAfee St, Parkville, MO 64152",
        "alert": "",
        "date": "2026-05-06T18:00:00-05:00",
        "location": "English Landing Park",
        "notes": "String Quartet",
        "sponsor": "Helzberg Diamonds and Black &amp; McDonald",
      }],
      ["<p>Wednesday, May 13 at 6 p.m.<br><strong>Westwood Park – String Quartet<br></strong>4798 Wyoming St, Kansas City, MO 64112<br>Sponsored by Cerris Construction and Evergy</p>", {
        "address": "4798 Wyoming St, Kansas City, MO 64112",
        "alert": "",
        "date": "2026-05-13T18:00:00-05:00",
        "location": "Westwood Park",
        "notes": "String Quartet",
        "sponsor": "Cerris Construction and Evergy",
      }],
      ["<p>Sunday, May 17 at 6 p.m.<br><strong>Mohawk Park – String Quartet</strong><br>6649 Lamar Ave, Mission, KS 66202<br>Sponsored by McCownGordon Construction and Forvis Mazars</p>", {
        "address": "6649 Lamar Ave, Mission, KS 66202",
        "alert": "",
        "date": "2026-05-17T18:00:00-05:00",
        "location": "Mohawk Park",
        "notes": "String Quartet",
        "sponsor": "McCownGordon Construction and Forvis Mazars",
      }],
      ["<p>Sunday, June 14 at 2 p.m.<br><strong>Kauffman Center for the Performing Arts<br>Future Stages Festival – String Quartet<br></strong>1601 Broadway, Kansas City, MO 64108<br>Sponsored by Evergy and PNC</p>", {
        "address": "1601 Broadway, Kansas City, MO 64108",
        "alert": "",
        "date": "2026-06-14T14:00:00-05:00",
        "location": "Kauffman Center for the Performing Arts",
        "notes": "Future Stages Festival – String Quartet",
        "sponsor": "Evergy and PNC",
      }],
      ['<p><span class="faux-h4"><span class="text-alert">CONCERT CANCELLED DUE TO WEATHER</span><br>Tuesday, June 3 at 6:00PM</span><br><b>Westwood Park (KCMO)</b> – 47th St and State Line Rd Kansas City, MO 64112<br>Sponsored by Evergy &amp; Shook, Hardy &amp; Bacon L.L.P.</p>', {
        "address": "47th St and State Line Rd Kansas City, MO 64112",
        "alert": "CONCERT CANCELLED DUE TO WEATHER",
        "date": "2026-06-03T18:00:00-05:00",
        "location": "Westwood Park (KCMO)",
        "notes": "",
        "sponsor": "Evergy &amp; Shook, Hardy &amp; Bacon L.L.P.",
      }],
      ["<p>Tuesday, June 9 at 6 p.m.<br><strong>Shawnee Mission Park Inclusive Playground</strong>&nbsp;<strong>– Woodwind Quintet</strong><br>7900 Renner Rd, Shawnee, KS 66219<br>Sponsored by Evergy</p>", {
        "address": "7900 Renner Rd, Shawnee, KS 66219",
        "alert": "",
        "date": "2026-06-09T18:00:00-05:00",
        "location": "Shawnee Mission Park Inclusive Playground",
        "notes": "Woodwind Quintet",
        "sponsor": "Evergy",
      }]
    ])("should convert to ConcertEntry object", (input, expected) => {
      const $ = load(input)
      const result = processEntry($, $("p").toArray()[0]);
      expect(result).toEqual<ConcertEntry>(expected);
    });
  });
});
