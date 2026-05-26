import { getAvatarUrl } from "@/lib/avatar";

describe("getAvatarUrl", () => {
  it("returns URL with encoded name and default size", () => {
    const url = getAvatarUrl("John Doe");
    expect(url).toContain("https://ui-avatars.com/api/");
    expect(url).toContain("name=John%20Doe");
    expect(url).toContain("size=128");
  });

  it("uses custom size when provided", () => {
    const url = getAvatarUrl("Jane", 64);
    expect(url).toContain("size=64");
  });

  it("trims whitespace from name", () => {
    const url = getAvatarUrl("  Bob  ");
    expect(url).toContain("name=Bob");
  });

  it("falls back to User when name is empty after trim", () => {
    const url = getAvatarUrl("   ");
    expect(url).toContain("name=User");
  });
});