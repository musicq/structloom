import { describe, expect, it } from "vitest";
import { LNode, SinglyLinkedList } from "../src/index.ts";

function createList<T>(values: readonly T[]): SinglyLinkedList<T> {
  const list = new SinglyLinkedList<T>();
  values.forEach((value) => list.append(value));
  return list;
}

function getNodes<T>(list: SinglyLinkedList<T>): LNode<T>[] {
  const nodes: LNode<T>[] = [];
  let node = list.head;

  while (node !== null) {
    nodes.push(node);
    node = node.next;
  }

  return nodes;
}

function expectListValues<T>(list: SinglyLinkedList<T>, expectedValues: readonly T[]): void {
  expect(getNodes(list).map((node) => node.value)).toEqual(expectedValues);
  expect(list.size).toBe(expectedValues.length);
}

function expectSameNodeReferences<T>(
  actualNodes: readonly LNode<T>[],
  expectedNodes: readonly LNode<T>[],
): void {
  expect(actualNodes).toHaveLength(expectedNodes.length);
  actualNodes.forEach((node, index) => {
    expect(node).toBe(expectedNodes[index]);
  });
}

describe("LNode", () => {
  describe("constructor", () => {
    it("initializes the value and next reference", () => {
      const node = new LNode(1);

      expect(node.value).toBe(1);
      expect(node.next).toBe(null);
    });

    it("allows nodes to be linked", () => {
      const firstNode = new LNode(1);
      const secondNode = new LNode(2);

      firstNode.next = secondNode;

      expect(firstNode.next).toBe(secondNode);
      expect(secondNode.next).toBe(null);
    });
  });
});

describe("SinglyLinkedList", () => {
  describe("prepend", () => {
    it("inserts values at the head and updates the size", () => {
      const list = new SinglyLinkedList<number>();

      expectListValues(list, []);

      list.prepend(1);
      expectListValues(list, [1]);

      list.prepend(2);
      expectListValues(list, [2, 1]);

      list.prepend(3);
      expectListValues(list, [3, 2, 1]);
    });
  });

  describe("append", () => {
    it("inserts values at the tail and updates the size", () => {
      const list = new SinglyLinkedList<number>();

      list.append(1);

      expectListValues(list, [1]);
      expect(list.head).toBe(list.tail);
      expect(list.tail?.next).toBe(null);

      list.append(2);

      expectListValues(list, [1, 2]);
      expect(list.head).not.toBe(list.tail);
      expect(list.tail?.value).toBe(2);
      expect(list.tail?.next).toBe(null);

      list.append(3);

      expectListValues(list, [1, 2, 3]);
      expect(list.head).not.toBe(list.tail);
      expect(list.tail?.value).toBe(3);
      expect(list.tail?.next).toBe(null);
    });
  });

  describe("forEach", () => {
    it("visits every node with its one-based index", () => {
      const list = createList([1, 2, 3]);
      const visited: Array<[number, number]> = [];

      list.forEach((node, index) => {
        visited.push([node.value, index]);
      });

      expect(visited).toEqual([
        [1, 1],
        [2, 2],
        [3, 3],
      ]);
    });
  });

  describe("find", () => {
    it("returns the first matching node", () => {
      const list = createList([1, 3, 2, 1]);
      const firstNode = list.head;

      const result = list.find((node) => node.value === 1);

      expect(result).toBe(firstNode);
      expect(result).not.toBe(list.tail);
    });
  });

  describe("removeAll", () => {
    it("does nothing for an empty list", () => {
      const list = new SinglyLinkedList<number>();
      let calls = 0;

      const result = list.removeAll(() => {
        calls++;
        return true;
      });

      expect(result).toBe(undefined);
      expect(calls).toBe(0);
      expectListValues(list, []);
      expect(list.head).toBe(null);
      expect(list.tail).toBe(null);
    });

    it("keeps the list unchanged when no node matches", () => {
      const list = createList([1, 2, 3]);
      const originalNodes = getNodes(list);

      list.removeAll(() => false);

      expectListValues(list, [1, 2, 3]);
      expectSameNodeReferences(getNodes(list), originalNodes);
      expect(list.head).toBe(originalNodes[0]);
      expect(list.tail).toBe(originalNodes[2]);
      expect(list.tail?.next).toBe(null);
    });

    it("preserves the references of nodes that do not match", () => {
      const list = createList([1, 2, 3, 4, 5]);
      const originalNodes = getNodes(list);

      list.removeAll((node) => node.value % 2 === 0);

      const remainingNodes = getNodes(list);
      const expectedNodes = [originalNodes[0], originalNodes[2], originalNodes[4]];

      expectListValues(list, [1, 3, 5]);
      expectSameNodeReferences(remainingNodes, expectedNodes);
      expect(remainingNodes).not.toContain(originalNodes[1]);
      expect(remainingNodes).not.toContain(originalNodes[3]);
      expect(list.head).toBe(originalNodes[0]);
      expect(list.tail).toBe(originalNodes[4]);
    });

    it("removes matching nodes from the head, middle, and tail", () => {
      const list = createList([2, 2, 1, 2, 3, 2, 2]);
      const visited: Array<[number, number]> = [];

      list.removeAll((node, index) => {
        visited.push([node.value, index]);
        return node.value === 2;
      });

      expect(visited).toEqual([
        [2, 1],
        [2, 2],
        [1, 3],
        [2, 4],
        [3, 5],
        [2, 6],
        [2, 7],
      ]);
      expectListValues(list, [1, 3]);
      expect(list.tail).toBe(list.head?.next);
      expect(list.tail?.next).toBe(null);
    });

    it("updates head and tail when only one node remains", () => {
      const list = createList([1, 2, 3]);
      const remainingNode = getNodes(list)[1];

      list.removeAll((node) => node.value !== 2);

      expectListValues(list, [2]);
      expect(list.head).toBe(remainingNode);
      expect(list.tail).toBe(remainingNode);
      expect(remainingNode.next).toBe(null);
    });

    it("clears the list when every node matches", () => {
      const list = createList([1, 2, 3]);

      list.removeAll(() => true);

      expectListValues(list, []);
      expect(list.head).toBe(null);
      expect(list.tail).toBe(null);
    });
  });
});
