import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Stack } from "../src/index.ts";

describe("Stack.methods", () => {
  it("initialize with empty values", () => {
    const stack = new Stack();
    assert.equal(stack.size, 0);
  });

  it("initialize with values", () => {
    const stack = new Stack([1, 2, 3]);
    assert.equal(stack.size, 3);
  });

  it("Stack.from", () => {
    const stack = Stack.from([1, 2, 3]);
    assert.equal(stack instanceof Stack, true);
    assert.equal(stack.size, 3);
  });

  it("push", () => {
    const stack = new Stack();
    stack.push(1);
    assert.equal(stack.size, 1);
    stack.push(2);
    assert.equal(stack.size, 2);
  });

  it("pop", () => {
    const stack = new Stack();
    stack.push(1);
    stack.push(2);

    assert.equal(stack.pop(), 2);
    assert.equal(stack.pop(), 1);
    assert.equal(stack.pop(), undefined);
  });

  it("peek", () => {
    const stack = new Stack();
    stack.push(1);
    assert.equal(stack.peek(), 1);
    stack.push(2);
    assert.equal(stack.peek(), 2);
    stack.pop();
    assert.equal(stack.peek(), 1);
    stack.pop();
    assert.equal(stack.peek(), undefined);
  });

  it("clear", () => {
    const stack = new Stack();
    stack.push(1);
    stack.push(2);
    assert.equal(stack.size, 2);
    stack.clear();
    assert.equal(stack.size, 0);
  });

  it("check empty stack", () => {
    const stack = new Stack();
    assert.equal(stack.isEmpty, true);
    stack.push(1);
    assert.equal(stack.isEmpty, false);
    stack.pop();
    assert.equal(stack.isEmpty, true);
  });
});
