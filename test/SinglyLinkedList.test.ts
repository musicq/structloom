import { describe, expect, it, vi } from "vitest";
import { LNode, SinglyLinkedList } from "../src/index.ts";

type Visit<T> = readonly [node: LNode<T>, index: number];

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

function expectList<T>(list: SinglyLinkedList<T>, values: readonly T[]): void {
  const nodes = getNodes(list);

  expect(nodes.map((node) => node.value)).toEqual(values);
  expect(list.size).toBe(values.length);
  expect(list.head).toBe(nodes[0] ?? null);
  expect(list.tail).toBe(nodes[nodes.length - 1] ?? null);
  expect(list.tail?.next ?? null).toBe(null);
}

function expectSameNodes<T>(
  actualNodes: readonly LNode<T>[],
  expectedNodes: readonly LNode<T>[],
): void {
  expect(actualNodes).toHaveLength(expectedNodes.length);
  actualNodes.forEach((node, index) => {
    expect(node).toBe(expectedNodes[index]);
  });
}

function expectVisits<T>(visits: readonly Visit<T>[], expectedNodes: readonly LNode<T>[]): void {
  expectSameNodes(
    visits.map(([node]) => node),
    expectedNodes,
  );
  expect(visits.map(([, index]) => index)).toEqual(expectedNodes.map((_, index) => index));
}

describe("LNode", () => {
  it("initializes its value and next reference", () => {
    const node = new LNode(1);

    expect(node.value).toBe(1);
    expect(node.next).toBe(null);
  });

  it("can be linked to another node", () => {
    const firstNode = new LNode(1);
    const secondNode = new LNode(2);

    firstNode.next = secondNode;

    expect(firstNode.next).toBe(secondNode);
    expect(secondNode.next).toBe(null);
  });
});

