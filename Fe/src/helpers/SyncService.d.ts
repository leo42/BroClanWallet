import MultisigContainer from "../components/Multisig/MultisigContainer";
import SmartWalletContainer from "../components/SmartWallet/SmartWalletContainer";
import { Settings } from "../index";
declare function connectSocket(wallet: string, root: MultisigContainer | SmartWalletContainer, syncService: string, settings: Settings): Promise<import("socket.io-client").Socket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap>>;
export default connectSocket;
