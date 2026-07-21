export class Stack<T> {
  readonly #items: T[];

  constructor(values: Iterable<T> = []) {
    this.#items = Array.from(values)
  }

  get size() {
    return this.#items.length
  }
}
