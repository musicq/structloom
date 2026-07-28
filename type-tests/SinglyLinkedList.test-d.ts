import { describe, expectTypeOf, it } from "vitest";
import { LNode, SinglyLinkedList } from "../src/index.ts";

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

    expectTypeOf(found).toEqualTypeOf<LNode<number> | null>();
  });

  it("accepts only values in insertAfter and reports success", () => {
    const list = SinglyLinkedList.from([1, 2, 3]);

    const inserted = list.insertAfter((value) => value === 2, 4);

    expectTypeOf(inserted).toEqualTypeOf<boolean>();

    // @ts-expect-error -- A structural node cannot be inserted into a list of numbers.
    list.insertAfter(() => true, new LNode(4));

    // @ts-expect-error -- insert was replaced by the explicit insertAfter API.
    list.insert(() => true, 4);
  });

  it("allows LNode instances when they are the declared value type", () => {
    const first = new LNode(1);
    const second = new LNode(2);
    const list = SinglyLinkedList.from<LNode<number>>([first]);

    const inserted = list.insertAfter((value) => value === first, second);

    expectTypeOf(inserted).toEqualTypeOf<boolean>();
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
