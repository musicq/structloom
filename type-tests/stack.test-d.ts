import { describe, expectTypeOf, it } from "vitest";
import { Stack } from "../src/index.ts";

describe("Stack types", () => {
  it("infers the element type from an iterable", () => {
    const numbers = new Stack([1, 2]);

    expectTypeOf(numbers).toEqualTypeOf<Stack<number>>();
  });

  it("accepts any iterable", () => {
    const fromSet = new Stack(new Set([1, 2]));

    expectTypeOf(fromSet).toEqualTypeOf<Stack<number>>();
  });

  it("rejects a non-iterable constructor argument", () => {
    // @ts-expect-error -- Stack constructor requires an Iterable
    new Stack(1);
  });

  it("rejects elements that do not match the explicit type", () => {
    // @ts-expect-error -- string is not assignable to number
    new Stack<number>(["1", "2"]);
  });
});
