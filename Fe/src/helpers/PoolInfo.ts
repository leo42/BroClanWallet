/**
 * Pool information utilities using Koios API via passthrough
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
 * Sanitize and validate a logo URL for safe use in <img> tags
 */
function sanitizeLogoUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  
  // Allow data URIs (base64 images)
  if (url.startsWith('data:image/')) {
    return url;
  }
  
  try {
    const parsed = new URL(url);
    // Only allow HTTPS URLs for security
    if (parsed.protocol !== 'https:') {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

/**
 * Silently fetch JSON - returns null on any error (including CORS)
 */
async function fetchJson(url: string): Promise<any | null> {
  try {
    const response = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Extract logo URL from extended metadata object
 */
function extractLogoFromExtendedMetadata(data: any): string | null {
  if (!data) return null;
  
  const logoUrl = 
    data?.info?.url_png_icon_64x64 ||
    data?.info?.url_png_logo ||
    data?.info?.logo ||
    data?.logo ||
    data?.image ||
    data?.icon;
  
  return sanitizeLogoUrl(logoUrl);
}

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
 * Get comprehensive pool information from Koios API via passthrough
 * Includes pool logo from extended metadata if available
 */
async function getPoolInfo(poolId: string): Promise<PoolInfo | undefined> {
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
    const response = await fetch(`${base}/pool_info`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ _pool_bech32_ids: [poolId] }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      return undefined;
    }

    const poolData = data[0];
    
    // Build pool info object
    const poolInfo: PoolInfo = {
      pool_id_bech32: poolData.pool_id_bech32,
      pool_id_hex: poolData.pool_id_hex,
      active_epoch_no: poolData.active_epoch_no,
      vrf_key_hash: poolData.vrf_key_hash,
      margin: poolData.margin,
      fixed_cost: poolData.fixed_cost,
      pledge: poolData.pledge,
      reward_addr: poolData.reward_addr,
      owners: poolData.owners || [],
      relays: poolData.relays || [],
      meta_url: poolData.meta_url,
      meta_hash: poolData.meta_hash,
      meta_json: poolData.meta_json,
      retiring_epoch: poolData.retiring_epoch,
      live_stake: poolData.live_stake,
      active_stake: poolData.active_stake,
      live_saturation: poolData.live_saturation,
      live_delegators: poolData.live_delegators,
      block_count: poolData.block_count,
      pool_roa: poolData.pool_roa,
      roa: poolData.roa,
      logo: null,
    };

    // Try to get logo
    // 1. Check if meta_json has icon (base64 per CIP-0006)
    if (poolInfo.meta_json?.icon) {
      const icon = poolInfo.meta_json.icon;
      poolInfo.logo = icon.startsWith('data:') 
        ? icon 
        : `data:image/png;base64,${icon}`;
    }

    // 2. Try fetching meta_url to get extended metadata URL
    if (!poolInfo.logo && poolInfo.meta_url) {
      const metaData = await fetchJson(poolInfo.meta_url);
      
      if (metaData) {
        // Check for icon directly in metadata
        if (metaData.icon) {
          const logoUrl = metaData.icon.startsWith('data:') || metaData.icon.startsWith('http')
            ? sanitizeLogoUrl(metaData.icon)
            : `data:image/png;base64,${metaData.icon}`;
          if (logoUrl) {
            poolInfo.logo = logoUrl;
          }
        }
        
        // 3. Try fetching extended metadata for logo URL
        if (!poolInfo.logo && metaData.extended) {
          const extData = await fetchJson(metaData.extended);
          const logoUrl = extractLogoFromExtendedMetadata(extData);
          if (logoUrl) {
            poolInfo.logo = logoUrl;
          }
        }
      }
    }

    return poolInfo;
  } catch (e) {
    console.warn('getPoolInfo failed:', e);
    return undefined;
  }
}

export default getPoolInfo;
