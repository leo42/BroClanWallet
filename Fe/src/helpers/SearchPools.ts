/**
 * Pool search utilities using Koios API via passthrough
 * Ported from Clan framework helpers
 */

type Settings = {
  network?: string;
  koiosApiKey?: string;
  koiosUrl?: string;
};

// Use passthrough service - network is passed via header
const KOIOS_PASSTHROUGH_URL = 'https://koios.keypact.io';

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
 * Search for staking pools by ticker or pool ID using Koios via passthrough
 */
async function SearchPools(query: string): Promise<string[]> {
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

  if (!query || query.trim().length < 2) {
    return [];
  }

  const requests: Promise<Response>[] = [
    // Search by ticker (case-insensitive with ilike)
    fetch(`${base}/pool_list?ticker=ilike.*${query}*&limit=15`, { headers }),
  ];

  // If query looks like a pool ID (starts with "pool1"), also search by ID
  if (query.startsWith('pool1') || query.length > 10) {
    requests.push(
      fetch(`${base}/pool_list?pool_id_bech32=ilike.*${query}*&limit=15`, { headers })
    );
  }

  try {
    const responses = await Promise.all(requests);
    const pools: any[] = [];
    
    for (const res of responses) {
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          pools.push(...data);
        }
      }
    }

    // Return unique pool IDs
    return [...new Set(
      pools
        .filter((p: any) => p && p.pool_id_bech32)
        .map((p: any) => p.pool_id_bech32)
    )].slice(0, 20);
  } catch (e) {
    console.warn('SearchPools failed:', e);
    return [];
  }
}

export default SearchPools;
