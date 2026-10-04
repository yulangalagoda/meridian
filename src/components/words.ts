// Counts written out the way the references write them: "All twelve
// constellations", "a constellation of three", "Star II of III".
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

export const inWords = (n: number) => WORDS[n] ?? String(n);

export function roman(n: number): string {
  const R: [number, string][] = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let out = '';
  for (const [v, s] of R) while (n >= v) { out += s; n -= v; }
  return out;
}
