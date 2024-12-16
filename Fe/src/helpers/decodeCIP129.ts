import { bech32 } from 'bech32'; // This is a lightweight standard bech32 library
import { Buffer } from 'buffer';3

export function decodeCIP129(cip129: string): DRep {
    // Verify prefix
    if (!cip129.startsWith('drep1')) {
        throw new Error('Invalid DRep identifier: must start with drep1');
    }

    // Decode bech32 string to get the raw bytes
    const decoded = bech32.decode(cip129);
    const data = bech32.fromWords(decoded.words);

    // According to CIP-129, the first byte is the header
    const header = data[0];
    
    // Verify the key type (bits [7;4] should be 0010 for DRep)
    const keyType = header >> 4;
    if (keyType !== 0x02) {
        throw new Error('Invalid DRep key type');
    }

    // Get credential type from bits [3;0]
    const credentialType = header & 0x0F;
    if (credentialType !== 0x02 && credentialType !== 0x03) {
        throw new Error('Invalid credential type');
    }

    // Get the credential bytes (everything after the header)
    const credentialBytes = Buffer.from(data.slice(1));

    return {
        type: credentialType === 0x02 ? "Key" : "Script",
        hash: credentialBytes.toString('hex')
    };
}

interface DRep {
    type: "Key" | "Script";
    hash: string;
}