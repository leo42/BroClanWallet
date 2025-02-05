import "./TokenElement.css";
type TokenElementProps = {
    tokenId: string;
    amount: number;
    filter?: string;
    search?: string;
    className?: string;
    expanded?: boolean;
    index?: number;
    f?: (tokenId: string) => void;
};
declare function TokenElement(props: TokenElementProps): JSX.Element | null;
export default TokenElement;
