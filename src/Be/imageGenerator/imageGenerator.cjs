
const sharp = require('sharp');
const { MongoClient } = require('mongodb');

async function CombineImages(sourceImages) {

  sourceImages = sourceImages.filter((image) => {return image !== undefined})

  sourceImages = sourceImages.map((image) => {
    console.log(image)
    if(image instanceof Buffer){
      return image
    }else{
      return Buffer.from(image)
    }
  })

  // Resize images to a common size (adjust dimensions as needed)
  const resizedImages = await Promise.all(sourceImages.map(imgBuffer =>
    sharp(imgBuffer)
      .resize(200, 200) // Adjust the size as needed
      .toBuffer()
  ));

  // Combine resized images horizontally
  const collageImageBuffer = await sharp({
    create: {
      width:  600, // Adjust the width based on the number of images
      height: 200, // Adjust the height as needed
      channels: 4, // 4 channels for RGBA
      background: { r: 255, g: 255, b: 255, alpha: 1 }, // Background color
    }
  })

    .composite(resizedImages.map((imgBuffer, index) => ({
      input: imgBuffer,
      left: index * 200, // Adjust the positioning
      top: 0,
    })))
    .png() // You can change the format as needed (e.g., jpeg)
    .toBuffer()
    
    return collageImageBuffer
}
fetchImage = async function(url){
  //if start with ipfs get from ipfs
  if(url.startsWith("ipfs://")){
    const res = await fetch("https://ipfs.blockfrost.dev/ipfs/"+url.slice(7))
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
  config = await import("./config.js")
  config = ({ ...config }).default;
  console.log(config)
  mongoClient = new MongoClient(config.mongoUri);
  await mongoClient.connect();
  tokens = mongoClient.db("TokenVaults").collection("Tokens")

  imageDb = mongoClient.db("TokenVaults").collection("Images")
  const needImageUpdate = await tokens.find({imageUpdate: true}).toArray()
  updateImages(needImageUpdate)
  }

//fetchAndCombineImages([image, image, image]);

main()