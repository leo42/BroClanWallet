function normalizeTxDetails(txBody: any){
    if (txBody.outputs) {
        txBody.outputs = txBody.outputs.map((output: any) => {
          // Check if the output is an object with a single key (format type)

          const formatKeys = Object.keys(output);
          if (formatKeys.length === 1 && typeof output[formatKeys[0]] === 'object') {
            // Return the inner object, which contains the actual output data
            return output[formatKeys[0]];
          }
          return output;
        });
      }
      if (txBody.inputs) {
        txBody.inputs = txBody.inputs.map((input : any) => {
          // Check if the input is an object with a single key (format type)
          const formatKeys = Object.keys(input);
          if (formatKeys.length === 1 && typeof input[formatKeys[0]] === 'object') {

            // Return the inner object, which contains the actual input data
            return input[formatKeys[0]];
          }
          return input;
        });
      }
      if (txBody.collateral_return) {
        const formatKeys = Object.keys(txBody.collateral_return);
        if (formatKeys.length === 1 && typeof txBody.collateral_return[formatKeys[0]] === 'object') {
          txBody.collateral_return = txBody.collateral_return[formatKeys[0]];
        }
      }
      return txBody
}

export default normalizeTxDetails