import { convertDateToISO, isLikelyAddress, findType } from "./lineProcessor";

describe("lineProcessor", () => {
  describe("convertDateToISO", () => {
    it("should convert date string to ISO format", () => {
      const result = convertDateToISO("Sunday, April 5 at 2:00pm");
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("should handle different time formats", () => {
      const result1 = convertDateToISO("Sunday, April 5 at 2:00 PM");
      expect(result1).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

      const result2 = convertDateToISO("Sunday, April 5 at 2:00P.M.");
      expect(result2).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe("isLikelyAddress", () => {
    it("should detect addresses with state abbreviation", () => {
      expect(isLikelyAddress("123 Main St, Kansas City, MO")).toBe(true);
      expect(isLikelyAddress("456 Oak Ave, KC, MO 64108")).toBe(true);
    });

    it("should detect addresses with KC metro zipcode", () => {
      expect(isLikelyAddress("123 Main Street, Kansas City 64108")).toBe(true);
      expect(isLikelyAddress("456 Oak Avenue, Overland Park 66210")).toBe(true);
    });

    it("should return false for non-addresses", () => {
      expect(isLikelyAddress("String Quartet Performance")).toBe(false);
      expect(isLikelyAddress("Sponsored by Local Business")).toBe(false);
      expect(isLikelyAddress("Sunday, April 5 at 2:00pm")).toBe(false);
    });
  });

  describe("findType", () => {
    it("should extract alert from span with text-alert class", () => {
      const result = findType('<span class="text-alert">FREE ADMISSION</span>');
      expect(result).toEqual({ alert: "FREE ADMISSION" });
    });

    it("should extract sponsor from 'Sponsored by' text", () => {
      const result = findType("Sponsored by Kansas City Chamber of Commerce");
      expect(result).toEqual({ sponsor: "Kansas City Chamber of Commerce" });
    });

    it("should extract notes from em tags", () => {
      const result = findType("<em>Bring your own chair</em>");
      expect(result).toEqual({ notes: "Bring your own chair" });
    });

    it("should extract date from day, month pattern", () => {
      const result = findType("Sunday, April 5 at 2:00pm");
      expect(result).toHaveProperty("date");
      expect(result.date).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("should extract location and address from strong/b tags with dash separator", () => {
      const result1 = findType(
        "<strong>Sar-Ko-Par Trails Park – String Quartet</strong>",
      );
      expect(result1).toEqual({
        location: "Sar-Ko-Par Trails Park",
        notes: "String Quartet",
      });

      const result2 = findType("<b>Starlight Theatre – Jazz Night</b>");
      expect(result2).toEqual({
        location: "Starlight Theatre",
        notes: "Jazz Night",
      });
    });

    it("should extract location from strong/b tags without separator", () => {
      const result = findType("<strong>Community Center</strong>");
      expect(result).toEqual({ location: "Community Center" });
    });

    it("should return address for likely address strings", () => {
      const result = findType("123 Main St, Kansas City, MO 64108");
      expect(result).toEqual({ address: "123 Main St, Kansas City, MO 64108" });
    });

    it("should return empty object for unrecognized text", () => {
      const result = findType(
        "Some random text that doesn't match any pattern",
      );
      expect(result).toEqual({});
    });
  });
});
