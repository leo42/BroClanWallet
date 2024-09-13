interface TokenInfo {
name: string;
image: string;
decimals: number | null;
isNft: boolean;
provider: string;
fingerprint: string;
fetch_time: number;
ticker?: string;
unit?: string;
}

interface Settings {
metadataProvider: 'None' | 'Koios' | 'Blockfrost' | 'Maestro';
network?: string;
api?: {
    url?: string;
    projectId?: string;
    apiKey?: string;
};
}

function getTokenInfo(tokenId: string): Promise<TokenInfo>;

function fetchTokenData(tokenId: string): Promise<TokenInfo>;

function hex2a(hexx: string): string;

function writeToLocalStorage(key: string, value: TokenInfo): Promise<void>;

function splitTokenId(tokenId: string): [string, string];

export default getTokenInfo;

