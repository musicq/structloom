import { describe, expect, it, vi } from "vitest";
import { LNode, SinglyLinkedList } from "../src/index.ts";

type Visit<T> = readonly [node: LNode<T>, index: number];

function createList<T>(values: readonly T[]): SinglyLinkedList<T> {
  return SinglyLinkedList.from([...values]);
}

function getNodes<T>(list: SinglyLinkedList<T>): LNode<T>[] {
  const nodes: LNode<T>[] = [];
  const visited = new Set<LNode<T>>();
  let node = list.head;

  while (node !== null) {
    if (visited.has(node)) {
      throw new Error("Cycle detected while traversing the list");
    }

    visited.add(node);
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
  expect(list.isEmpty).toBe(values.length === 0);
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
    it("copies values in order without retaining or modifying the source array", () => {
      const values = [1, 2, 3];
      const list = SinglyLinkedList.from(values);

      expect(values).toEqual([1, 2, 3]);
      values.reverse();
      expectList(list, [1, 2, 3]);
      expectList(SinglyLinkedList.from<number>([]), []);
    });
  });

  describe("forEach", () => {
    it("visits every node with its zero-based index regardless of callback results", () => {
      const list = createList([1, 2, 3]);
      const nodes = getNodes(list);
      const visits: Visit<number>[] = [];

      list.forEach((node, index) => {
        visits.push([node, index]);
        return false;
      });

      expectVisits(visits, nodes);
    });

    it("does not invoke the callback for an empty list", () => {
      const callback = vi.fn();

      new SinglyLinkedList<number>().forEach(callback);

      expect(callback).not.toHaveBeenCalled();
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

      list.insert((node, index) => {
        visits.push([node, index]);
        return node.value === 2;
      }, newNode);

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

      list.insert(predictor, newNode);

      expect(predictor).not.toHaveBeenCalled();
      expectList(list, []);
      expect(newNode.next).toBeNull();
    });
  });

  describe("reverse", () => {
    it("reverses the links in place and swaps the head and tail", () => {
      const list = createList([1, 2, 3, 4]);
      const originalNodes = getNodes(list);

      const result = list.reverse();

      expect(result).toBeUndefined();
      console.log(list.head)
      expectList(list, [4, 3, 2, 1]);
      expectSameNodes(getNodes(list), [...originalNodes].reverse());
      expect(list.head).toBe(originalNodes[3]);
      expect(list.tail).toBe(originalNodes[0]);
    });

    it.each([
      { description: "an empty list", values: [] },
      { description: "a single-node list", values: [1] },
    ])("leaves $description unchanged", ({ values }) => {
      const list = createList(values);
      const originalNodes = getNodes(list);

      const result = list.reverse();

      expect(result).toBeUndefined();
      expectList(list, values);
      expectSameNodes(getNodes(list), originalNodes);
    });
  });

  describe.each([
    { method: "removeFirst", removedIndex: 0, remainingValues: [2, 3] },
    { method: "removeLast", removedIndex: 2, remainingValues: [1, 2] },
  ] as const)("$method", ({ method, removedIndex, remainingValues }) => {
    it("removes and returns the expected end node", () => {
      const list = createList([1, 2, 3]);
      const originalNodes = getNodes(list);

      const removedNode = list[method]();

      expect(removedNode).toBe(originalNodes[removedIndex]);
      expect(removedNode?.next).toBeNull();
      expectList(list, remainingValues);
      expectSameNodes(
        getNodes(list),
        method === "removeFirst" ? originalNodes.slice(1) : originalNodes.slice(0, -1),
      );
    });

    it("clears head and tail when removing the only node", () => {
      const list = createList([1]);
      const onlyNode = method === "removeFirst" ? list.head : list.tail;

      const removedNode = list[method]();

      expect(removedNode).toBe(onlyNode);
      expect(removedNode?.next).toBeNull();
      expectList(list, []);
    });

    it("returns null when the list is empty", () => {
      const list = new SinglyLinkedList<number>();

      const removedNode = list[method]();

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

    it("removes matches from the head, middle, and tail while preserving other nodes", () => {
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
      expectSameNodes(getNodes(list), [originalNodes[2], originalNodes[4]]);
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
  });
});
