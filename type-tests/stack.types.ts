import { Stack } from "../src/index.ts";

// Valid usage: the element type is inferred from the iterable.
const numbers: Stack<number> = new Stack([1, 2]);

// Valid usage: any Iterable can initialize a stack.
const fromSet: Stack<number> = new Stack(new Set([1, 2]));

// Invalid usage: a number is not iterable.
// @ts-expect-error -- Stack constructor requires an Iterable
new Stack(1);

// Invalid usage: the iterable's elements must match the explicit type.
// @ts-expect-error -- string is not assignable to number
new Stack<number>(["1", "2"]);

void numbers;
void fromSet;
