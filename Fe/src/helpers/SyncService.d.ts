import MultisigContainer from "../components/Multisig/MultisigContainer";
declare function connectSocket(wallet: string, root: MultisigContainer, syncService: string): Promise<import("socket.io-client").Socket<import("@socket.io/component-emitter").DefaultEventsMap, import("@socket.io/component-emitter").DefaultEventsMap>>;
export default connectSocket;
