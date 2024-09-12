import { LucidEvolution } from "@lucid-evolution/lucid";

export function getNewLucidInstance(settings: any): Promise<LucidEvolution>;
export function changeProvider(lucid: LucidEvolution, settings: any): Promise<void>;