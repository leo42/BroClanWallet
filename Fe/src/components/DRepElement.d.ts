import { DRepInfo } from '../helpers/DRepInfo';
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
declare function DRepElement(props: DRepElementProps): import("react/jsx-runtime").JSX.Element;
export default DRepElement;
