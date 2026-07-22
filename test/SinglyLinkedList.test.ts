import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LNode, SinglyLinkedList } from "../src/index.ts";

describe("LNode", () => {
  it("new LNode", () => {
    const node = new LNode<number>(1);
    assert.equal(node.value, 1);
    assert.equal(node.next, null);
  });

  it("new LNode chain", () => {
    const node = new LNode<number>(1);
    node.next = new LNode<number>(2);

    assert.equal(node.value, 1);
    assert.equal(node.next.value, 2);
    assert.equal(node.next.next, null);
  });
});

describe("SinglyLinkedList", () => {
  it("prepend", () => {
    const list = new SinglyLinkedList<number>();
    assert.equal(list.size, 0);

    list.prepend(1);
    assert.equal(list.head!.value, 1);
    assert.equal(list.head!.next, null);
    assert.equal(list.size, 1);

    list.prepend(2);
    assert.equal(list.head!.value, 2);
    assert.equal(list.head!.next!.value, 1);
    assert.equal(list.head!.next!.next, null);
    assert.equal(list.size, 2);

    list.prepend(3);
    assert.equal(list.head!.value, 3);
    assert.equal(list.head!.next!.value, 2);
    assert.equal(list.head!.next!.next!.value, 1);
    assert.equal(list.head!.next!.next!.next, null);
    assert.equal(list.size, 3);
  });

  it("append", () => {
    const list = new SinglyLinkedList<number>();
    list.append(1);
    assert.equal(list.head!.value, 1);
    assert.equal(list.head!.next, null);
    assert.equal(list.tail!.value, 1);
    assert.equal(list.tail!.next, null);
    assert.equal(list.head, list.tail);
    assert.equal(list.size, 1);

    list.append(2);
    assert.equal(list.head!.value, 1);
    assert.equal(list.head!.next!.value, 2);
    assert.equal(list.head!.next!.next, null);
    assert.equal(list.tail!.value, 2);
    assert.equal(list.tail!.next, null);
    assert.equal(list.head === list.tail, false);
    assert.equal(list.size, 2);

    list.append(3);
    assert.equal(list.head!.value, 1);
    assert.equal(list.head!.next!.value, 2);
    assert.equal(list.head!.next!.next!.value, 3);
    assert.equal(list.head!.next!.next!.next, null);
    assert.equal(list.tail!.value, 3);
    assert.equal(list.tail!.next, null);
    assert.equal(list.head === list.tail, false);
    assert.equal(list.size, 3);
  });
});
