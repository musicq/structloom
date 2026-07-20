# structloom

Type-safe data structures for TypeScript and JavaScript.

## Install

```sh
pnpm add structloom
```

## Usage

```ts
import { Stack } from "structloom";

const stack = new Stack<number>();

stack.push(1).push(2);
stack.pop(); // 2
```

## License

[MIT](LICENSE)
