declare class Random {
    /**
     * Generates a random number between the max and min.
     *
     * @param min - the minimum possible number.
     * @param max - the maximum possible number.
     * @returns a random number.
     */
    integer(min: number, max: number): number;
    /**
     * Randomly picks an item from the list.
     *
     * @param list - the list to pick an item from.
     * @returns a random item from the list.
     */
    pickone<T>(list: T[]): T;
}
export declare const random: Random;
export {};
