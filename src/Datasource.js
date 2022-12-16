import { Blockfrost, Lucid } from "lucid-cardano"; // NPM

class Datasource{


    constructor(type,key=""){
            this.type = type;
            this.key = key
    }


    static async from_blockfrost(projectId){
            const lucid = await Lucid.new(
                new Blockfrost("https://cardano-preprod.blockfrost.io/api/v0", projectId),
                "Preprod",
              );
              console.log()

    
        return new Datasource("blockfrost", lucid )

    }
    
    async getUtxos (address){
        switch (this.type) {
            case "blockfrost":
              return await this.key.provider.getUtxos(address);
              break;
          }

    }

}

export default Datasource;