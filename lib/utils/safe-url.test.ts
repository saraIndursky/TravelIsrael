import { describe, expect, it } from "vitest";
import { toSafeExternalUrl } from "./safe-url";

describe("toSafeExternalUrl", () => {
  it("accepts http(s) and adds https to bare domains", () => {
    expect(toSafeExternalUrl("https://example.com/a")).toBe("https://example.com/a");
    expect(toSafeExternalUrl("example.com")).toBe("https://example.com/");
    expect(toSafeExternalUrl("http://example.com")).toBe("http://example.com/");
  });

  it("rejects script-style and other schemes", () => {
    expect(toSafeExternalUrl("javascript:alert(1)")).toBeNull();
    expect(toSafeExternalUrl(" JavaScript:alert(1)")).toBeNull();
    expect(toSafeExternalUrl("data:text/html,<script>1</script>")).toBeNull();
    expect(toSafeExternalUrl("vbscript:x")).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(toSafeExternalUrl("")).toBeNull();
    expect(toSafeExternalUrl(undefined)).toBeNull();
  });
});
