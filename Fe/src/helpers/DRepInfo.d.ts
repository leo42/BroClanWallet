/**
 * DRep (Delegated Representative) information utilities
 * Uses Koios API for dRep data
 * Ported from Clan framework helpers
 */
/**
 * DRep metadata from anchor URL
 */
export interface DRepMetadata {
    name?: string;
    bio?: string;
    email?: string;
    website?: string;
    image?: string;
    objectives?: string;
    qualifications?: string;
    motivations?: string;
}
/**
 * DRep information from Koios
 */
export interface DRepInfo {
    drep_id: string;
    hex: string;
    has_script: boolean;
    registered: boolean;
    deposit?: string;
    active: boolean;
    expires_epoch_no?: number;
    amount?: string;
    anchor_url?: string;
    anchor_hash?: string;
    metadata?: DRepMetadata;
    logo?: string;
}
/**
 * DRep list item
 */
export interface DRepListItem {
    drep_id: string;
    hex: string;
    has_script: boolean;
    registered: boolean;
    anchor_url?: string;
    anchor_hash?: string;
}
/**
 * Special dRep options
 */
export declare const SPECIAL_DREPS: {
    readonly ALWAYS_ABSTAIN: "drep_always_abstain";
    readonly ALWAYS_NO_CONFIDENCE: "drep_always_no_confidence";
};
/**
 * Fetch dRep metadata from anchor URL
 */
export declare function getDRepMetadata(anchorUrl?: string): Promise<DRepMetadata | null>;
/**
 * Get information about a specific dRep from Koios
 */
export declare function getDRepInfo(drepId: string, fetchMetadata?: boolean): Promise<DRepInfo | null>;
/**
 * Search for dReps by ID
 */
export declare function searchDReps(query: string, limit?: number): Promise<DRepListItem[]>;
/**
 * Validate if a string is a valid dRep ID
 */
export declare function isValidDRepId(drepId: string): boolean;
/**
 * Get special dRep display info
 */
export declare function getSpecialDRepInfo(drepId: string): DRepInfo | null;
/**
 * Format dRep information for display
 */
export declare function formatDRepInfo(drepInfo: DRepInfo): {
    id: string;
    name: string;
    description: string;
    votingPower: string;
    isActive: boolean;
    logo?: string;
};
declare const _default: {
    getDRepInfo: typeof getDRepInfo;
    searchDReps: typeof searchDReps;
    isValidDRepId: typeof isValidDRepId;
    getSpecialDRepInfo: typeof getSpecialDRepInfo;
    formatDRepInfo: typeof formatDRepInfo;
    SPECIAL_DREPS: {
        readonly ALWAYS_ABSTAIN: "drep_always_abstain";
        readonly ALWAYS_NO_CONFIDENCE: "drep_always_no_confidence";
    };
};
export default _default;
