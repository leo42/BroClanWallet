/**
 * DRep (Delegated Representative) information utilities
 * Uses Koios API via passthrough for dRep data
 * Ported from Clan framework helpers
 */

type Settings = {
  network?: string;
  koiosApiKey?: string;
  koiosUrl?: string;
};

// Use passthrough service - network is passed via header
const KOIOS_PASSTHROUGH_URL = 'http://localhost:3003';

function getKoiosBase(settings: Settings): string {
  // Allow override via settings
  if (settings.koiosUrl) return settings.koiosUrl;
  return KOIOS_PASSTHROUGH_URL;
}

function getNetworkHeader(settings: Settings): string {
  const net = (settings.network || 'Mainnet').toLowerCase();
  return net;
}

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
  amount?: string; // Voting power in lovelace
  anchor_url?: string;
  anchor_hash?: string;
  // Extended metadata (fetched from anchor URL if available)
  metadata?: DRepMetadata;
  // Logo URL (from metadata if available)
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
export const SPECIAL_DREPS = {
  ALWAYS_ABSTAIN: 'drep_always_abstain',
  ALWAYS_NO_CONFIDENCE: 'drep_always_no_confidence',
} as const;

// Metadata cache to avoid repeated fetches
const metadataCache = new Map<string, DRepMetadata | null>();

/**
 * Fetch dRep metadata from anchor URL
 */
export async function getDRepMetadata(anchorUrl?: string): Promise<DRepMetadata | null> {
  if (!anchorUrl) return null;
  
  if (metadataCache.has(anchorUrl)) {
    return metadataCache.get(anchorUrl) || null;
  }

  try {
    const response = await fetch(anchorUrl, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      metadataCache.set(anchorUrl, null);
      return null;
    }

    const data = await response.json();
    
    // CIP-119 compliant metadata structure - data may be nested in 'body' object
    const body = data.body || data;
    const metadata: DRepMetadata = {
      name: body.givenName || body.name || data.givenName || data.name,
      bio: body.bio || data.bio,
      email: body.email || data.email,
      website: body.website || body.paymentAddress || data.website || data.paymentAddress,
      image: body.image?.contentUrl || body.image || data.image?.contentUrl || data.image,
      objectives: body.objectives || data.objectives,
      qualifications: body.qualifications || data.qualifications,
      motivations: body.motivations || data.motivations,
    };

    metadataCache.set(anchorUrl, metadata);
    return metadata;
  } catch (error) {
    console.warn(`Failed to fetch dRep metadata from ${anchorUrl}:`, error);
    metadataCache.set(anchorUrl, null);
    return null;
  }
}

/**
 * Get information about a specific dRep from Koios via passthrough
 */
export async function getDRepInfo(
  drepId: string,
  fetchMetadata: boolean = true
): Promise<DRepInfo | null> {
  const settings: Settings = JSON.parse(localStorage.getItem('settings') || '{}');
  const base = getKoiosBase(settings);
  const network = getNetworkHeader(settings);
  const headers: HeadersInit = {
    accept: 'application/json',
    'Content-Type': 'application/json',
    network: network,
  };
  if (settings.koiosApiKey) {
    (headers as Record<string, string>).Authorization = `Bearer ${settings.koiosApiKey}`;
  }

  try {
    const response = await fetch(`${base}/drep_info`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ _drep_ids: [drepId] }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    const drepData = data[0];
    
    // Koios returns meta_url and meta_hash for the anchor
    const anchorUrl = drepData.meta_url || drepData.url;
    const anchorHash = drepData.meta_hash || drepData.hash;
    
    // Optionally fetch metadata from anchor URL
    let metadata: DRepMetadata | undefined = undefined;
    if (fetchMetadata && anchorUrl) {
      metadata = (await getDRepMetadata(anchorUrl)) || undefined;
    }

    return {
      drep_id: drepData.drep_id,
      hex: drepData.hex,
      has_script: drepData.has_script,
      registered: drepData.registered,
      deposit: drepData.deposit,
      active: drepData.active,
      expires_epoch_no: drepData.expires_epoch_no,
      amount: drepData.amount,
      anchor_url: anchorUrl,
      anchor_hash: anchorHash,
      metadata,
      logo: metadata?.image,
    };
  } catch (error) {
    console.warn(`Failed to fetch dRep info for ${drepId}:`, error);
    return null;
  }
}

/**
 * Search for dReps by ID via passthrough
 */
