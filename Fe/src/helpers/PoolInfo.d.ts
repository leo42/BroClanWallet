/**
 * Pool information utilities using Koios API
 * Ported from Clan framework helpers
 */
export interface PoolInfo {
    pool_id_bech32: string;
    pool_id_hex: string;
    active_epoch_no: number;
    vrf_key_hash: string;
    margin: number;
    fixed_cost: string;
    pledge: string;
    reward_addr: string;
    owners: string[];
    relays: any[];
    meta_url?: string;
    meta_hash?: string;
    meta_json?: {
        name: string;
        description: string;
        ticker: string;
        homepage: string;
        extended?: string;
        icon?: string;
    };
    retiring_epoch?: number;
    live_stake?: string;
    active_stake?: string;
    live_saturation?: number;
    live_delegators?: number;
    block_count?: number;
    pool_roa?: number;
    roa?: number;
    logo?: string | null;
}
/**
 * Get comprehensive pool information from Koios API
 * Includes pool logo from extended metadata if available
 */
declare function getPoolInfo(poolId: string): Promise<PoolInfo | undefined>;
export default getPoolInfo;
