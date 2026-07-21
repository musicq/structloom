import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Stack } from "../src/index.ts";

describe("Stack.methods", () => {
  it("initialize", () => {
    const stack = new Stack();
    assert.equal(stack.size, 0);
  });

  it("initialize with elements", () => {
    const stack = new Stack([1, 2]);
    assert.equal(stack.size, 2);
  });
});

describe.skip("Stack.e2e", () => {
  it("uses LIFO order", () => {
    const stack = new Stack<number>();

    stack.push(1).push(2);

    assert.equal(stack.pop(), 2);
    assert.equal(stack.pop(), 1);
  });
});
