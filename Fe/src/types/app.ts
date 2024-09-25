  export interface Settings {
    network: NetworkType;
    provider: string;
    api: {
      apiKey: string;
      url: string;
      projectId: string;
    };
    metadataProvider: string;
    termsAccepted: string;
  }

  // Add more type declarations as needed
  export type NetworkType = 'Mainnet' | 'Preprod' | 'Preview' | 'Custom';

  export type ProviderType = 'MWallet' | 'NamiWallet' | 'FlintWallet' | 'EternlWallet' | 'GeroWallet' | 'CardWallet';

  export type MetadataProviderType = 'Blockfrost' | 'Koios' | 'Custom';

  export interface ApiConfig {
    apiKey: string;
    url: string;
    projectId: string;
  }

  // You can add more interfaces or types here as needed for your application
  export interface User {
    id: string;
    name: string;
    email: string;
  }

  export interface Transaction {
    id: string;
    amount: number;
    timestamp: Date;
  }

  // Add any other global types or interfaces your application might use
