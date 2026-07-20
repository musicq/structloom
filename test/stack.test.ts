// test/stack.test.ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Stack } from "../src/index.ts";

describe("Stack", () => {
  it("uses LIFO order", () => {
    const stack = new Stack<number>();

    stack.push(1).push(2);

    assert.equal(stack.pop(), 2);
    assert.equal(stack.pop(), 1);
  });
});
