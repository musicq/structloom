/**
 * A last-in, first-out (LIFO) collection of values.
 *
 * @typeParam T - The type of values stored in the stack.
 */
export class Stack<T> {
  readonly #items: T[];

  /**
   * Creates a stack containing the provided values.
   *
   * Values are added in iteration order, so the last value is at the top.
   *
   * @param values - The initial values for the stack.
   */
  constructor(values: Iterable<T> = []) {
    this.#items = Array.from(values);
  }

  /** Returns the number of values in the stack. */
  get size(): number {
    return this.#items.length;
  }

  /** Returns whether the stack contains no values. */
  get isEmpty(): boolean {
    return this.#items.length === 0;
  }

  /**
   * Adds a value to the top of the stack.
   *
   * @param value - The value to add.
   */
  push(value: T): void {
    this.#items.push(value);
  }

  /**
   * Removes and returns the value at the top of the stack.
   *
   * @returns The removed value, or `undefined` if the stack is empty.
   */
  pop(): T | undefined {
    return this.#items.pop();
  }

  /**
   * Returns the value at the top of the stack without removing it.
   *
   * @returns The top value, or `undefined` if the stack is empty.
   */
  peek(): T | undefined {
    const size = this.size;

    return size === 0 ? undefined : this.#items[size - 1];
  }

  /** Removes all values from the stack. */
  clear(): void {
    this.#items.length = 0;
  }

  /**
   * Creates a stack containing the provided values.
   *
   * Values are added in iteration order, so the last value is at the top.
   *
   * @typeParam T - The type of values stored in the stack.
   * @param values - The initial values for the stack.
   * @returns A new stack containing the provided values.
   */
  static from<T>(values: Iterable<T> = []): Stack<T> {
    return new Stack(values);
  }
}
