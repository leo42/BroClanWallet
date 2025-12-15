/**
 * Pool search utilities using Koios API
 * Ported from Clan framework helpers
 */
/**
 * Search for staking pools by ticker or pool ID using Koios
 */
declare function SearchPools(query: string): Promise<string[]>;
export default SearchPools;
