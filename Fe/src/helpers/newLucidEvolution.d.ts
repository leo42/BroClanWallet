import { LucidEvolution } from "@lucid-evolution/lucid";
import { Settings } from "../index";
declare function getNewLucidInstance(settings: Settings): Promise<LucidEvolution>;
declare function changeProvider(lucid: LucidEvolution, settings: Settings): Promise<unknown>;
export { getNewLucidInstance, changeProvider };