describe("SinglyLinkedList", () => {
  describe("constructor", () => {
    it("creates an empty list", () => {
      const list = new SinglyLinkedList<number>();

      expectList(list, []);
      expect(list.isEmpty).toBe(true);
    });
  });

  describe("isEmpty", () => {
    it.each(["append", "prepend"] as const)("is false after %s", (method) => {
      const list = new SinglyLinkedList<number>();

      list[method](1);

      expect(list.isEmpty).toBe(false);
    });

    it("becomes true after the last node is removed", () => {
      const list = createList([1]);

      list.removeAll(() => true);

      expect(list.isEmpty).toBe(true);
    });
  });

  describe("prepend", () => {
    it("inserts values at the head and preserves the original tail", () => {
      const list = new SinglyLinkedList<number>();

      list.prepend(1);
      const originalTail = list.tail;
      expectList(list, [1]);

      list.prepend(2);
      list.prepend(3);

      expectList(list, [3, 2, 1]);
      expect(list.tail).toBe(originalTail);
    });
  });

  describe("append", () => {
    it("inserts values at the tail and preserves the original head", () => {
      const list = new SinglyLinkedList<number>();

      list.append(1);
      const originalHead = list.head;
      expectList(list, [1]);

      list.append(2);
      list.append(3);

      expectList(list, [1, 2, 3]);
      expect(list.head).toBe(originalHead);
    });
  });

  describe("from", () => {
    it("creates a list containing every value in the original order", () => {
      const list = SinglyLinkedList.from([1, 2, 3]);

      expectList(list, [1, 2, 3]);
    });
  });

  describe("forEach", () => {
    it("visits every node with its zero-based index", () => {
      const list = createList([1, 2, 3]);
      const nodes = getNodes(list);
      const visits: Visit<number>[] = [];

      list.forEach((node, index) => visits.push([node, index]));

      expectVisits(visits, nodes);
    });

    it("does not invoke the callback for an empty list", () => {
      const callback = vi.fn();

      const result = new SinglyLinkedList<number>().forEach(callback);

      expect(result).toBeUndefined();
      expect(callback).not.toHaveBeenCalled();
    });

    it("ignores callback return values", () => {
      const list = createList([1, 2, 3]);
      const visitedValues: number[] = [];

      const result = list.forEach((node) => {
        visitedValues.push(node.value);
        return false;
      });

      expect(result).toBeUndefined();
      expect(visitedValues).toEqual([1, 2, 3]);
    });
  });

  describe("find", () => {
    it("returns the first match and stops visiting", () => {
      const list = createList([1, 3, 2, 2]);
      const nodes = getNodes(list);
      const visits: Visit<number>[] = [];

      const result = list.find((node, index) => {
        visits.push([node, index]);
        return node.value === 2;
      });

      expect(result).toBe(nodes[2]);
      expectVisits(visits, nodes.slice(0, 3));
    });

    it("returns null after visiting every node when nothing matches", () => {
      const list = createList([1, 2, 3]);
      const nodes = getNodes(list);
      const visits: Visit<number>[] = [];

      const result = list.find((node, index) => {
        visits.push([node, index]);
        return false;
      });

      expect(result).toBeNull();
      expectVisits(visits, nodes);
    });

    it("does not invoke the predicate for an empty list", () => {
      const predicate = vi.fn(() => true);

      const result = new SinglyLinkedList<number>().find(predicate);

      expect(result).toBeNull();
      expect(predicate).not.toHaveBeenCalled();
    });
  });

  describe("insert", () => {
    it("inserts the supplied node after the first match and stops visiting", () => {
      const list = createList([1, 2, 2, 4]);
      const originalNodes = getNodes(list);
      const newNode = new LNode(3);
      const visits: Visit<number>[] = [];

      const result = list.insert((node, index) => {
        visits.push([node, index]);
        return node.value === 2;
      }, newNode);

      expect(result).toBeUndefined();
      expectVisits(visits, originalNodes.slice(0, 2));
      expectList(list, [1, 2, 3, 2, 4]);
      expectSameNodes(getNodes(list), [
        originalNodes[0],
        originalNodes[1],
        newNode,
        originalNodes[2],
        originalNodes[3],
      ]);
    });

    it("wraps a supplied value in a node and updates the tail", () => {
      const list = createList([1, 2, 3]);
      const originalNodes = getNodes(list);

      list.insert((node) => node.value === 3, 4);

      const nodes = getNodes(list);
      expectList(list, [1, 2, 3, 4]);
      expectSameNodes(nodes.slice(0, 3), originalNodes);
      expect(nodes[3]).toBeInstanceOf(LNode);
      expect(list.tail).toBe(nodes[3]);
    });

    it("leaves the list and supplied node unchanged when nothing matches", () => {
      const list = createList([1, 2, 3]);
      const originalNodes = getNodes(list);
      const newNode = new LNode(4);
      const visits: Visit<number>[] = [];

      list.insert((node, index) => {
        visits.push([node, index]);
        return false;
      }, newNode);

      expectVisits(visits, originalNodes);
      expectList(list, [1, 2, 3]);
      expectSameNodes(getNodes(list), originalNodes);
      expect(newNode.next).toBeNull();
    });

    it("does nothing for an empty list", () => {
      const list = new SinglyLinkedList<number>();
      const newNode = new LNode(1);
      const predictor = vi.fn(() => true);

      const result = list.insert(predictor, newNode);

      expect(result).toBeUndefined();
      expect(predictor).not.toHaveBeenCalled();
      expectList(list, []);
      expect(newNode.next).toBeNull();
    });
  });

  describe("removeFirst", () => {
    it("removes and returns the head node", () => {
      const list = createList([1, 2, 3]);
      const originalNodes = getNodes(list);

      const removedNode = list.removeFirst();

      expect(removedNode).toBe(originalNodes[0]);
      expect(removedNode?.next).toBeNull();
      console.log(list.head);
      expectList(list, [2, 3]);
      expectSameNodes(getNodes(list), originalNodes.slice(1));
    });

    it("clears head and tail when removing the only node", () => {
      const list = createList([1]);
      const onlyNode = list.head;

      const removedNode = list.removeFirst();

      expect(removedNode).toBe(onlyNode);
      expect(removedNode?.next).toBeNull();
      expectList(list, []);
    });

    it("returns null when the list is empty", () => {
      const list = new SinglyLinkedList<number>();

      const removedNode = list.removeFirst();

      expect(removedNode).toBeNull();
      expectList(list, []);
    });
  });

  describe("removeLast", () => {
    it("removes and returns the tail node", () => {
      const list = createList([1, 2, 3]);
      const originalNodes = getNodes(list);

      const removedNode = list.removeLast();

      expect(removedNode).toBe(originalNodes[2]);
      expect(removedNode?.next).toBeNull();
      console.log(list.head);
      expectList(list, [1, 2]);
      expectSameNodes(getNodes(list), originalNodes.slice(0, -1));
    });

    it("clears head and tail when removing the only node", () => {
      const list = createList([1]);
      const onlyNode = list.tail;

      const removedNode = list.removeLast();

      expect(removedNode).toBe(onlyNode);
      expect(removedNode?.next).toBeNull();
      expectList(list, []);
    });

    it("returns null when the list is empty", () => {
      const list = new SinglyLinkedList<number>();

      const removedNode = list.removeLast();

      expect(removedNode).toBeNull();
      expectList(list, []);
    });
  });

  describe("removeAll", () => {
    it("does nothing for an empty list", () => {
      const list = new SinglyLinkedList<number>();
      const predicate = vi.fn(() => true);

      const result = list.removeAll(predicate);

      expect(result).toBe(0);
      expect(predicate).not.toHaveBeenCalled();
      expectList(list, []);
    });

    it("keeps the list unchanged when nothing matches", () => {
      const list = createList([1, 2, 3]);
      const originalNodes = getNodes(list);

      const removedCount = list.removeAll(() => false);

      expect(removedCount).toBe(0);
      expectList(list, [1, 2, 3]);
      expectSameNodes(getNodes(list), originalNodes);
    });

    it("preserves the nodes that do not match", () => {
      const list = createList([1, 2, 3, 4, 5]);
      const originalNodes = getNodes(list);

      const removedCount = list.removeAll((node) => node.value % 2 === 0);

      expect(removedCount).toBe(2);
      expectList(list, [1, 3, 5]);
      expectSameNodes(getNodes(list), [originalNodes[0], originalNodes[2], originalNodes[4]]);
    });

    it("removes matches from the head, middle, and tail", () => {
      const list = createList([2, 2, 1, 2, 3, 2, 2]);
      const originalNodes = getNodes(list);
      const visits: Visit<number>[] = [];

      const removedCount = list.removeAll((node, index) => {
        visits.push([node, index]);
        return node.value === 2;
      });

      expect(removedCount).toBe(5);
      expectVisits(visits, originalNodes);
      expectList(list, [1, 3]);
    });

    it("updates head and tail when only one node remains", () => {
      const list = createList([1, 2, 3]);
      const remainingNode = getNodes(list)[1];

      const removedCount = list.removeAll((node) => node.value !== 2);

      expect(removedCount).toBe(2);
      expectList(list, [2]);
      expectSameNodes(getNodes(list), [remainingNode]);
    });

    it("clears the list when every node matches", () => {
      const list = createList([1, 2, 3]);

      const removedCount = list.removeAll(() => true);

      expect(removedCount).toBe(3);
      expectList(list, []);
    });

    it("supports inserting values after the list is cleared", () => {
      const list = createList([1, 2, 3]);

      const removedCount = list.removeAll(() => true);
      list.append(2);
      list.prepend(1);

      expect(removedCount).toBe(3);
      expectList(list, [1, 2]);
    });

    it("supports appending after the tail is removed", () => {
      const list = createList([1, 2, 3]);
      const preservedNodes = getNodes(list).slice(0, 2);

      const removedCount = list.removeAll((node) => node.value === 3);
      list.append(4);

      expect(removedCount).toBe(1);
      expectList(list, [1, 2, 4]);
      expectSameNodes(getNodes(list).slice(0, 2), preservedNodes);
    });
  });
});
