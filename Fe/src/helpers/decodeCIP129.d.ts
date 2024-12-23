export declare function decodeCIP129(cip129: string): DRep;
interface DRep {
    type: "Key" | "Script";
    hash: string;
}
export {};
