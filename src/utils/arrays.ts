export class Arrays {
  static unique<T>(list: T[]): T[] {
    return [...new Set(list)];
  }
}
