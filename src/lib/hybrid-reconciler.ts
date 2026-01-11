import { KnowledgeGraph, Relation, Entity } from '../../worker/types';
export interface FusedContext {
  entities: Entity[];
  relations: Relation[];
  score: number;
}
export function getFusedContext(
  query: string,
  kg: KnowledgeGraph | undefined,
  limit: number = 5
): FusedContext {
  if (!kg || !kg.entities) {
    return { entities: [], relations: [], score: 0 };
  }
  const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  // 1. Identify seed entities in query with word boundary check
  const seeds = Object.values(kg.entities).filter((e: Entity) => {
    const canonical = e.canonical.toLowerCase();
    return queryWords.some(word => canonical.includes(word) || e.id.includes(word));
  });
  if (seeds.length === 0) {
    return { entities: [], relations: [], score: 0.2 };
  }
  // 2. Expand graph (1-hop)
  const relevantRelations = kg.relations.filter((r: Relation) =>
    seeds.some(s => s.id === r.sourceId || s.id === r.targetId)
  );
  const neighborIds = new Set(relevantRelations.flatMap(r => [r.sourceId, r.targetId]));
  const relevantEntities = Object.values(kg.entities)
    .filter((e: Entity) => neighborIds.has(e.id))
    .sort((a, b) => {
      const aRecency = a.lastMentioned;
      const bRecency = b.lastMentioned;
      return bRecency - aRecency;
    })
    .slice(0, limit);
  return {
    entities: relevantEntities,
    relations: relevantRelations.slice(0, limit),
    score: Math.min(1, seeds.length * 0.2 + 0.4)
  };
}