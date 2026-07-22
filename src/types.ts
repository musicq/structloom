export type Predicator<T> = (element: T, index: number) => boolean;
export type Visitor<T, R = void> = (element: T, index: number) => R;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;
