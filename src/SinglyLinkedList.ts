import type { Nullable, Predicator, Visitor } from "./types.ts";

export class LNode<T> {
  value: T;
  next: Nullable<LNode<T>>;

  constructor(value: T) {
    this.value = value;
    this.next = null;
  }
}

export class SinglyLinkedList<T> {
  #head: Nullable<LNode<T>> = null;
  // tail is equal to head when there is no or one element in the list.
  #tail: Nullable<LNode<T>> = null;

  #size: number = 0;

  constructor() {}

  get head(): Nullable<LNode<T>> {
    return this.#head;
  }

  get tail(): Nullable<LNode<T>> {
    return this.#tail;
  }

  get size(): number {
    return this.#size;
  }

  get isEmpty(): boolean {
    return this.#head === this.#tail;
  }

  /**
   * Prepend value to the linked list.
   *
   * head        tail
   * ↓           ↓
   * [a] → [b] → null
   *
   * ```ts
   * sl.prepend(LNode('c'))
   * ```
   *
   * head              tail
   * ↓                 ↓
   * [c] → [a] → [b] → null
   *
   * @param value T
   */
  prepend(value: T): void {
    const newNode = new LNode(value);
    newNode.next = this.#head;
    this.#head = newNode;
    this.#size++;
  }

  append(value: T): void {
    const newNode = new LNode(value);

    let ptr = { next: this.#head };
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

  // find the first matched LNode
  find(predictor: Predicator<LNode<T>>): Nullable<LNode<T>> {
    let r = null;
    this.#traverse((node, index) => {
      if (predictor(node, index)) {
        r = node;
        return false;
      }
    });

    return r;
  }

  // loop all the nodes, nonstop
  forEach(cb: Visitor<LNode<T>>): void {
    this.#traverse((node, index) => {
      cb(node, index);
    });
  }

  // internal, if `visitor` returns `false`, it will break the loop immediately.
  #traverse(visitor: Visitor<LNode<T>, any>): void {
    let i = 0;
    let ptr = this.#createDummyNode(this.head);

    while (ptr.next !== null) {
      i++;
      const r = visitor(ptr.next, i);
      if (r === false) {
        break;
      }
      ptr = ptr.next;
    }
  }

  removeAll(predictor: Predicator<LNode<T>>): void {
    let i = 0;
    // let newList = { next: null as Nullable<LNode<T>> };
    let newList = this.#createDummyNode();
    let newListPtr = newList;
    let ptr = { next: this.#head };

    while (ptr.next !== null) {
      i++;

      if (!predictor(ptr.next, i)) {
        // add to new list
        newListPtr.next = ptr.next;
        newListPtr = newListPtr.next;
      } else {
        this.#size--;
      }

      ptr = ptr.next;
    }

    newListPtr.next = null;
    this.#head = newList.next;
    this.#tail = newListPtr instanceof LNode ? newListPtr : newListPtr.next;
  }

  #createDummyNode(next: Nullable<LNode<T>> = null): LNode<T> {
    const node = new LNode(Symbol.for("DUMMY_LNODE") as T);
    node.next = next;
    return node;
  }
}
