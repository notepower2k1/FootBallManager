import { describe, expect, it } from "vitest";
import { paginate } from "./pagination";

describe("paginate", () => {
  it("returns the requested page and total page count", () => {
    const result = paginate([1, 2, 3, 4, 5], 2, 2);

    expect(result).toEqual({
      items: [3, 4],
      page: 2,
      pageCount: 3,
      totalItems: 5,
    });
  });

  it("clamps invalid pages and keeps an empty collection on page one", () => {
    expect(paginate([1, 2, 3], 99, 2).page).toBe(2);
    expect(paginate([], 99, 2)).toEqual({
      items: [],
      page: 1,
      pageCount: 1,
      totalItems: 0,
    });
  });
});
