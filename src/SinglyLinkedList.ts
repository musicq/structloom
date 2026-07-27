import type { Nullable, Predicator, Visitor } from "./types.ts";

/**
 * A node in a singly linked list.
 *
 * @typeParam T - The type of value stored in the node.
 */
export class LNode<T> {
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
 * The list exposes its nodes through {@link head} and {@link tail}. Each value
 * added with {@link prepend} or {@link append} is wrapped in an {@link LNode}.
 *
 * @typeParam T - The type of values stored in the list.
 */
export class SinglyLinkedList<T> {
  #head: Nullable<LNode<T>> = null;
  #tail: Nullable<LNode<T>> = null;
  #size: number = 0;

  /** Creates an empty singly linked list. */
  constructor() {}

  /** Returns the first node, or `null` when the list is empty. */
  get head(): Nullable<LNode<T>> {
    return this.#head;
  }

  /** Returns the last node, or `null` when the list is empty. */
  get tail(): Nullable<LNode<T>> {
    return this.#tail;
  }

  /** Returns the number of nodes in the list. */
  get size(): number {
    return this.#size;
  }

  /** Returns whether the list contains no nodes. */
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
   * Runs in linear time, O(n), because the implementation traverses the list.
   *
   * @param value - The value to add.
   */
  append(value: T): void {
    const newNode = new LNode(value);

    let ptr = this.#createDummyNode(this.#head);
    while (ptr.next !== null) {
      ptr = ptr.next;
    }

    ptr.next = newNode;
    this.#tail = newNode;

    if (this.#head === null) {
      this.#head = this.#tail;
    }

    this.#size++;
  }

  /**
   * Returns the first node accepted by a predicate.
   *
   * The predicate receives each node and its zero-based traversal index.
   * Iteration stops as soon as the predicate returns `true`.
   *
   * Runs in linear time, O(n), in the worst case.
   *
   * @param predictor - The predicate used to test each node.
   * @returns The first matching node, or `null` if no node matches.
   */
  find(predictor: Predicator<LNode<T>>): Nullable<LNode<T>> {
    let ptr = this.#createDummyNode(this.#head);

    let i = 0;
    while (ptr.next !== null) {
      if (predictor(ptr.next, i++)) {
        return ptr.next;
      }
      ptr = ptr.next;
    }

    return null;
  }

  /**
   * Visits every node in head-to-tail order.
   *
   * The visitor receives each node and its zero-based traversal index. Its
   * return value is ignored and does not stop iteration.
   *
   * Runs in linear time, O(n).
   *
   * @param visitor - The function to invoke for each node.
   */
  forEach(visitor: Visitor<LNode<T>>): void {
    let i = 0;
    let ptr = this.#createDummyNode(this.#head);
    while (ptr.next !== null) {
      visitor(ptr.next, i++);
      ptr = ptr.next;
    }
  }

  /**
   * Removes every node accepted by a predicate.
   *
   * The predicate receives each node and its zero-based position in the
   * original traversal. Removing an earlier node does not change the indexes
   * passed for later nodes.
   *
   * Runs in linear time, O(n).
   *
   * @param predictor - The predicate used to select nodes for removal.
   * @returns The number of nodes removed.
   */
  removeAll(predictor: Predicator<LNode<T>>): number {
    let i = 0;
    let dummy = this.#createDummyNode(this.#head);
    let prev = dummy;
    let current = dummy.next;
    let removedCnt = 0;

    while (current !== null) {
      const next = current.next;
      if (predictor(current, i++)) {
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
   * Removes and returns the first node.
   *
   * The returned node is detached from the list.
   *
   * Runs in constant time, O(1).
   *
   * @returns The removed node, or `null` if the list is empty.
   */
  removeFirst(): Nullable<LNode<T>> {
    if (this.isEmpty) return null;
    const head = this.#head as LNode<T>;
    this.#head = head.next;
    head.next = null;
    this.#size--;

    if (this.isEmpty) {
      this.#tail = null;
    }

    return head;
  }

  /**
   * Removes and returns the last node.
   *
   * Runs in linear time, O(n), because the predecessor of the tail must be
   * found by traversing the list.
   *
   * @returns The removed node, or `null` if the list is empty.
   */
  removeLast(): Nullable<LNode<T>> {
    if (this.isEmpty) return null;
    const tail = this.#tail as LNode<T>;

    let current = this.#head as LNode<T>;
    let prev: Nullable<LNode<T>> = null;

    while (current.next !== null) {
      prev = current;
      current = current.next;
    }

    if (prev) {
      (prev as LNode<T>).next = null;
    }

    this.#tail = prev;
    this.#size--;

    if (this.isEmpty) {
      this.#head = null;
    }

    return tail;
  }

  /**
   * Inserts a value or node after the first node accepted by a predicate.
   *
   * The predicate receives each node and its zero-based traversal index.
   * Nothing is inserted if the list is empty or no node matches. When an
   * existing node is supplied, its {@link LNode.next} reference is overwritten
   * during insertion, so the node should be detached from any other list.
   *
   * Runs in linear time, O(n), in the worst case.
   *
   * @param predictor - The predicate used to find the node to insert after.
   * @param newNode - The value to wrap in a new node, or a detached node to insert.
   */
  insert(predictor: Predicator<LNode<T>>, newNode: T | LNode<T>): void {
    let ptr = this.#createDummyNode(this.#head);
    let i = 0;

    while (ptr.next !== null) {
      const current = ptr.next;
      if (predictor(current, i++)) {
        const insertNode = newNode instanceof LNode ? newNode : new LNode(newNode);
        const next = current.next;
        current.next = insertNode;
        insertNode.next = next;
        this.#size++;

        // update tail node
        if (next === null) {
          this.#tail = insertNode;
        }
        break;
      }
      ptr = ptr.next;
    }
  }

  /**
   * Reverses the list in place by relinking its existing nodes.
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

    const tail = this.#tail;
    this.#tail = this.#head;
    this.#head = tail;
  }

  /**
   * Creates a temporary node whose next reference points to the given node.
   *
   * @param next - The node the dummy node should precede.
   * @returns A dummy node that is not part of the list.
   */
  #createDummyNode(next: Nullable<LNode<T>> = null): LNode<T> {
    const node = new LNode(Symbol.for("DUMMY_LNODE") as T);
    node.next = next;
    return node;
  }

  /**
   * Creates a list containing the provided values in the same order.
   *
   * Runs in linear time, O(n).
   *
   * @typeParam T - The type of values stored in the list.
   * @param values - The values with which to populate the list.
   * @returns A new list containing the provided values.
   */
  static from<T>(values: T[]): SinglyLinkedList<T> {
    const list = new SinglyLinkedList<T>();

    for (let i = values.length - 1; i >= 0; i--) {
      list.prepend(values[i]);
    }

    return list;
  }
}
