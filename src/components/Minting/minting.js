import React from "react";
import "./minting.css"
class Minting extends React.Component {
    state = {
        showing: "overview"
    }


    mintingSrc =     `
    minting TokenKey
    
    const  MintingPolicy: ByteArray = #4190b2941d9be04acc69c39739bd5acc66d60ccab480d8e20bc87e37
    const TokenName: ByteArray = #57696e67526964657273
             
    const  AdminToken : AssetClass = AssetClass::new(
          MintingPolicyHash::new(MintingPolicy),
          TokenName
        )
    
    struct Redeemer {
           referrer: PubKeyHash 
    }     
    
    
    func paymentMade (ctx: ScriptContext , amount : Int ) -> Bool {
    
        adminUtxo: TxInput = ctx.tx.ref_inputs.find((input: TxInput) -> Bool { 
                                                               input.value.get_safe(AdminToken) == 1
     });
        
        adminDatum : Map[String]Int = Map[String]Int::from_data(adminUtxo.datum.get_inline_data()); 
    
        paymentUtxo: TxOutput = ctx.tx.outputs.find(( output: TxOutput) -> Bool {
                                                        output.address == adminUtxo.address
                                                         });
    
      
        paymentUtxo.value.get_lovelace() == adminDatum.get("paymentAmount") * amount
    
    }
    
    
    func mintCorrect(ctx: ScriptContext ) -> Bool {
        mintingAssets : Map[ByteArray]Int = ctx.tx.minted.to_map().get(ctx.get_current_minting_policy_hash());
        
     
         mintingAssets.all( ( mintedToken : ByteArray, _)  -> Bool { 
                                    ctx.tx.inputs.any((input : TxInput) -> Bool {  input.output_id == TxOutputId::new(TxId::new(mintedToken), 0)}
                    )})   
       
    }
    
    
    func mintAmount(ctx: ScriptContext) -> Int {
        mintingAssets : Map[ByteArray]Int = ctx.tx.minted.to_map().get(ctx.get_current_minting_policy_hash());
        mintingAssets.length 
    }
    
    func main( _ , ctx: ScriptContext) -> Bool {
         paymentMade(ctx , mintAmount(ctx)) && mintCorrect(ctx )
    }
    
    `      

    render() {
        return (
            <div className='MintingModule'>

                
                Minting Module

                <br />
            </div>
        );
    }

}

export default Minting