/**
 * A last-in, first-out (LIFO) collection.
 *
 * @typeParam T - The type of values stored in the stack.
 */
export class Stack<T> {
  readonly #items: T[];

  constructor(values: Iterable<T> = []) {
    this.#items = Array.from(values);
  }

  /** The number of values currently in the stack. */
  get size(): number {
    return this.#items.length;
  }

  /** Whether the stack contains no values. */
  get isEmpty(): boolean {
    return this.#items.length === 0;
  }

  /** Adds a value to the top of the stack. */
  push(value: T): this {
    this.#items.push(value);
    return this;
  }

  /** Removes and returns the top value, or `undefined` when empty. */
  pop(): T | undefined {
    return this.#items.pop();
  }

  /** Returns the top value without removing it. */
  peek(): T | undefined {
    return this.#items.at(-1);
  }

  /** Removes every value from the stack. */
  clear(): void {
    this.#items.length = 0;
  }

  /** Returns a shallow copy ordered from bottom to top. */
  toArray(): T[] {
    return [...this.#items];
  }
}
