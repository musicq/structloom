import { describe, expect, it, vi } from "vitest";
import { SinglyLinkedList } from "../src/index.ts";

type Visit<T> = readonly [value: T, index: number];

function createList<T>(values: Iterable<T>): SinglyLinkedList<T> {
  return SinglyLinkedList.from(values);
}

function expectList<T>(list: SinglyLinkedList<T>, values: readonly T[]): void {
  const iterator = list[Symbol.iterator]();

  for (const expectedValue of values) {
    const result = iterator.next();

    expect(result.done).toBe(false);
    expect(result.value).toEqual(expectedValue);
  }

  expect(iterator.next()).toEqual({ value: undefined, done: true });
  expect(list.size).toBe(values.length);
  expect(list.isEmpty).toBe(values.length === 0);
  expect(list.first).toBe(values.length === 0 ? undefined : values[0]);
  expect(list.last).toBe(values.length === 0 ? undefined : values[values.length - 1]);
}

function expectVisits<T>(visits: readonly Visit<T>[], expectedValues: readonly T[]): void {
  expect(visits.map(([value]) => value)).toEqual(expectedValues);
  expect(visits.map(([, index]) => index)).toEqual(expectedValues.map((_, index) => index));
}

describe("SinglyLinkedList", () => {
  describe("constructor", () => {
    it("creates an empty list", () => {
      const list = new SinglyLinkedList<number>();

      expectList(list, []);
    });
  });

  describe("prepend", () => {
    it("inserts values at the beginning and preserves the last value", () => {
      const list = new SinglyLinkedList<number>();

      list.prepend(1);
      expectList(list, [1]);

      list.prepend(2);
      expectList(list, [2, 1]);

      list.prepend(3);
      expectList(list, [3, 2, 1]);
    });
  });

  describe("append", () => {
    it("inserts values at the end and preserves the first value", () => {
      const list = new SinglyLinkedList<number>();

      list.append(1);
      expectList(list, [1]);

      list.append(2);
      expectList(list, [1, 2]);

      list.append(3);
      expectList(list, [1, 2, 3]);
    });
  });

  describe("from", () => {
    it("copies array values in order without retaining or modifying the source", () => {
      const values = [1, 2, 3];
      const list = SinglyLinkedList.from(values);

      expect(values).toEqual([1, 2, 3]);
      values.reverse();
      expectList(list, [1, 2, 3]);
      expectList(SinglyLinkedList.from<number>([]), []);
    });

    it("accepts non-array iterables", () => {
      const values = new Set([1, 2, 3]);

      expectList(SinglyLinkedList.from(values), [1, 2, 3]);
    });

    it("consumes a generator once and preserves its yield order", () => {
      function* values(): Generator<number> {
        yield 1;
        yield 2;
        yield 3;
      }

      expectList(SinglyLinkedList.from(values()), [1, 2, 3]);
    });
  });

  describe("iterator", () => {
    it.each([
      { values: [1, 2, 3], expectedValues: [1, 2, 3] },
      { values: [], expectedValues: [] },
    ])("supports for...of iteration over $values", ({ values, expectedValues }) => {
      const list = createList(values);
      const iteratedValues: number[] = [];

      for (const value of list) {
        iteratedValues.push(value);
      }

      expect(iteratedValues).toEqual(expectedValues);
      expectList(list, values);
    });

    it("starts from the beginning for every traversal", () => {
      const values = [1, 2, 3];
      const list = createList(values);

      for (let traversal = 0; traversal < 2; traversal++) {
        const iteratedValues: number[] = [];

        for (const value of list) {
          iteratedValues.push(value);
        }

        expect(iteratedValues).toEqual(values);
      }

      expectList(list, values);
    });

    it("returns an iterable iterator that continues from its current position", () => {
      const list = createList([1, 2, 3]);
      const iterator: IterableIterator<number> = list[Symbol.iterator]();

      expect(iterator[Symbol.iterator]()).toBe(iterator);
      expect(iterator.next()).toEqual({ value: 1, done: false });

      const remainingValues: number[] = [];
      for (const value of iterator) {
        remainingValues.push(value);
      }

      expect(remainingValues).toEqual([2, 3]);
      expect(iterator.next()).toEqual({ value: undefined, done: true });
    });

    it("allows two iterators to be consumed independently and interleaved", () => {
      const list = createList([1, 2, 3]);
      const firstIterator = list[Symbol.iterator]();
      const secondIterator = list[Symbol.iterator]();

      expect(firstIterator.next()).toEqual({ value: 1, done: false });
      expect(firstIterator.next()).toEqual({ value: 2, done: false });
      expect(secondIterator.next()).toEqual({ value: 1, done: false });
      expect(firstIterator.next()).toEqual({ value: 3, done: false });
      expect(secondIterator.next()).toEqual({ value: 2, done: false });
      expect(secondIterator.next()).toEqual({ value: 3, done: false });
      expect(firstIterator.next()).toEqual({ value: undefined, done: true });
      expect(secondIterator.next()).toEqual({ value: undefined, done: true });
      expectList(list, [1, 2, 3]);
    });
  });

  describe("forEach", () => {
    it("visits every value with its zero-based index regardless of callback results", () => {
      const list = createList([1, 2, 3]);
      const visits: Visit<number>[] = [];

      list.forEach((value, index) => {
        visits.push([value, index]);
        return false;
      });

      expectVisits(visits, [1, 2, 3]);
    });

    it("does not invoke the callback for an empty list", () => {
      const callback = vi.fn();

      new SinglyLinkedList<number>().forEach(callback);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("find", () => {
    it("returns the first matching value and stops visiting", () => {
      const list = createList([1, 3, 2, 2]);
      const visits: Visit<number>[] = [];

      const result = list.find((value, index) => {
        visits.push([value, index]);
        return value === 2;
      });

      expect(result).toBe(2);
      expectVisits(visits, [1, 3, 2]);
    });

    it("returns undefined after visiting every value when nothing matches", () => {
      const list = createList([1, 2, 3]);
      const visits: Visit<number>[] = [];

      const result = list.find((value, index) => {
        visits.push([value, index]);
        return false;
      });

      expect(result).toBeUndefined();
      expectVisits(visits, [1, 2, 3]);
    });

    it("does not invoke the predicate for an empty list", () => {
      const predicate = vi.fn(() => true);

      const result = new SinglyLinkedList<number>().find(predicate);

      expect(result).toBeUndefined();
      expect(predicate).not.toHaveBeenCalled();
    });
  });

  describe("insertAfter", () => {
    it("inserts a value after the first match and stops visiting", () => {
      const list = createList([1, 2, 2, 4]);
      const visits: Visit<number>[] = [];

      const inserted = list.insertAfter((value, index) => {
        visits.push([value, index]);
        return value === 2;
      }, 3);

      expect(inserted).toBe(true);
      expectVisits(visits, [1, 2]);
      expectList(list, [1, 2, 3, 2, 4]);
    });

    it("inserts after the last value and updates last", () => {
      const list = createList([1, 2, 3]);

      const inserted = list.insertAfter((value) => value === 3, 4);

      expect(inserted).toBe(true);
      expectList(list, [1, 2, 3, 4]);
    });

    it("returns false and leaves the list unchanged when nothing matches", () => {
      const list = createList([1, 2, 3]);
      const visits: Visit<number>[] = [];

      const inserted = list.insertAfter((value, index) => {
        visits.push([value, index]);
        return false;
      }, 4);

      expect(inserted).toBe(false);
      expectVisits(visits, [1, 2, 3]);
      expectList(list, [1, 2, 3]);
    });

    it("returns false without invoking the predicate for an empty list", () => {
      const list = new SinglyLinkedList<number>();
      const predicate = vi.fn(() => true);

      const inserted = list.insertAfter(predicate, 1);

      expect(inserted).toBe(false);
      expect(predicate).not.toHaveBeenCalled();
      expectList(list, []);
    });

    it("stores an object value without copying it", () => {
      const firstValue = { id: 1 };
      const insertedValue = { id: 2 };
      const list = createList([firstValue]);

      const inserted = list.insertAfter(() => true, insertedValue);

      expect(inserted).toBe(true);
      expectList(list, [firstValue, insertedValue]);
      expect(list.last).toBe(insertedValue);
    });
  });

  describe("reverse", () => {
    it("reverses the values in place and updates both ends", () => {
      const list = createList([1, 2, 3, 4]);

      const result = list.reverse();

      expect(result).toBeUndefined();
      expectList(list, [4, 3, 2, 1]);
    });

    it.each([
      { description: "an empty list", values: [] },
      { description: "a single-value list", values: [1] },
    ])("leaves $description unchanged", ({ values }) => {
      const list = createList(values);

      const result = list.reverse();

      expect(result).toBeUndefined();
      expectList(list, values);
    });

    it("supports append and prepend after reversing", () => {
      const list = createList([1, 2, 3]);

      list.reverse();
      expectList(list, [3, 2, 1]);

      list.append(0);
      expectList(list, [3, 2, 1, 0]);

      list.prepend(4);
      expectList(list, [4, 3, 2, 1, 0]);
    });
  });

  describe.each([
    { method: "removeFirst", removedValue: 1, remainingValues: [2, 3] },
    { method: "removeLast", removedValue: 3, remainingValues: [1, 2] },
  ] as const)("$method", ({ method, removedValue, remainingValues }) => {
    it("removes and returns the expected end value", () => {
      const list = createList([1, 2, 3]);

      const result = list[method]();

      expect(result).toBe(removedValue);
      expectList(list, remainingValues);
    });

    it("clears the list when removing its only value", () => {
      const list = createList([1]);

      const result = list[method]();

      expect(result).toBe(1);
      expectList(list, []);
    });

    it("returns undefined when the list is empty", () => {
      const list = new SinglyLinkedList<number>();

      const result = list[method]();

      expect(result).toBeUndefined();
      expectList(list, []);
    });

    it("preserves public state while removing values until empty", () => {
      const list = createList([1, 2, 3]);
      const expectedValues = method === "removeFirst" ? [[2, 3], [3], []] : [[1, 2], [1], []];

      for (const values of expectedValues) {
        list[method]();
        expectList(list, values);
      }
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

      const removedCount = list.removeAll(() => false);

      expect(removedCount).toBe(0);
      expectList(list, [1, 2, 3]);
    });

    it("removes matches from the beginning, middle, and end", () => {
      const list = createList([2, 2, 1, 2, 3, 2, 2]);
      const visits: Visit<number>[] = [];

      const removedCount = list.removeAll((value, index) => {
        visits.push([value, index]);
        return value === 2;
      });

      expect(removedCount).toBe(5);
      expectVisits(visits, [2, 2, 1, 2, 3, 2, 2]);
      expectList(list, [1, 3]);
    });

    it("updates first and last when only one value remains", () => {
      const list = createList([1, 2, 3]);

      const removedCount = list.removeAll((value) => value !== 2);

      expect(removedCount).toBe(2);
      expectList(list, [2]);
    });

    it("clears the list when every value matches", () => {
      const list = createList([1, 2, 3]);

      const removedCount = list.removeAll(() => true);

      expect(removedCount).toBe(3);
      expectList(list, []);
    });

    it.each([
      {
        description: "the first value",
        values: [1, 2, 3],
        predicate: (value: number) => value === 1,
        expectedValues: [2, 3],
      },
      {
        description: "the last value",
        values: [1, 2, 3],
        predicate: (value: number) => value === 3,
        expectedValues: [1, 2],
      },
      {
        description: "consecutive values",
        values: [1, 2, 2, 3],
        predicate: (value: number) => value === 2,
        expectedValues: [1, 3],
      },
    ])(
      "preserves public state when removing $description",
      ({ values, predicate, expectedValues }) => {
        const list = createList(values);

        list.removeAll(predicate);

        expectList(list, expectedValues);
      },
    );
  });

  describe("value semantics", () => {
    it("preserves object identity through storage, lookup, reversal, and removal", () => {
      const firstValue = { id: "first" };
      const middleValue = { id: "middle" };
      const insertedValue = { id: "inserted" };
      const lastValue = { id: "last" };
      const list = createList([middleValue]);

      list.prepend(firstValue);
      list.append(lastValue);
      list.insertAfter((value) => value === middleValue, insertedValue);
      expectList(list, [firstValue, middleValue, insertedValue, lastValue]);

      const iteratedValues = [...list];
      expect(iteratedValues[0]).toBe(firstValue);
      expect(iteratedValues[1]).toBe(middleValue);
      expect(iteratedValues[2]).toBe(insertedValue);
      expect(iteratedValues[3]).toBe(lastValue);
      expect(list.find((value) => value.id === "inserted")).toBe(insertedValue);

      list.reverse();
      expectList(list, [lastValue, insertedValue, middleValue, firstValue]);
      expect(list.removeFirst()).toBe(lastValue);
      expect(list.removeLast()).toBe(firstValue);
      expectList(list, [insertedValue, middleValue]);
    });

    it("stores undefined as a legitimate value", () => {
      const list = new SinglyLinkedList<number | undefined>();

      list.append(undefined);
      expectList(list, [undefined]);

      const predicate = vi.fn((value: number | undefined) => value === undefined);
      expect(list.find(predicate)).toBeUndefined();
      expect(predicate).toHaveBeenCalledOnce();
      expect(predicate).toHaveBeenCalledWith(undefined, 0);

      expect(list.removeFirst()).toBeUndefined();
      expectList(list, []);

      list.prepend(undefined);
      list.append(1);
      expect(list.insertAfter((value) => value === undefined, undefined)).toBe(true);
      expectList(list, [undefined, undefined, 1]);

      expect(list.removeLast()).toBe(1);
      expectList(list, [undefined, undefined]);
      expect(list.removeAll((value) => value === undefined)).toBe(2);
      expectList(list, []);
    });
  });

  it("updates all public state after every mutation", () => {
    const list = new SinglyLinkedList<number>();

    expectList(list, []);

    list.append(2);
    expectList(list, [2]);

    list.prepend(1);
    expectList(list, [1, 2]);

    list.append(4);
    expectList(list, [1, 2, 4]);

    expect(list.insertAfter((value) => value === 2, 3)).toBe(true);
    expectList(list, [1, 2, 3, 4]);

    list.reverse();
    expectList(list, [4, 3, 2, 1]);

    expect(list.removeFirst()).toBe(4);
    expectList(list, [3, 2, 1]);

    expect(list.removeLast()).toBe(1);
    expectList(list, [3, 2]);

    expect(list.removeAll((value) => value === 3)).toBe(1);
    expectList(list, [2]);

    expect(list.removeAll(() => true)).toBe(1);
    expectList(list, []);
  });
});
