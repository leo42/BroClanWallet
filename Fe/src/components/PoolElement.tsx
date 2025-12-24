import React, { useState } from "react";
import getPoolInfo, { PoolInfo } from '../helpers/PoolInfo'
import "./PoolElement.css"
import { App } from "../index.js";

function PoolElement(props: {poolId: string, root: App, onClick?: () => void}){
    const [poolInfo, setPoolInfo] = React.useState<PoolInfo | null | undefined>(undefined);
    const [logoError, setLogoError] = useState(false);
    
    React.useEffect(() => {
        // Reset logo error when pool changes
        setLogoError(false);
        getPoolInfo(props.poolId).then((info: PoolInfo | undefined) => {
          setPoolInfo(info || null);
        });
    }, [props.poolId]);

    function handleClick(e: React.MouseEvent<HTMLSpanElement>) {
        e.preventDefault();
        e.stopPropagation();
        const urlPrefix = props.root.state.settings.network === "Mainnet" ? "" : props.root.state.settings.network.toLowerCase() + "."; 
        window.open(`https://${urlPrefix}cexplorer.io/pool/${props.poolId}`, '_blank');
    }

    // Loading state
    if (poolInfo === undefined) {
        return <div className="PoolElementLoading">Loading pool...</div>;
    }

    // Not found state
    if (poolInfo === null) {
        return <div className="PoolElementNotFound">Pool not found</div>;
    }

    // Get display values from Koios response
    const name = poolInfo.meta_json?.name || props.poolId.slice(0, 12) + '...';
    const ticker = poolInfo.meta_json?.ticker || 'N/A';
    const pledge = Number(poolInfo.pledge) / 1_000_000;
    const margin = (poolInfo.margin * 100).toFixed(2);
    const cost = Number(poolInfo.fixed_cost) / 1_000_000;
    const roa = poolInfo.pool_roa ?? poolInfo.roa ?? null;
    const saturation = poolInfo.live_saturation 
        ? (poolInfo.live_saturation * 100).toFixed(1) 
        : null;
    
    // Check if logo is valid (exists and hasn't errored)
    const hasValidLogo = poolInfo.logo && !logoError;

    // Format helper for ADA amounts
    const formatADA = (amount: number): string => {
      if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
      if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
      return amount.toLocaleString();
    };

    return (
      <div 
        className="PoolElementWrapper" 
        onClick={props.onClick} 
        style={{ cursor: props.onClick ? 'pointer' : 'default' }}
      >
        <div className="PoolElementHeader">
          <div className="PoolElementIcon">
            {hasValidLogo ? (
              <img 
                src={poolInfo.logo!} 
                alt={name}
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="PoolElementIconEmoji">🏊</span>
            )}
          </div>
          <div className="PoolElementInfo">
            <span className="PoolElementName">{name}</span>
            <span className="PoolElementTicker">[{ticker}]</span>
          </div>
        </div>
        
        <div className="PoolElementStats">
          <div className="PoolElementStat">
            <span className="PoolStatLabel">Pledge</span>
            <span className="PoolStatValue">{formatADA(pledge)} ₳</span>
          </div>
          <div className="PoolElementStat">
            <span className="PoolStatLabel">Margin</span>
            <span className="PoolStatValue">{margin}%</span>
          </div>
          <div className="PoolElementStat">
            <span className="PoolStatLabel">Cost</span>
            <span className="PoolStatValue">{formatADA(cost)} ₳</span>
          </div>
          {roa !== null && (
            <div className="PoolElementStat">
              <span className="PoolStatLabel">ROI</span>
              <span className="PoolStatValue">{typeof roa === 'number' ? roa.toFixed(2) + '%' : 'N/A'}</span>
            </div>
          )}
          {saturation !== null && (
            <div className="PoolElementStat">
              <span className="PoolStatLabel">Saturation</span>
              <span className="PoolStatValue">{saturation}%</span>
            </div>
          )}
        </div>
        
        <div className="PoolElementAtribution">
          <span 
            className="PoolElementAtributionText"
            onClick={handleClick}
          >
            View on cExplorer →
          </span>
        </div>
      </div>
    );
}

export default PoolElement;
