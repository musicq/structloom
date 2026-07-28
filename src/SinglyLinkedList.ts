import type { Nullable, Optional, Predicate, Visitor } from "./types.ts";

/**
 * A node in a singly linked list.
 *
 * @typeParam T - The type of value stored in the node.
 */
class LNode<T> {
  /** The value stored in this node. */
  value: T;

  /** The next node in the list, or `null` when this is the last node. */
  next: Nullable<LNode<T>>;

  /**
   * Creates a detached node containing the provided value.
   *
   * @param value - The value to store in the node.
   */
  constructor(value: T) {
    this.value = value;
    this.next = null;
  }
}

/**
 * A mutable, singly linked list of values.
 *
 * Values are accessed through {@link first}, {@link last}, iteration, and
 * value-oriented search and removal methods. Internal list nodes are not
 * exposed.
 *
 * @typeParam T - The type of values stored in the list.
 */
export class SinglyLinkedList<T> implements Iterable<T> {
  #head: Nullable<LNode<T>> = null;
  #tail: Nullable<LNode<T>> = null;
  #size: number = 0;

  /** Creates an empty singly linked list. */
  constructor() {}

  /** Returns the first value, or `undefined` when the list is empty. */
  get first(): Optional<T> {
    return this.#head?.value;
  }

  /** Returns the last value, or `undefined` when the list is empty. */
  get last(): Optional<T> {
    return this.#tail?.value;
  }

  /** Returns the number of values in the list. */
  get size(): number {
    return this.#size;
  }

  /** Returns whether the list contains no values. */
  get isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * Adds a value to the beginning of the list.
   *
   * Runs in constant time, O(1).
   *
   * @param value - The value to add.
   */
  prepend(value: T): void {
    const newNode = new LNode(value);
    newNode.next = this.#head;
    this.#head = newNode;

    if (this.#tail === null) {
      this.#tail = this.#head;
    }

    this.#size++;
  }

