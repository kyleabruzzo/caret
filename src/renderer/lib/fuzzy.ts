export type FuzzyMatch = {
  value: string;
  score: number;
  positions: number[];
};

export function fuzzyFilter(query: string, items: string[], limit = 100): FuzzyMatch[] {
  if (!query) return items.slice(0, limit).map((value) => ({ value, score: 0, positions: [] }));

  const q = query.toLowerCase();
  const out: FuzzyMatch[] = [];

  for (const value of items) {
    const match = scoreOne(q, value);
    if (match) out.push({ value, ...match });
  }

  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit);
}

function scoreOne(query: string, value: string): { score: number; positions: number[] } | null {
  const haystack = value.toLowerCase();
  const positions: number[] = [];
  let qi = 0;
  let lastMatch = -1;
  let score = 0;

  for (let i = 0; i < haystack.length && qi < query.length; i++) {
    if (haystack[i] !== query[qi]) continue;

    positions.push(i);
    const gap = lastMatch === -1 ? 0 : i - lastMatch - 1;
    score += 10 - Math.min(gap, 8);
    if (isBoundary(value, i)) score += 8;
    if (i === lastMatch + 1) score += 4;
    lastMatch = i;
    qi += 1;
  }

  if (qi < query.length) return null;

  const baseLen = value.length;
  score -= Math.min(baseLen / 8, 12);
  return { score, positions };
}

function isBoundary(value: string, i: number): boolean {
  if (i === 0) return true;
  const prev = value[i - 1];
  return prev === '/' || prev === '\\' || prev === '.' || prev === '-' || prev === '_';
}
