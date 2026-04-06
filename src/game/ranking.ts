import { RankingEntry } from './types';

const RANKING_KEY = 'genios-dos-calculos-ranking';

export function getRanking(): RankingEntry[] {
  try {
    const data = localStorage.getItem(RANKING_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToRanking(entry: RankingEntry) {
  const ranking = getRanking();
  ranking.push(entry);
  ranking.sort((a, b) => b.score - a.score);
  localStorage.setItem(RANKING_KEY, JSON.stringify(ranking.slice(0, 50)));
}
