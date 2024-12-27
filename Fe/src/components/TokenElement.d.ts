import React from "react";

interface TokenElementProps {
    tokenId: string;
    amount: number;
    f?: (tokenId: string) => void;
    search?: string;
    filter?: "NFTs" | "FTs";
    className?: string;
    index?: number;
    expanded?: boolean;
}

declare const TokenElement: React.FC<TokenElementProps>;

export default TokenElement;
