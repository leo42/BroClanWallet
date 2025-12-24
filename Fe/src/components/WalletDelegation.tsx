import React, { useEffect, useState, useCallback } from 'react';
import PoolElement from './PoolElement';
import DRepElement from './DRepElement';
import SearchPools from '../helpers/SearchPools';
import { searchDReps, getDRepInfo, getDelegatedDRep, DRepInfo, SPECIAL_DREPS, getSpecialDRepInfo } from '../helpers/DRepInfo';
import getPoolInfo, { PoolInfo } from '../helpers/PoolInfo';
import "./WalletDelegation.css"
import { ReactComponent as LoadingIcon } from '../html/assets/loading.svg';
import WalletInterface from '../core/WalletInterface';
import SmartWalletContainer from './SmartWallet/SmartWalletContainer';
import MultisigContainer from './Multisig/MultisigContainer';
import { App } from '..';
import { Delegation, getAddressDetails, credentialToRewardAddress } from '@lucid-evolution/lucid'

// Special dRep options for display
const SPECIAL_DREP_OPTIONS: DRepInfo[] = [
  {
    drep_id: 'Abstain',
    hex: '',
    has_script: false,
    registered: true,
    active: true,
    metadata: {
      name: 'Always Abstain',
      bio: 'Automatically abstain from all governance votes',
    },
  },
  {
    drep_id: 'NoConfidence',
    hex: '',
    has_script: false,
    registered: true,
    active: true,
    metadata: {
      name: 'No Confidence',
      bio: 'Automatically vote no confidence on all proposals',
    },
  },
];

