import React, { useState } from "react";
import { DRepInfo, formatDRepInfo, getSpecialDRepInfo, SPECIAL_DREPS } from '../helpers/DRepInfo';
import "./DRepElement.css";
import { App } from "../index.js";

interface DRepElementProps {
  drepId: string;
  drepInfo?: DRepInfo | null;
  root: App;
  onClick?: () => void;
  isSelected?: boolean;
  isCurrent?: boolean;
}

function DRepElement(props: DRepElementProps) {
  const { drepId, drepInfo: providedInfo, root, onClick, isSelected, isCurrent } = props;
  const [logoError, setLogoError] = useState(false);
  
  // Check if it's a special dRep
  const isSpecial = drepId === SPECIAL_DREPS.ALWAYS_ABSTAIN || 
                    drepId === SPECIAL_DREPS.ALWAYS_NO_CONFIDENCE ||
                    drepId === 'Abstain' || 
                    drepId === 'NoConfidence';
  
  // Get special dRep info or use provided
  let displayInfo = providedInfo;
  if (isSpecial && !displayInfo) {
    // Map old values to new format
    let normalizedId = drepId;
    if (drepId === 'Abstain') normalizedId = SPECIAL_DREPS.ALWAYS_ABSTAIN;
    if (drepId === 'NoConfidence') normalizedId = SPECIAL_DREPS.ALWAYS_NO_CONFIDENCE;
    displayInfo = getSpecialDRepInfo(normalizedId);
  }

  // Format for display
  const formatted = displayInfo ? formatDRepInfo(displayInfo) : {
    id: drepId,
    name: drepId.slice(0, 16) + '...',
    description: 'No description available',
    votingPower: 'N/A',
    isActive: false,
    logo: undefined,
  };

  // Check if logo is valid
  const hasValidLogo = formatted.logo && !logoError;

  const handleExplorerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpecial) return;
    const urlPrefix = root.state.settings.network === "Mainnet" ? "" : root.state.settings.network.toLowerCase() + ".";
    window.open(`https://${urlPrefix}cexplorer.io/drep/${drepId}`, '_blank');
  };

  const cardClasses = [
    'DRepElementWrapper',
    isSelected && 'selected',
    isCurrent && !isSelected && 'current',
    isSpecial && 'special',
  ].filter(Boolean).join(' ');

  // Reset logo error when drepId changes
  React.useEffect(() => {
    setLogoError(false);
  }, [drepId]);

  return (
    <div 
      className={cardClasses}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="DRepElementHeader">
        <div className={`DRepElementIcon ${isSpecial ? 'special' : ''}`}>
          {hasValidLogo ? (
            <img 
              src={formatted.logo!} 
              alt={formatted.name}
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="DRepElementIconEmoji">
              {isSpecial ? '⚖️' : '🏛️'}
            </span>
          )}
        </div>
        <div className="DRepElementInfo">
          <div className="DRepElementName">
            {formatted.name}
            {isSpecial && <span className="DRepBadge special">System</span>}
          </div>
          {!isSpecial && (
            <div className="DRepElementId">{drepId.slice(0, 24)}...</div>
          )}
        </div>
        <div className="DRepElementBadges">
          {isCurrent && <span className="DRepBadge current">Current</span>}
          {isSelected && !isCurrent && <span className="DRepBadge selected">Selected</span>}
        </div>
      </div>
      
      <div className="DRepElementDescription">{formatted.description}</div>
      
      {!isSpecial && (
        <div className="DRepElementStats">
          <div className="DRepElementStat">
            <span className="DRepStatLabel">Voting Power</span>
            <span className="DRepStatValue">{formatted.votingPower}</span>
          </div>
          <div className="DRepElementStat">
            <span className="DRepStatLabel">Status</span>
            <span className={`DRepStatValue ${formatted.isActive ? 'active' : 'inactive'}`}>
              {formatted.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      )}

      {!isSpecial && (
        <div className="DRepElementAtribution">
          <span 
            className="DRepElementAtributionText"
            onClick={handleExplorerClick}
          >
            View on cExplorer →
          </span>
        </div>
      )}
    </div>
  );
}

export default DRepElement;
