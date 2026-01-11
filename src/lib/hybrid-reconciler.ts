import { KnowledgeGraph, Relation, Entity } from '../../worker/types';
export interface FusedContext {
  entities: Entity[];
  relations: Relation[];
  score: number;
}
export function getFusedContext(
  query: string,
  kg: KnowledgeGraph,
  limit: number = 5
): FusedContext {
  // Prototype Hybrid Reconciler
  // 1. Identify seed entities in query
  const queryWords = query.toLowerCase().split(/\W+/);
  const seeds = Object.values(kg.entities).filter(e => 
    queryWords.includes(e.canonical.toLowerCase()) || 
    queryWords.includes(e.id.toLowerCase())
  );
  // 2. Expand graph (1-hop for prototype)
  const relevantRelations = kg.relations.filter(r => 
    seeds.some(s => s.id === r.sourceId || s.id === r.targetId)
  );
  const neighborIds = new Set(relevantRelations.flatMap(r => [r.sourceId, r.targetId]));
  const relevantEntities = Object.values(kg.entities)
    .filter(e => neighborIds.has(e.id))
    .sort((a, b) => {
      // Score = 0.3 KG weight + 0.1 Recency
      const aRecency = a.lastMentioned / Date.now();
      const bRecency = b.lastMentioned / Date.now();
      return bRecency - aRecency;
    })
    .slice(0, limit);
  return {
    entities: relevantEntities,
    relations: relevantRelations.slice(0, limit),
    score: relevantEntities.length > 0 ? 0.8 : 0.2
  };
}