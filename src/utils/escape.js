export class Escape {
  static regex(value) {
    return value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  }
}
