import { describe, expect, it } from "vitest";
import { googleMapsNavigationUrl, wazeNavigationUrl } from "./navigation-links";

describe("navigation links", () => {
  it("builds Waze and Google Maps directions to a point", () => {
    expect(wazeNavigationUrl({ lat: 31.7767, lng: 35.2345 })).toBe(
      "https://waze.com/ul?ll=31.776700,35.234500&navigate=yes"
    );
    expect(googleMapsNavigationUrl({ lat: 31.7767, lng: 35.2345 })).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=31.776700,35.234500"
    );
  });

  it("returns nothing for missing or impossible coordinates", () => {
    expect(wazeNavigationUrl({ lat: Number.NaN, lng: 35 })).toBeNull();
    expect(googleMapsNavigationUrl({ lat: 95, lng: 35 })).toBeNull();
    expect(googleMapsNavigationUrl({ lat: 31, lng: 200 })).toBeNull();
  });
});