function WalletDelegation(props: { wallet: WalletInterface, moduleRoot: SmartWalletContainer | MultisigContainer, root: App }) {
  const wallet = props.wallet
  const initialState: boolean[] = []

  props.moduleRoot.getSigners().map((signer: any) =>
    initialState.push(signer.isDefault)
  )

  // Pool state
  const [poolSearch, setPoolSearch] = useState('');
  const [pools, setPools] = useState<string[]>([]);
  const [selectedPool, setSelectedPool] = useState<string | null>(null);
  const [searchingPools, setSearchingPools] = useState(false);
  const [selectedPoolInfo, setSelectedPoolInfo] = useState<PoolInfo | null>(null);
  const [loadingPoolInfo, setLoadingPoolInfo] = useState(false);

  // dRep state
  const [drepSearch, setDrepSearch] = useState('');
  const [dreps, setDreps] = useState<DRepInfo[]>(SPECIAL_DREP_OPTIONS);
  const [selectedDRep, setSelectedDRep] = useState<string>('Abstain');
  const [searchingDreps, setSearchingDreps] = useState(false);
  const [currentDRepId, setCurrentDRepId] = useState<string | null>(null);
  const [currentDRepInfo, setCurrentDRepInfo] = useState<DRepInfo | null>(null);
  const [loadingCurrentDRep, setLoadingCurrentDRep] = useState(false);
  const [selectedDRepInfo, setSelectedDRepInfo] = useState<DRepInfo | null>(null);
  const [loadingDRepInfo, setLoadingDRepInfo] = useState(false);

  // General state
  const [signers, setCheckedState] = useState(initialState);
  const [delegation, setDelegation] = useState<Delegation>({} as Delegation);

  // Fetch current pool delegation info
  useEffect(() => {
    wallet.getDelegation().then((delegation: Delegation) => {
      setDelegation(delegation);
      if (delegation.poolId) {
        setSelectedPool(delegation.poolId);
        setPoolSearch(delegation.poolId);
      }
    })
  }, [wallet])

  // Fetch current dRep delegation from Koios
  useEffect(() => {
    const fetchCurrentDRep = async () => {
      try {
        // Get stake address from wallet address
        const walletAddress = wallet.getAddress();
        const addressDetails = getAddressDetails(walletAddress);
        if (!addressDetails?.stakeCredential) {
          console.warn('No stake credential found');
          return;
        }
        
        const network = props.root.state.settings.network === 'Mainnet' ? 'Mainnet' : 'Preprod';
        const stakeAddress = credentialToRewardAddress(network, addressDetails.stakeCredential);
        
        setLoadingCurrentDRep(true);
        const drepDelegation = await getDelegatedDRep(stakeAddress);
        
        if (drepDelegation?.drep_id) {
          setCurrentDRepId(drepDelegation.drep_id);
          
          // Fetch full dRep info if it's a custom dRep (not special)
          if (drepDelegation.drep_id.startsWith('drep1')) {
            const info = await getDRepInfo(drepDelegation.drep_id, true);
            setCurrentDRepInfo(info);
            setSelectedDRep(drepDelegation.drep_id);
          } else if (drepDelegation.drep_id === 'drep_always_abstain') {
            setCurrentDRepInfo(getSpecialDRepInfo(SPECIAL_DREPS.ALWAYS_ABSTAIN));
            setSelectedDRep(SPECIAL_DREPS.ALWAYS_ABSTAIN);
          } else if (drepDelegation.drep_id === 'drep_always_no_confidence') {
            setCurrentDRepInfo(getSpecialDRepInfo(SPECIAL_DREPS.ALWAYS_NO_CONFIDENCE));
            setSelectedDRep(SPECIAL_DREPS.ALWAYS_NO_CONFIDENCE);
          }
        }
      } catch (error) {
        console.warn('Failed to fetch current dRep delegation:', error);
      } finally {
        setLoadingCurrentDRep(false);
      }
    };

    fetchCurrentDRep();
  }, [wallet, props.root.state.settings.network])

  // Search pools with debounce
  useEffect(() => {
    if (poolSearch === '') {
      setPools([]);
      setSearchingPools(false);
      return;
    }

    setSearchingPools(true);
    const timer = setTimeout(() => {
      SearchPools(poolSearch).then((results: string[]) => {
        setSearchingPools(false);
        setPools(results);
        // Auto-select if exact match
        if (results.length === 1) {
          setSelectedPool(results[0]);
        }
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [poolSearch])

  // Search dReps with debounce
  useEffect(() => {
    if (!drepSearch || drepSearch.trim().length < 3) {
      setDreps(SPECIAL_DREP_OPTIONS);
      setSearchingDreps(false);
      return;
    }

    setSearchingDreps(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchDReps(drepSearch, 10);
        
        // Fetch full info for search results
        const drepInfos = await Promise.all(
          results.map(async (item) => {
            try {
              const info = await getDRepInfo(item.drep_id, true);
              return info;
            } catch {
              return null;
            }
          })
        );

        const validDreps = drepInfos.filter((d): d is DRepInfo => d !== null);
        // Keep special options at top
        setDreps([...SPECIAL_DREP_OPTIONS, ...validDreps]);
      } catch (error) {
        console.warn('dRep search failed:', error);
      } finally {
        setSearchingDreps(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [drepSearch])

  // Fetch pool info when selectedPool changes
  useEffect(() => {
    if (!selectedPool) {
      setSelectedPoolInfo(null);
      return;
    }

    setLoadingPoolInfo(true);
    getPoolInfo(selectedPool)
      .then((info) => {
        setSelectedPoolInfo(info || null);
      })
      .catch((error) => {
        console.warn('Failed to fetch pool info:', error);
        setSelectedPoolInfo(null);
      })
      .finally(() => {
        setLoadingPoolInfo(false);
      });
  }, [selectedPool])

  // Fetch dRep info when selectedDRep changes
  useEffect(() => {
    if (!selectedDRep) {
      setSelectedDRepInfo(null);
      return;
    }

    // Handle special dReps
    if (selectedDRep === 'Abstain' || selectedDRep === SPECIAL_DREPS.ALWAYS_ABSTAIN) {
      setSelectedDRepInfo(getSpecialDRepInfo(SPECIAL_DREPS.ALWAYS_ABSTAIN));
      return;
    }
    if (selectedDRep === 'NoConfidence' || selectedDRep === SPECIAL_DREPS.ALWAYS_NO_CONFIDENCE) {
      setSelectedDRepInfo(getSpecialDRepInfo(SPECIAL_DREPS.ALWAYS_NO_CONFIDENCE));
      return;
    }

    // Fetch info for custom dRep
    setLoadingDRepInfo(true);
    getDRepInfo(selectedDRep, true)
      .then((info) => {
        setSelectedDRepInfo(info || null);
      })
      .catch((error) => {
        console.warn('Failed to fetch dRep info:', error);
        setSelectedDRepInfo(null);
      })
      .finally(() => {
        setLoadingDRepInfo(false);
      });
  }, [selectedDRep])

  const handleOnChangeSigners = (position: number) => {
    const updatedCheckedState = [...signers]
    updatedCheckedState[position] = !updatedCheckedState[position]
    setCheckedState(updatedCheckedState);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const txSigners = signers.map((item, index) =>
      item ? props.moduleRoot.getSigners()[index].hash : ""
    )
    
    // Use selectedPool and selectedDRep
    const poolId = selectedPool || pools[0];
    props.moduleRoot.createDelegationTx(poolId, selectedDRep, txSigners.filter((element, index) => signers[index]));
  }

  const Undelegate = (event: React.MouseEvent<HTMLInputElement>) => {
    event.preventDefault();

    const txSigners = signers.map((item, index) =>
      item ? props.moduleRoot.getSigners()[index].hash : ""
    )

    props.moduleRoot.createStakeUnregistrationTx(txSigners.filter((element, index) => signers[index]));
  }

  const handlePoolSelect = (poolId: string) => {
    setSelectedPool(poolId);
    setPoolSearch(poolId);
  };

  const handleDRepSelect = (drepId: string) => {
    setSelectedDRep(drepId);
  };

  const delegationInfo = () => {
    if (Object.keys(delegation).length === 0) {
      return <h1> Loading </h1>
    }

    const hasPoolDelegation = delegation.poolId !== null;
    const hasDRepDelegation = currentDRepId !== null;

    if (!hasPoolDelegation && !hasDRepDelegation) {
      return <h1> No Delegation </h1>
    }

    return (
      <div className='currentDelegation'>
            <h1>Current Delegation</h1>
            <div className='currentDelegationSection'>
          <h3>🏊 Pool Delegation</h3>
          {hasPoolDelegation ? (
            <>
              {delegation.poolId && <PoolElement key={delegation.poolId} root={props.root} poolId={delegation.poolId} />}
            </>
          ) : (
            <p className='noDelegation'>Not delegated to any pool</p>
          )}
        </div>

        {/* dRep Delegation Section */}
        <div className='currentDelegationSection'>
          <h3>🏛️ dRep Delegation</h3>
          {loadingCurrentDRep ? (
            <p className='loadingText'>Loading dRep info...</p>
          ) : hasDRepDelegation ? (
            currentDRepInfo ? (
              <DRepElement
                drepId={currentDRepId!}
                drepInfo={currentDRepInfo}
                root={props.root}
                isCurrent={true}
              />
            ) : (
              <div className='currentDRepId'>
                <span className='drepIdLabel'>Delegated to:</span>
                <span className='drepIdValue'>{currentDRepId}</span>
              </div>
            )
          ) : (
            <p className='noDelegation'>Not delegated to any dRep</p>
          )}
        </div>

        {/* Rewards */}
        <p className='rewardsDisplay'>
          Rewards: {Number(delegation.rewards) / 1_000_000} {props.root.state.settings.network === "Mainnet" ? "₳" : "t₳"}
        </p>
      </div>
    );
  }

  const searchingAnimation = () => {
    return <div className="searching">
      <LoadingIcon className="loadingIcon"></LoadingIcon>
    </div>
  }

  const txSigners = signers.map((item, index) =>
    item ? props.moduleRoot.getSigners()[index].hash : ""
  )
  const signersValid = wallet.checkSigners(txSigners.filter((element, index) => signers[index]))

  const SignersSelect = props.moduleRoot.getSigners().map((item, index) => (
    <div key={index} >
      <label className='signerCheckbox'>
        {props.moduleRoot.getSigners()[index].name}:
        <input
          type="checkbox"
          name="value"
          value={index}
          className='signerCheckbox'
          checked={signers[index]}
          onChange={() => handleOnChangeSigners(index)}

        />
      </label>
    </div>
  ))

  // Check if we can delegate
  const canDelegate = signersValid && (selectedPool || pools.length === 1) && selectedDRep;

  return (
    <div className='DelegationContainer'>
      <div className='BetaInfo'>
        Delegation transactions perform both Stake Pool and dRep delegation simultaneously.<br />
        Search for pools by ticker or ID, and select a dRep for governance participation.
      </div>

      <div className="DelegationCenter">
        {/* Left side: Current Status */}
        <div className='DelegationInfo'>
          {delegationInfo()}
        </div>

        {/* Right side: Update Delegation */}
        <div className='DelegationUpdate'>
          <form onSubmit={handleSubmit}>
            <h1>Manage Delegation</h1>

            {/* Pool Selection Section */}
            <div className='delegationSection'>
              <h2>🏊 Stake Pool</h2>
              <input
                type="text"
                name="poolSearch"
                placeholder='Search pools by ticker or ID...'
                value={poolSearch}
                onChange={event => setPoolSearch(event.target.value)}
                className='delegationSearchInput'
              />

              {searchingPools ? (
                searchingAnimation()
              ) : (
                <div className='poolResults'>
                  {pools.map((pool: string) => (
                    <div key={pool} onClick={() => handlePoolSelect(pool)}>
                      <PoolElement
                        key={pool}
                        root={props.root}
                        poolId={pool}
                        onClick={() => handlePoolSelect(pool)}
                      />
                    </div>
                  ))}
                  {poolSearch && pools.length === 0 && !searchingPools && (
                    <div className='noResults'>No pools found</div>
                  )}
                </div>
              )}
            </div>

            {/* dRep Selection Section */}
            <div className='delegationSection'>
              <h2>🏛️ dRep (Governance)</h2>
              <input
                type="text"
                name="drepSearch"
                placeholder='Search dReps by ID (CIP-129)...'
                value={drepSearch}
                onChange={event => setDrepSearch(event.target.value)}
                className='delegationSearchInput'
              />

              {searchingDreps ? (
                searchingAnimation()
              ) : (
                <div className='drepResults'>
                  {dreps.map((drep: DRepInfo) => (
                    <DRepElement
                      key={drep.drep_id}
                      drepId={drep.drep_id}
                      drepInfo={drep}
                      root={props.root}
                      onClick={() => handleDRepSelect(drep.drep_id)}
                      isSelected={selectedDRep === drep.drep_id}
                    />
                  ))}
                </div>
              )}

              {/* Custom dRep input */}
              <div className='customDRepInput'>
                <label>
                  <span>Or enter custom dRep ID:</span>
                  <input
                    type="text"
                    placeholder='drep1...'
                    value={selectedDRep.startsWith('drep') ? selectedDRep : ''}
                    onChange={event => {
                      const value = event.target.value;
                      if (value) {
                        setSelectedDRep(value);
                      }
                    }}
                    className='delegationSearchInput'
                  />
                </label>
              </div>
            </div>

            {/* Selection Summary */}
            {(selectedPool || selectedDRep) && (
              <div className='delegationSummary'>
                <h3>Delegation Summary</h3>
                <div className='summaryContent'>
                  {/* Pool Section */}
                  <div className='summarySection'>
                    <div className='summarySectionHeader'>
                      <span className='summaryLabel'>🏊 Pool:</span>
                      {selectedPool === delegation.poolId && (
                        <span className='summaryBadge'>Current</span>
                      )}
                    </div>
                    {loadingPoolInfo ? (
                      <div className='summaryLoading'>Loading pool info...</div>
                    ) : selectedPoolInfo ? (
                      <div className='summaryMetadata'>
                        <div className='summaryMetadataRow'>
                          <span className='summaryMetadataName'>
                            {selectedPoolInfo.meta_json?.name || (selectedPool ? selectedPool.slice(0, 20) + '...' : 'Unknown')}
                          </span>
                          {selectedPoolInfo.meta_json?.ticker && (
                            <span className='summaryMetadataTicker'>[{selectedPoolInfo.meta_json.ticker}]</span>
                          )}
                        </div>
                        <div className='summaryMetadataGrid'>
                          {selectedPoolInfo.pledge && (
                            <div className='summaryMetadataItem'>
                              <span className='summaryMetadataLabel'>Pledge:</span>
                              <span className='summaryMetadataValue'>
                                {(Number(selectedPoolInfo.pledge) / 1_000_000).toLocaleString()} ₳
                              </span>
                            </div>
                          )}
                          {selectedPoolInfo.margin !== undefined && (
                            <div className='summaryMetadataItem'>
                              <span className='summaryMetadataLabel'>Margin:</span>
                              <span className='summaryMetadataValue'>
                                {(selectedPoolInfo.margin * 100).toFixed(2)}%
                              </span>
                            </div>
                          )}
                          {(selectedPoolInfo.pool_roa !== undefined || selectedPoolInfo.roa !== undefined) && (
                            <div className='summaryMetadataItem'>
                              <span className='summaryMetadataLabel'>ROI:</span>
                              <span className='summaryMetadataValue'>
                                {typeof (selectedPoolInfo.pool_roa ?? selectedPoolInfo.roa) === 'number' 
                                  ? (selectedPoolInfo.pool_roa ?? selectedPoolInfo.roa)!.toFixed(2) + '%'
                                  : 'N/A'}
                              </span>
                            </div>
                          )}
                          {selectedPoolInfo.live_saturation !== undefined && (
                            <div className='summaryMetadataItem'>
                              <span className='summaryMetadataLabel'>Saturation:</span>
                              <span className='summaryMetadataValue'>
                                {(selectedPoolInfo.live_saturation * 100).toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : selectedPool ? (
                      <div className='summaryMetadata'>
                        <span className='summaryValue'>{selectedPool.slice(0, 20) + '...'}</span>
                      </div>
                    ) : (
                      <div className='summaryMetadata'>
                        <span className='summaryValue'>None selected</span>
                      </div>
                    )}
                  </div>

                  {/* dRep Section */}
                  <div className='summarySection'>
                    <div className='summarySectionHeader'>
                      <span className='summaryLabel'>🏛️ dRep:</span>
                      {selectedDRep === currentDRepId && (
                        <span className='summaryBadge'>Current</span>
                      )}
                    </div>
                    {loadingDRepInfo ? (
                      <div className='summaryLoading'>Loading dRep info...</div>
                    ) : selectedDRepInfo ? (
                      <div className='summaryMetadata'>
                        <div className='summaryMetadataRow'>
                          <span className='summaryMetadataName'>
                            {selectedDRepInfo.metadata?.name || 
                             (selectedDRep === 'Abstain' || selectedDRep === SPECIAL_DREPS.ALWAYS_ABSTAIN ? 'Always Abstain' :
                              selectedDRep === 'NoConfidence' || selectedDRep === SPECIAL_DREPS.ALWAYS_NO_CONFIDENCE ? 'No Confidence' :
                              selectedDRep.slice(0, 20) + '...')}
                          </span>
                          {selectedDRepInfo.active !== undefined && (
                            <span className={`summaryMetadataStatus ${selectedDRepInfo.active ? 'active' : 'inactive'}`}>
                              {selectedDRepInfo.active ? '✓ Active' : '✗ Inactive'}
                            </span>
                          )}
                        </div>
                        {selectedDRepInfo.metadata?.bio && (
                          <div className='summaryMetadataDescription'>
                            {selectedDRepInfo.metadata.bio}
                          </div>
                        )}
                        <div className='summaryMetadataGrid'>
                          {selectedDRepInfo.amount && (
                            <div className='summaryMetadataItem'>
                              <span className='summaryMetadataLabel'>Voting Power:</span>
                              <span className='summaryMetadataValue'>
                                {(parseInt(selectedDRepInfo.amount) / 1_000_000).toLocaleString()} ₳
                              </span>
                            </div>
                          )}
                          {selectedDRepInfo.registered !== undefined && (
                            <div className='summaryMetadataItem'>
                              <span className='summaryMetadataLabel'>Status:</span>
                              <span className='summaryMetadataValue'>
                                {selectedDRepInfo.registered ? 'Registered' : 'Not Registered'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : selectedDRep ? (
                      <div className='summaryMetadata'>
                        <span className='summaryValue'>
                          {selectedDRep === 'Abstain' ? 'Always Abstain' :
                            selectedDRep === 'NoConfidence' ? 'No Confidence' :
                              selectedDRep.slice(0, 20) + '...'}
                        </span>
                      </div>
                    ) : (
                      <div className='summaryMetadata'>
                        <span className='summaryValue'>None selected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Signers Selection */}
            {props.moduleRoot.getSigners().length !== 0 && (
              <div className='SignersSelect'>
                <h2>Signers:</h2>
                <div className='SignersSelectList'>
                  {SignersSelect}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className='delegationActions'>
              {signersValid && delegation.poolId !== null && (
                <input
                  className='commonBtn undelegateBtn'
                  type="button"
                  value="Undelegate"
                  onClick={Undelegate}
                />
              )}
              {canDelegate && (
                <button className='commonBtn' type="submit">
                  Delegate
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default WalletDelegation;
