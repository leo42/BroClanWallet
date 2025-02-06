import { UTxO, Assets } from "@lucid-evolution/lucid";

const UPPERBOUND : number = 10
const MAX_EXTRA : number = 5





export function coinSelect(value: Assets, utxos: UTxO[]): UTxO[] {

    function isEnoughValue(remaining: Assets): boolean {
      for (const asset in value) {
        if (remaining[asset] > 0n) {
          return false;
        }
      }
      return true;
    }
  
    function sortByLeft(utxos: UTxO[], value: Assets ) : UTxO[] {
      const targetAssets: string[] = Object.keys(value).filter(asset => value[asset] > 0n);
  
      const sortedUtxos = utxos.sort((a, b) => {
        //sort the utxos by the amount of the target assets left
        const aLeft = targetAssets.reduce((acc, asset) => acc + BigInt(a.assets[asset as keyof Assets] || 0), 0n);
        const bLeft = targetAssets.reduce((acc, asset) => acc + BigInt(b.assets[asset as keyof Assets] || 0), 0n);
        return Number(bLeft - aLeft);
      });
      return sortedUtxos
    }
  
  
    // Sort UTXOs in descending order of lovelace value
    let availableUtxos = utxos
    let selectedUtxos: UTxO[] = [];
    let totalRemaining: Assets = value;
  
    // Iterate through sorted UTXOs
    while (availableUtxos.length > 0) {
      let sortedUtxos = sortByLeft(availableUtxos, value);
      const selectedUtxo = sortedUtxos[0]
      selectedUtxos.push(selectedUtxo);
      availableUtxos = availableUtxos.filter(utxo => !( utxo.txHash === selectedUtxo.txHash && utxo.outputIndex === selectedUtxo.outputIndex))
    
  
  
      // Add all assets from the current UTXO to totalRemaining
      for (const asset in selectedUtxo.assets) {
          if (!totalRemaining[asset]) {
          totalRemaining[asset] = 0n;
        }
        totalRemaining[asset] -= BigInt(selectedUtxo.assets[asset]);
      }
  
      // Check if we have enough to cover the requested value
      if (isEnoughValue(totalRemaining)) {
        if (availableUtxos.length > UPPERBOUND){
            const extra = Math.min(availableUtxos.length % UPPERBOUND, MAX_EXTRA)
            selectedUtxos = [...selectedUtxos, ...availableUtxos.slice(0, extra)]
        }

        return selectedUtxos;

      }
      console.log("sortedUtxos", sortedUtxos, totalRemaining, selectedUtxos, availableUtxos)

    }
  
    // If we reach here, it means we don't have enough UTXOs to cover the value
    throw new Error('Insufficient funds to cover the requested value');
  }
  