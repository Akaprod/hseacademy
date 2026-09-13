// Service — Configuration (singleton) — Phase 1 + Phase 2
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { db } from '@/lib/db';
import type { AssistantConfigData, AssistantStatus } from '../types';
import { SYSTEM_SAFETY_VERSION } from '../instructions/system-safety';

const SINGLETON_ID = 'default';

const DEFAULT_CONFIG: AssistantConfigData = {
  enabled: false,
  commercialEnabled: true,
  userEnabled: true,
  adminEnabled: true,
  name: 'Assistant HSE Academy',
  welcomeMessage: "Bonjour, je suis l'Assistant IA de HSE Academy. Comment puis-je vous aider ?",
  language: 'fr',
  availabilityMode: 'always',
  updatedAt: new Date().toISOString(),
  updatedBy: null,
};

export async function getConfig(): Promise<AssistantConfigData> {
  const row = await db.assistantConfig.findUnique({ where: { id: SINGLETON_ID } });
  if (!row) {
    const created = await db.assistantConfig.create({ data: { id: SINGLETON_ID, ...DEFAULT_CONFIG } });
    return rowToConfig(created);
  }
  return rowToConfig(row);
}

export async function updateConfig(
  updates: Partial<Pick<AssistantConfigData,
    'enabled' | 'commercialEnabled' | 'userEnabled' | 'adminEnabled'
    | 'name' | 'welcomeMessage' | 'language' | 'availabilityMode'
  >>,
  updatedByUserId: string
): Promise<AssistantConfigData> {
  await getConfig();
  const updated = await db.assistantConfig.update({
    where: { id: SINGLETON_ID },
    data: { ...updates, updatedBy: updatedByUserId },
  });
  return rowToConfig(updated);
}

// ============================================================================
// checkAiProviderConfigured — vérification légère (sans appel LLM)
// ============================================================================
// Vérifie si un fichier .z-ai-config valide existe dans l'un des 3 chemins
// recherchés par le SDK (cwd, home, /etc/). Retourne true si baseUrl + apiKey
// sont présents et non vides. Aucun secret n'est exposé — seul un booléen.
// ============================================================================
function checkAiProviderConfigured(): boolean {
  const configPaths = [
    join(process.cwd(), '.z-ai-config'),
    join(homedir(), '.z-ai-config'),
    '/etc/.z-ai-config',
  ];
  for (const filePath of configPaths) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const config = JSON.parse(content);
      if (config.baseUrl && config.apiKey) {
        return true;
      }
    } catch {
      // Fichier absent ou invalide — passer au suivant
    }
  }
  return false;
}

export async function getStatus(): Promise<AssistantStatus> {
  const config = await getConfig();
  return {
    enabled: config.enabled,
    name: config.name,
    modes: {
      commercial: config.commercialEnabled,
      user: config.userEnabled,
      admin: config.adminEnabled,
    },
    aiProviderConfigured: checkAiProviderConfigured(),
    version: SYSTEM_SAFETY_VERSION,
  };
}

function rowToConfig(row: any): AssistantConfigData {
  return {
    enabled: row.enabled,
    commercialEnabled: row.commercialEnabled,
    userEnabled: row.userEnabled,
    adminEnabled: row.adminEnabled,
    name: row.name,
    welcomeMessage: row.welcomeMessage,
    language: row.language,
    availabilityMode: row.availabilityMode,
    updatedAt: row.updatedAt?.toISOString?.() ?? row.updatedAt,
    updatedBy: row.updatedBy,
  };
}
