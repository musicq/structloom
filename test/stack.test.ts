import { describe, expect, it } from "vitest";
import { Stack } from "../src/index.ts";

describe("Stack.methods", () => {
  it("initialize with empty values", () => {
    const stack = new Stack();
    expect(stack.size).toBe(0);
  });

  it("initialize with values", () => {
    const stack = new Stack([1, 2, 3]);
    expect(stack.size).toBe(3);
  });

  it("Stack.from", () => {
    const stack = Stack.from([1, 2, 3]);
    expect(stack instanceof Stack).toBe(true);
    expect(stack.size).toBe(3);
  });

  it("push", () => {
    const stack = new Stack();
    stack.push(1);
    expect(stack.size).toBe(1);
    stack.push(2);
    expect(stack.size).toBe(2);
  });

  it("pop", () => {
    const stack = new Stack();
    stack.push(1);
    stack.push(2);

    expect(stack.pop()).toBe(2);
    expect(stack.pop()).toBe(1);
    expect(stack.pop()).toBe(undefined);
  });

  it("peek", () => {
    const stack = new Stack();
    stack.push(1);
    expect(stack.peek()).toBe(1);
    stack.push(2);
    expect(stack.peek()).toBe(2);
    stack.pop();
    expect(stack.peek()).toBe(1);
    stack.pop();
    expect(stack.peek()).toBe(undefined);
  });

  it("clear", () => {
    const stack = new Stack();
    stack.push(1);
    stack.push(2);
    expect(stack.size).toBe(2);
    stack.clear();
    expect(stack.size).toBe(0);
  });

  it("check empty stack", () => {
    const stack = new Stack();
    expect(stack.isEmpty).toBe(true);
    stack.push(1);
    expect(stack.isEmpty).toBe(false);
    stack.pop();
    expect(stack.isEmpty).toBe(true);
  });
});
