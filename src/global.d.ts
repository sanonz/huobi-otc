/** Alias type for value that can be null */
type Nullable<T> = T | null;

interface Dictionary<T> {
  [index: string]: T;
}