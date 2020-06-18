export class Escape {
  /**
   * Escapes any regular expression values from a given string.
   *
   * @param value - the regular expression string to escape.
   * @returns the escaped regular expression
   */
  static regex(value: string): string {
    return value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  }
}
