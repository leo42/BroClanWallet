import { Lucid } from "lucid-cardano";

export function getNewLucidInstance(settings: any): Promise<Lucid>;
export function changeProvider(lucid: Lucid, settings: any): Promise<void>;