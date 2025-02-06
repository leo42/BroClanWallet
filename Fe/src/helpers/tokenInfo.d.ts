export type TokenInfo = {
    name: string;
    image: string;
    decimals: number;
    isNft: boolean;
    provider: string;
    fingerprint: string;
};
declare function getTokenInfo(tokenId: string): Promise<any>;
export default getTokenInfo;
