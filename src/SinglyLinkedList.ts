export class LNode<T> {
  value: T;
  next: LNode<T> | null;

  constructor(value: T) {
    this.value = value;
    this.next = null;
  }
}

export class SinglyLinkedList<T> {
  #head: LNode<T> | null = null;
  // tail is equal to head when there is no or one element in the list.
  #tail: LNode<T> | null = null;

  #size: number = 0;

  constructor() {}

  get head(): LNode<T> | null {
    return this.#head;
  }

  get tail(): LNode<T> | null {
    return this.#tail;
  }

  get isEmpty(): boolean {
    return this.#head === this.#tail;
  }

  get size(): number {
    return this.#size;
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
}
