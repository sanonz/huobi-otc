interface Stringifyable {
  /**
   * Stringifies the imported stylesheet for use with inline style tags
   */
  toString(): string;
}

interface SelectorNode {
  /**
   * Returns the specific selector from imported stylesheet as string
   */
  [key: string]: string;
}

interface Useable {
  locals: SelectorNode;
  
  use();
  unuse();
  ref();
  unref();
}

declare module "*.less" {
  const styles: Stringifyable & Useable;
  export default styles;
}
