
const sharp = require('sharp');
const { MongoClient } = require('mongodb');
const config = require('./config.js');


const baseImagePath = './BaseImages/closedSafe.png';
const openSafeImagePath = './BaseImages/openSafe.png';
const shelfImagePath = './BaseImages/shelf.png';

const resizeOptions = {// Prevents enlargement/cropping
  fit: 'fill', // Fits the image inside the specified dimensions
}

async function CombineImages(sourceImages) {
  
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  sourceImages = sourceImages.filter((image) => {return image !== undefined})

  if (sourceImages.length === 0) {
    return await sharp(baseImagePath)
    .png() 
    .toBuffer()
  }
  const layers = Math.ceil(Math.sqrt(sourceImages.length))

  sourceImages = sourceImages.map((image) => {
    console.log(image)
    if(image instanceof Buffer){
      return image
    }else{
      return Buffer.from(image)
    }
  })

  
  
  
  const shelfHight =  Math.max( Math.floor( config.shelf.base / layers) ,1)
  const shelfImage = await sharp(shelfImagePath).resize(config.canvas.width,(shelfHight*config.shelf.ratio),resizeOptions).toBuffer()
  const composite = []
  const layerFreeSpace =(config.canvas.height  - (shelfHight * (layers-1)) -  config.margin*2)/layers
  const componentSize = Math.floor( (layerFreeSpace * 0.85 ) - (shelfHight*config.shelf.offset)) ;
  
  const shelfLocation = (index) =>  Math.floor( config.margin + (index*(layerFreeSpace)) + ((index-1) * shelfHight) - shelfHight*config.shelf.offset - shelfHight)  
  const componentTopLocation = (index) =>  Math.floor( shelfLocation(index) - (componentSize) + (shelfHight*config.shelf.offset/2)   )
  const componentLeftLocation = (index) =>  Math.floor( config.margin*1.8 + (index*(layerFreeSpace)))

// Create the nftFrame with a specific size and background color
const nftFrame = sharp({
  create: {
    width: componentSize,
    height: componentSize,
    channels: 4, // 4 channels for RGBA
    background: { r: 0, g: 0, b: 0, alpha: 1 },
  },
}).resize(componentSize, componentSize).png();

  const frameThickness = 10

  const resizedImages = await Promise.all(sourceImages.map(imgBuffer =>
    sharp(imgBuffer)
    .resize(componentSize-(frameThickness*2), componentSize-(frameThickness*2)) // Adjust the size as needed
    .toBuffer()
    ));
    
  const nftImages = await Promise.all(resizedImages.map(async (imgBuffer, index) => {
    console.log(imgBuffer)
    //make clone of nftFrame
    const nftFrameClone = nftFrame.clone()
    const framedImage = await nftFrameClone.composite([{ input: imgBuffer, top: frameThickness, left: frameThickness }])
    return await framedImage.toBuffer()
  }))
    
    
  for(let i = 1; i < layers; i++){ 
    composite.push( {
      input: shelfImage,
      left: 0, 
      top:  shelfLocation(i),
   })
  }

  nftImages.map((imgBuffer, index) => (
    composite.push({
    input: imgBuffer,
    left:  componentLeftLocation(  index% layers), 
    top:  componentTopLocation(Math.ceil( (index+1)/layers) ),
  })))


  // composite.push({
  //   input: Buffer.from(`<svg height="20"  width="500"><text x="20" y="20" font-family="Arial" font-size="${ 24}" fill="${ 'black'}">TESTING TEXT</text></svg>`),
  //   left: 350,
  //   top: 50,
  // })
  // Combine resized images horizontally
  const collageImageBuffer = await sharp(openSafeImagePath).resize(config.canvas.width,config.canvas.height)
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
        //  console.log(tokenInfo)
          if(tokenInfo.quantity === "1"){
            console.log("NFT")
          }
          if(tokenInfo.metadata){
            return   Buffer.from(tokenInfo.metadata.logo, 'base64'); 
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
//  watchTransactions()
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