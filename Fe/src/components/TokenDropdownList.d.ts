import "./TokenDropdownList.css";
declare function TokenDropdownMenu(props: {
    ballances: {
        [key: string]: bigint;
    };
    f: (tokenId: string) => void;
    index: string;
}): import("react/jsx-runtime").JSX.Element;
export default TokenDropdownMenu;
