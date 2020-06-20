class Random {
  /**
   * Generates a random number between the max and min.
   *
   * @param min - the minimum possible number.
   * @param max - the maximum possible number.
   * @returns a random number.
   */
  integer(min: number, max: number): number {
    return Math.round(Math.random() * (max - min) + min);
  }

  /**
   * Randomly picks an item from the list.
   *
   * @param list - the list to pick an item from.
   * @returns a random item from the list.
   */
  pickone<T>(list: T[]): T {
    return list[this.integer(0, list.length - 1)];
  }
}

export const random = new Random();
