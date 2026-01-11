import { Message } from './types';
export interface Entity {
  id: string;
  canonical: string;
  type: string;
  version: number;
  firstMentioned: number;
  lastMentioned: number;
}
export interface Relation {
  sourceId: string;
  targetId: string;
  predicate: string;
  weight: number;
  mentions: number;
}
export interface KnowledgeGraph {
  entities: Record<string, Entity>;
  relations: Relation[];
}
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
   * In a real production app, this would call an LLM with a specific schema.
   */
  async processCheckpoint(text: string, sessionId: string, kg: KnowledgeGraph): Promise<KnowledgeGraph> {
    // Simple regex-based extraction as a prototype placeholder for LLM extraction
    // We look for capitalized nouns or specific patterns
    const entityMatches = text.match(/[A-Z][a-z]+(?:\s[A-Z][a-z]+)*/g) || [];
    const timestamp = Date.now();
    const newKg = { ...kg };
    entityMatches.forEach(name => {
      const id = name.toLowerCase().replace(/\s+/g, '_');
      if (newKg.entities[id]) {
        newKg.entities[id]!.lastMentioned = timestamp;
        newKg.entities[id]!.version += 1;
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
    // Simple relation inference: if two entities appear in the same text block, weight their relation
    const uniqueIds = Array.from(new Set(entityMatches.map(n => n.toLowerCase().replace(/\s+/g, '_'))));
    for (let i = 0; i < uniqueIds.length; i++) {
      for (let j = i + 1; j < uniqueIds.length; j++) {
        const sourceId = uniqueIds[i]!;
        const targetId = uniqueIds[j]!;
        const existingRel = newKg.relations.find(r => 
          (r.sourceId === sourceId && r.targetId === targetId) ||
          (r.sourceId === targetId && r.targetId === sourceId)
        );
        if (existingRel) {
          existingRel.weight = (existingRel.weight * existingRel.mentions + 1) / (existingRel.mentions + 1);
          existingRel.mentions += 1;
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