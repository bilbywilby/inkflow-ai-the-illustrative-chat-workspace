import { KnowledgeGraph, Entity, Relation } from './types';
export class KnowledgeGraphEngine {
  private static instance: KnowledgeGraphEngine;
  private constructor() {}
  static getInstance(): KnowledgeGraphEngine {
    if (!KnowledgeGraphEngine.instance) {
      KnowledgeGraphEngine.instance = new KnowledgeGraphEngine();
    }
    return KnowledgeGraphEngine.instance;
  }
  /**
   * Process a text checkpoint to extract entities and relations.
   */
  async processCheckpoint(text: string, sessionId: string, kg: KnowledgeGraph): Promise<KnowledgeGraph> {
    if (!text || text.trim().length === 0) return kg;
    // Simple extraction logic for the illustrative prototype
    const entityMatches = text.match(/[A-Z][a-z]+(?:\s[A-Z][a-z]+)*/g) || [];
    const timestamp = Date.now();
    const newKg: KnowledgeGraph = { 
      entities: { ...kg.entities }, 
      relations: [...kg.relations] 
    };
    entityMatches.forEach(name => {
      const id = name.toLowerCase().replace(/\s+/g, '_');
      const existingEntity = newKg.entities[id];
      if (existingEntity) {
        newKg.entities[id] = {
          ...existingEntity,
          lastMentioned: timestamp,
          version: existingEntity.version + 1
        };
      } else {
        newKg.entities[id] = {
          id,
          canonical: name,
          type: 'Concept',
          version: 1,
          firstMentioned: timestamp,
          lastMentioned: timestamp
        };
      }
    });
    const uniqueIds = Array.from(new Set(entityMatches.map(n => n.toLowerCase().replace(/\s+/g, '_'))));
    for (let i = 0; i < uniqueIds.length; i++) {
      for (let j = i + 1; j < uniqueIds.length; j++) {
        const sourceId = uniqueIds[i]!;
        const targetId = uniqueIds[j]!;
        const existingRelIndex = newKg.relations.findIndex(r =>
          (r.sourceId === sourceId && r.targetId === targetId) ||
          (r.sourceId === targetId && r.targetId === sourceId)
        );
        if (existingRelIndex !== -1) {
          const rel = newKg.relations[existingRelIndex]!;
          newKg.relations[existingRelIndex] = {
            ...rel,
            mentions: rel.mentions + 1,
            weight: Math.min(1, (rel.weight * rel.mentions + 1) / (rel.mentions + 1))
          };
        } else {
          newKg.relations.push({
            sourceId,
            targetId,
            predicate: 'associated_with',
            weight: 0.5,
            mentions: 1
          });
        }
      }
    }
    return newKg;
  }
}
export const kgEngine = KnowledgeGraphEngine.getInstance();