export async function searchDReps(
  query: string,
  limit: number = 20
): Promise<DRepListItem[]> {
  if (!query || query.trim().length < 3) {
    return [];
  }

  const settings: Settings = JSON.parse(localStorage.getItem('settings') || '{}');
  const base = getKoiosBase(settings);
  const network = getNetworkHeader(settings);
  const headers: HeadersInit = { 
    accept: 'application/json',
    network: network,
  };
  if (settings.koiosApiKey) {
    (headers as Record<string, string>).Authorization = `Bearer ${settings.koiosApiKey}`;
  }

  try {
    // Search by dRep ID (partial match)
    const response = await fetch(
      `${base}/drep_list?drep_id=ilike.*${query}*&limit=${limit}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map((drep: any) => ({
      drep_id: drep.drep_id,
      hex: drep.hex,
      has_script: drep.has_script,
      registered: drep.registered,
      anchor_url: drep.meta_url || drep.url,
      anchor_hash: drep.meta_hash || drep.hash,
    }));
  } catch (error) {
    console.warn('Failed to search dReps:', error);
    return [];
  }
}

/**
 * Validate if a string is a valid dRep ID
 */
export function isValidDRepId(drepId: string): boolean {
  if (!drepId) return false;
  
  // Special dRep values
  if (drepId === SPECIAL_DREPS.ALWAYS_ABSTAIN || drepId === SPECIAL_DREPS.ALWAYS_NO_CONFIDENCE) {
    return true;
  }
  
  // Bech32 dRep ID format
  if (drepId.startsWith('drep1') && drepId.length >= 50 && drepId.length <= 64) {
    return /^drep1[a-z0-9]+$/.test(drepId);
  }
  
  // Hex format (56 characters)
  if (drepId.length === 56 && /^[a-f0-9]+$/i.test(drepId)) {
    return true;
  }
  
  return false;
}

/**
 * Get special dRep display info
 */
export function getSpecialDRepInfo(drepId: string): DRepInfo | null {
  if (drepId === SPECIAL_DREPS.ALWAYS_ABSTAIN) {
    return {
      drep_id: SPECIAL_DREPS.ALWAYS_ABSTAIN,
      hex: '',
      has_script: false,
      registered: true,
      active: true,
      metadata: {
        name: 'Always Abstain',
        bio: 'Automatically abstain from all governance votes',
      },
    };
  }
  
  if (drepId === SPECIAL_DREPS.ALWAYS_NO_CONFIDENCE) {
    return {
      drep_id: SPECIAL_DREPS.ALWAYS_NO_CONFIDENCE,
      hex: '',
      has_script: false,
      registered: true,
      active: true,
      metadata: {
        name: 'Always No Confidence',
        bio: 'Automatically vote no confidence on all governance proposals',
      },
    };
  }
  
  return null;
}

/**
 * Format dRep information for display
 */
export function formatDRepInfo(drepInfo: DRepInfo): {
  id: string;
  name: string;
  description: string;
  votingPower: string;
  isActive: boolean;
  logo?: string;
} {
  const votingPowerAda = drepInfo.amount 
    ? (parseInt(drepInfo.amount) / 1_000_000).toLocaleString()
    : '0';

  return {
    id: drepInfo.drep_id,
    name: drepInfo.metadata?.name || drepInfo.drep_id.slice(0, 16) + '...',
    description: drepInfo.metadata?.bio || drepInfo.metadata?.objectives || 'No description available',
    votingPower: `${votingPowerAda} ₳`,
    isActive: drepInfo.active && drepInfo.registered,
    logo: drepInfo.logo || undefined,
  };
}

/**
 * Account dRep delegation info from Koios
 */
export interface AccountDRepDelegation {
  stake_address: string;
  drep_id?: string;
  drep_hash?: string;
}

/**
 * Get the delegated dRep for a stake address from Koios account_info
 */
export async function getDelegatedDRep(
  stakeAddress: string
): Promise<AccountDRepDelegation | null> {
  const settings: Settings = JSON.parse(localStorage.getItem('settings') || '{}');
  const base = getKoiosBase(settings);
  const network = getNetworkHeader(settings);
  const headers: HeadersInit = {
    accept: 'application/json',
    'Content-Type': 'application/json',
    network: network,
  };
  if (settings.koiosApiKey) {
    (headers as Record<string, string>).Authorization = `Bearer ${settings.koiosApiKey}`;
  }

  try {
    const response = await fetch(`${base}/account_info`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ _stake_addresses: [stakeAddress] }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    const accountData = data[0];
    
    return {
      stake_address: stakeAddress,
      drep_id: accountData.delegated_drep,
      drep_hash: accountData.delegated_drep_hash,
    };
  } catch (error) {
    console.warn(`Failed to fetch delegated dRep for ${stakeAddress}:`, error);
    return null;
  }
}

export default {
  getDRepInfo,
  searchDReps,
  isValidDRepId,
  getSpecialDRepInfo,
  formatDRepInfo,
  getDelegatedDRep,
  SPECIAL_DREPS,
};