  /**
   * Adds a value to the end of the list.
   *
   * Runs in constant time, O(1).
   *
   * @param value - The value to add.
   */
  append(value: T): void {
    const newNode = new LNode(value);
    if (!this.isEmpty) {
      (this.#tail as LNode<T>).next = newNode;
    }
    this.#tail = newNode;

    if (this.#head === null) {
      this.#head = this.#tail;
    }

    this.#size++;
  }

  /**
   * Returns the first value accepted by a predicate.
   *
   * The predicate receives each value and its zero-based traversal index.
   * Iteration stops as soon as the predicate returns `true`.
   *
   * Runs in linear time, O(n), in the worst case.
   *
   * @param predicate - The predicate used to test each value.
   * @returns The first matching value, or `undefined` if no value matches.
   */
  find(predicate: Predicate<T>): Optional<T> {
    let i = 0;
    let ptr = this.#head;
    while (ptr !== null) {
      if (predicate(ptr.value, i++)) {
        return ptr.value;
      }
      ptr = ptr.next;
    }

    return undefined;
  }

  /**
   * Visits every value in first-to-last order.
   *
   * The visitor receives each value and its zero-based traversal index. Its
   * return value is ignored and does not stop iteration.
   *
   * Runs in linear time, O(n).
   *
   * @param visitor - The function to invoke for each value.
   */
  forEach(visitor: Visitor<T>): void {
    let i = 0;
    let ptr = this.#head;
    while (ptr !== null) {
      visitor(ptr.value, i++);
      ptr = ptr.next;
    }
  }

  /**
   * Removes every value accepted by a predicate.
   *
   * The predicate receives each value and its zero-based position in the
   * original traversal. Removing an earlier value does not change the indexes
   * passed for later values.
   *
   * Runs in linear time, O(n).
   *
   * @param predicate - The predicate used to select values for removal.
   * @returns The number of values removed.
   */
  removeAll(predicate: Predicate<T>): number {
    let i = 0;
    let dummy = this.#createDummyNode(this.#head);
    let prev = dummy;
    let current = dummy.next;
    let removedCnt = 0;

    while (current !== null) {
      const next = current.next;
      if (predicate(current.value, i++)) {
        prev.next = next;
        removedCnt++;
        this.#size--;
      } else {
        prev = current;
      }

      current = next;
    }

    this.#head = dummy.next;
    this.#tail = prev === dummy ? null : prev;
    return removedCnt;
  }

  /**
   * Removes and returns the first value.
   *
   * Runs in constant time, O(1).
   *
   * @returns The removed value, or `undefined` if the list is empty.
   */
  removeFirst(): Optional<T> {
    if (this.#head === null) return;

    const head = this.#head;
    this.#head = head.next;
    head.next = null;
    this.#size--;

    if (this.isEmpty) {
      this.#tail = null;
    }

    return head.value;
  }

  /**
   * Removes and returns the last value.
   *
   * Runs in linear time, O(n), because the list must be traversed to find the
   * value preceding the last one.
   *
   * @returns The removed value, or `undefined` if the list is empty.
   */
  removeLast(): Optional<T> {
    if (this.#tail === null) return;
    const tail = this.#tail;

    let current = this.#head as LNode<T>;
    let prev: Nullable<LNode<T>> = null;

    while (current.next !== null) {
      prev = current;
      current = current.next;
    }

    if (prev) {
      prev.next = null;
    }

    this.#tail = prev;
    this.#size--;

    if (this.isEmpty) {
      this.#head = null;
    }

    return tail.value;
  }

  /**
   * Inserts a value after the first value accepted by a predicate.
   *
   * The predicate receives each value and its zero-based traversal index.
   * Nothing is inserted if the list is empty or no value matches.
   *
   * Runs in linear time, O(n), in the worst case.
   *
   * @param predicate - The predicate used to find the value to insert after.
   * @param value - The value to insert.
   * @returns Whether a value was inserted.
   */
  insertAfter(predicate: Predicate<T>, value: T): boolean {
    let i = 0;
    let ptr = this.#head;

    while (ptr !== null) {
      if (predicate(ptr.value, i++)) {
        const insertNode = new LNode(value);
        const next = ptr.next;
        ptr.next = insertNode;
        insertNode.next = next;
        this.#size++;

        // update tail node
        if (next === null) {
          this.#tail = insertNode;
        }

        return true;
      }
      ptr = ptr.next;
    }

    return false;
  }

  /**
   * Reverses the order of the values in place.
   *
   * Runs in linear time, O(n), and constant space, O(1).
   */
  reverse(): void {
    let ptr = this.#head;
    let prev: Nullable<LNode<T>> = null;
    while (ptr !== null) {
      const next = ptr.next;
      ptr.next = prev;
      prev = ptr;
      ptr = next;
    }

    this.#tail = this.#head;
    this.#head = prev;
  }

  /**
   * Creates a temporary node whose next reference points to the given node.
   *
   * @param next - The node the dummy node should precede.
   * @returns A dummy node that is not part of the list.
   */
  #createDummyNode(next: Nullable<LNode<T>> = null): LNode<T> {
    return { next } as LNode<T>;
  }

  /**
   * Creates a list containing the provided values in the same order.
   *
   * Runs in linear time, O(n).
   *
   * @typeParam T - The type of values stored in the list.
   * @param values - An iterable of values with which to populate the list.
   * @returns A new list containing the provided values.
   */
  static from<T>(values: Iterable<T>): SinglyLinkedList<T> {
    const list = new SinglyLinkedList<T>();

    for (const v of values) {
      list.append(v);
    }

    return list;
  }

  /**
   * Returns a new iterator over the values in first-to-last order.
   *
   * Each call creates an independent iterator.
   *
   * @returns An iterable iterator over the stored values.
   */
  [Symbol.iterator](): IterableIterator<T> {
    let current = this.#head;

    return {
      next() {
        if (current !== null) {
          const r = {
            value: current.value,
            done: false,
          };

          current = current.next;
          return r;
        }

        return {
          value: undefined,
          done: true,
        };
      },
      [Symbol.iterator]() {
        return this;
      },
    };
  }
}
