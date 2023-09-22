
const sharp = require('sharp');
const { MongoClient } = require('mongodb');
const config = require('./config.js');
async function CombineImages(sourceImages) {
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  sourceImages = sourceImages.filter((image) => {return image !== undefined})

  sourceImages = sourceImages.map((image) => {
    console.log(image)
    if(image instanceof Buffer){
      return image
    }else{
      return Buffer.from(image)
    }
  })
  const predefinedLocations = sourceImages.length < config.posittioning.length
  
  const componentSize = predefinedLocations ? config.posittioning[sourceImages.length].size : Math.floor(config.canvas.width / sourceImages.length);
  const randomLocation = ( () =>  config.margin + getRandomInt(config.canvas.width - config.margin*2 - componentSize))
  // Resize images to a common size (adjust dimensions as needed)
  const resizedImages = await Promise.all(sourceImages.map(imgBuffer =>
    sharp(imgBuffer)
      .resize(componentSize, componentSize) // Adjust the size as needed
      .toBuffer()
  ));

  
  const composite = resizedImages.map((imgBuffer, index) => ({
    input: imgBuffer,
    left: predefinedLocations ? config.posittioning[sourceImages.length].positions[index].left : randomLocation(), 
    top: predefinedLocations ? config.posittioning[sourceImages.length].positions[index].top : randomLocation(),
  }))

  // composite.push({
  //   input: Buffer.from(`<svg height="20"  width="500"><text x="20" y="20" font-family="Arial" font-size="${ 24}" fill="${ 'black'}">TESTING TEXT</text></svg>`),
  //   left: 350,
  //   top: 50,
  // })
  // Combine resized images horizontally
  const collageImageBuffer = await sharp({
    create: {
      width:  config.canvas.width, 
      height: config.canvas.height,
      channels: 4, 
      background: { r: 255, g: 255, b: 255, alpha: 1 }, 
    }
  })


    .composite(composite)
    .png() 
    .toBuffer()
    return collageImageBuffer
}

fetchImage = async function(url){
  //if start with ipfs get from ipfs
  if(url.startsWith("ipfs://")){
    const res = await fetch("https://ipfs.blockfrost.dev/ipfs/"+url.slice(7).replace("ipfs/", ""))
    return await res.arrayBuffer()
  }else{
    const res = await fetch(url)
    return await res.arrayBuffer()
  }
}


getSourceImages = async function(tokenList){ 
  const tokenListKeys = Object.keys(tokenList)

  const sourceImages = await tokenListKeys.map(async (key) => { 
    console.log("Gathering for" +key)

          const tokenInfo = await  getTokenInfo(key)
          if(tokenInfo.metadata){
            return   Buffer.from(tokenInfo.metadata.logo, 'base64'); t
          }else if(tokenInfo.onchain_metadata){
            return await fetchImage(tokenInfo.onchain_metadata.image)
          }})   
  //resolve all promises
  
  return await Promise.all(sourceImages)


}

function getTokenInfo(tokenId){
  return fetch(
    `${config.blockfrostUrl}/assets/${tokenId}`,
    { headers: { project_id: config.blockfrostKey } },
  ).then((res) => res.json()); 

}

async function updateImages(needImageUpdate){
  needImageUpdate.map(async (token) => {
   const sourceImages = await getSourceImages(utxosToTokenMap(token.utxos))
   const image = await CombineImages(sourceImages)
   tokens.updateOne({id: token.id}, {$set: {image: image, imageUpdate: true}})
 // console.log(sourceImages)
  })
}

function utxosToTokenMap(utxos){
  const tokenList = {};
  utxos.filter((utxo) => { return utxo.spent === false; }).map((utxo) => {
      if (tokenList["lovelace"] === undefined) {
          tokenList["lovelace"] = 0;
      }
      tokenList["lovelace"] += utxo.value.ada.lovelace;
      Object.keys(utxo.value).map((policyId) => {
          if (policyId === "ada" ) return
          Object.keys(utxo.value[policyId]).map((assetName) => {
              if (tokenList[policyId+assetName] === undefined) {
                  tokenList[policyId+assetName] = 0;
              }
              tokenList[policyId+assetName] += utxo.value[policyId][assetName];
          });
  });
  });
  return tokenList;

} 
async function main(){
 // config = ({ ...config }).default;
  console.log(config)
  mongoClient = new MongoClient(config.mongoUri);
  await mongoClient.connect();
  tokens = mongoClient.db("TokenVaults").collection("Tokens")

  imageDb = mongoClient.db("TokenVaults").collection("Images")
  const needImageUpdate = await tokens.find({imageUpdate: true}).toArray()
  updateImages(needImageUpdate)
  watchTransactions()
  }


  
async function watchTransactions() {
  // membersToUpdate is a list of members that need to be updated with the new transaction

  const pipeline = [
    {
      $match: {
        operationType: { $in: ["update"] },
        "fullDocument.imageUpdate": true      
      }
    }
  ];
  
  const options = { fullDocument: "updateLookup" };
  const changeStream = tokens.watch( pipeline , options );

  changeStream.on('change', async (change) => {
    const transaction = await tokens.findOne({ _id: change.documentKey._id });
    console.log("updating: "+transaction)
    updateImages([transaction])
  });


}

//fetchAndCombineImages([image, image, image]);

main()