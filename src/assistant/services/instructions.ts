// Service — Instructions éditables (5 catégories — Phase 2 ajoute 'limits')
import { db } from '@/lib/db';
import type { InstructionCategory, AssistantInstructionData, AssistantMode } from '../types';
import { DEFAULT_INSTRUCTIONS } from '../instructions/defaults';

const ALL_CATEGORIES: InstructionCategory[] = ['general', 'commercial', 'user', 'admin', 'limits'];

export async function getAllInstructions(): Promise<AssistantInstructionData[]> {
  const rows = await db.assistantInstruction.findMany();
  const missing = ALL_CATEGORIES.filter(cat => !rows.some(r => r.category === cat));
  if (missing.length > 0) {
    await db.$transaction(missing.map(cat => db.assistantInstruction.create({
      data: { category: cat, content: DEFAULT_INSTRUCTIONS[cat] },
    })));
    return getAllInstructions();
  }
  return rows.map(rowToInstruction);
}

export async function getInstruction(category: InstructionCategory): Promise<AssistantInstructionData> {
  const row = await db.assistantInstruction.findUnique({ where: { category } });
  if (!row) {
    const created = await db.assistantInstruction.create({
      data: { category, content: DEFAULT_INSTRUCTIONS[category] },
    });
    return rowToInstruction(created);
  }
  return rowToInstruction(row);
}

export async function updateInstruction(
  category: InstructionCategory,
  content: string,
  updatedByUserId: string
): Promise<AssistantInstructionData> {
  await getInstruction(category);
  const updated = await db.assistantInstruction.update({
    where: { category },
    data: { content, updatedBy: updatedByUserId },
  });
  return rowToInstruction(updated);
}

export async function getInstructionContentForMode(mode: AssistantMode): Promise<string> {
  const cat: InstructionCategory = mode; // 'commercial' | 'user' | 'admin'
  const instruction = await getInstruction(cat);
  return instruction.content;
}

function rowToInstruction(row: any): AssistantInstructionData {
  return {
    id: row.id,
    category: row.category as InstructionCategory,
    content: row.content,
    updatedAt: row.updatedAt?.toISOString?.() ?? row.updatedAt,
    updatedBy: row.updatedBy,
  };
}
