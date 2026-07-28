import { describe, expectTypeOf, it } from "vitest";
// @ts-expect-error -- LNode is an internal implementation detail.
import { LNode } from "../src/index.ts";
import { SinglyLinkedList } from "../src/index.ts";

describe("SinglyLinkedList types", () => {
  it("passes values and indexes to callbacks", () => {
    const list = SinglyLinkedList.from([1, 2, 3]);

    list.forEach((value, index) => {
      expectTypeOf(value).toEqualTypeOf<number>();
      expectTypeOf(index).toEqualTypeOf<number>();
    });

    list.removeAll((value, index) => {
      expectTypeOf(value).toEqualTypeOf<number>();
      expectTypeOf(index).toEqualTypeOf<number>();
      return value === index;
    });

    const found = list.find((value, index) => {
      expectTypeOf(value).toEqualTypeOf<number>();
      expectTypeOf(index).toEqualTypeOf<number>();
      return value === index;
    });

    expectTypeOf(found).toEqualTypeOf<number | undefined>();
    expectTypeOf(list.first).toEqualTypeOf<number | undefined>();
    expectTypeOf(list.last).toEqualTypeOf<number | undefined>();
    expectTypeOf(list.removeFirst()).toEqualTypeOf<number | undefined>();
    expectTypeOf(list.removeLast()).toEqualTypeOf<number | undefined>();
  });

  it("accepts only values in insertAfter and reports success", () => {
    const list = SinglyLinkedList.from([1, 2, 3]);

    const inserted = list.insertAfter((value) => value === 2, 4);

    expectTypeOf(inserted).toEqualTypeOf<boolean>();

    // @ts-expect-error -- An object cannot be inserted into a list of numbers.
    list.insertAfter(() => true, { value: 4 });

    // @ts-expect-error -- insert was replaced by the explicit insertAfter API.
    list.insert(() => true, 4);
  });

  it("allows objects when they are the declared value type", () => {
    const first = { id: 1 };
    const second = { id: 2 };
    const list = SinglyLinkedList.from([first]);

    const inserted = list.insertAfter((value) => value === first, second);

    expectTypeOf(inserted).toEqualTypeOf<boolean>();
    expectTypeOf(list.first).toEqualTypeOf<{ id: number } | undefined>();
    expectTypeOf(list.find((value) => value === second)).toEqualTypeOf<
      { id: number } | undefined
    >();
  });

  it("accepts any iterable and infers its element type", () => {
    const fromSet = SinglyLinkedList.from(new Set([1, 2]));

    function* strings(): Generator<string> {
      yield "one";
      yield "two";
    }

    const fromGenerator = SinglyLinkedList.from(strings());

    expectTypeOf(fromSet).toEqualTypeOf<SinglyLinkedList<number>>();
    expectTypeOf(fromGenerator).toEqualTypeOf<SinglyLinkedList<string>>();
  });

  it("is iterable and returns iterable iterators of values", () => {
    const list = SinglyLinkedList.from([1, 2, 3]);
    const iterator = list[Symbol.iterator]();

    expectTypeOf(list).toMatchTypeOf<Iterable<number>>();
    expectTypeOf(iterator).toEqualTypeOf<IterableIterator<number>>();

    for (const value of list) {
      expectTypeOf(value).toEqualTypeOf<number>();
    }

    for (const value of iterator) {
      expectTypeOf(value).toEqualTypeOf<number>();
    }
  });
});
