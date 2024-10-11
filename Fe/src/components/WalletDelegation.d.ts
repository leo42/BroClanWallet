import React from 'react';

interface Signer {
  name: string;
  hash: string;
  isDefault: boolean;
}

interface Wallet {
  getSigners(): Signer[];
  getDelegation(): Promise<DelegationInfo>;
}

interface DelegationInfo {
  poolId: string | null;
  rewards: string;
}

interface ModuleRoot {
  createDelegationTx(pool: string, signers: string[]): void;
  createStakeUnregistrationTx(signers: string[]): void;
}

interface Root {
  state: {
    settings: {
      network: string;
    };
  };
}

interface WalletDelegationProps {
  wallet: Wallet;
  moduleRoot: ModuleRoot;
  root: Root;
}

interface PoolElementProps {
  root: Root;
  poolId: string;
}

declare function PoolElement(props: PoolElementProps): JSX.Element;

declare function SearchPools(query: string): Promise<string[]>;

declare function WalletDelegation(props: WalletDelegationProps): JSX.Element;

export default WalletDelegation;