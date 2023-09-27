
const sharp = require('sharp');
const { MongoClient } = require('mongodb');
const config = require('./config.js');


const baseImagePath = './BaseImages/closedSafe.png';
const openSafeImagePath = './BaseImages/openSafe.png';
const shelfImagePath = './BaseImages/shelf.png';
const smallCoinsImagePath = './BaseImages/coinsS.png';
const mediumCoinsImagePath = './BaseImages/coinsM.png';
const largeCoinsImagePath = './BaseImages/coinsL.png';
const adaImagePath = './BaseImages/ada.png';
const resizeOptions = {// Prevents enlargement/cropping
  fit: 'fill', // Fits the image inside the specified dimensions
}




async function CombineImages(sourceImages) {

  sourceImages = sourceImages.filter((image) => {return image !== undefined})
  if (sourceImages.length === 0) {
    return await sharp(baseImagePath)
    .png() 
    .toBuffer()
  }
 

  let nftSourceImages = sourceImages.filter((image) => {return image.nft === true}).map((image) => {return image.image} )
  let tokenSourceImages = sourceImages.filter((image) => {return image.nft === false}).map((image) => {return image.image} )
  let tokenSourceAmounts = sourceImages.filter((image) => {return image.nft === false}).map((image) => {return image.quantity} )

  const layers =  Math.ceil(Math.sqrt(nftSourceImages.length + tokenSourceImages.length))

  nftSourceImages = nftSourceImages.map((image) => {
    if(image instanceof Buffer){
      return image
    }else{
      return Buffer.from(image)
    }
  })

  tokenSourceImages = tokenSourceImages.map((image) => {
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
  const componentTopLocation = (index) =>  Math.floor( shelfLocation(index) - (componentSize) + (shelfHight*config.shelf.offset)   )
  const componentLeftLocation = (index) =>  Math.floor( config.margin + layerFreeSpace* 0.25 + (index*(layerFreeSpace)) + ((index-1) * shelfHight) )

  // Create the nftFrame with a specific size and background color
  const nftFrame = sharp({
    create: {
      width: componentSize,
      height: componentSize,
      channels: 4, // 4 channels for RGBA
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  }).resize(componentSize, componentSize).png();
  
  const frameThickness = Math.floor(50/layers)
  
  const resizedImages = await Promise.all(nftSourceImages.map(imgBuffer =>
    sharp(imgBuffer)
    .resize(componentSize-(frameThickness*2), componentSize-(frameThickness*2)) // Adjust the size as needed
    .toBuffer()
    ));

  const logoSize = Math.floor(componentSize*config.tokens.logoRatio)
  const mask = [  { input: Buffer.from(`<svg width="${logoSize}" height="${logoSize}"><circle cx="${logoSize/2}" cy="${logoSize/2}" r="${logoSize/1.75}" fill="black" /></svg>`
        ), blend: 'dest-in'}   ]

  tokenSourceImages = await Promise.all( tokenSourceImages.map((image) => { return sharp(image)
                                                  .resize(logoSize,logoSize)
                                                  .composite(mask , { raw: true })
                                                  .toBuffer()} ))
  
                            
  tokenSourceImages = await Promise.all(tokenSourceImages.map(( imgBuffer,index) => { 
      console.log("tokens " + tokenSourceAmounts[index] )

    if(tokenSourceAmounts[index] < config.tokens.smallLimit){     
      return sharp(smallCoinsImagePath).resize(componentSize,componentSize ).composite([{
        input: imgBuffer,
        left:  Math.round(config.tokens.offsetSLeft*componentSize) ,
        top: Math.round( config.tokens.offsetSTop*componentSize) ,
      }]).png().toBuffer() 
    }
    if(tokenSourceAmounts[index] < config.tokens.mediumLimit){
      return sharp(mediumCoinsImagePath).resize(componentSize,componentSize ).composite([{
        input: imgBuffer,
        left:  Math.round(config.tokens.offsetSLeft*componentSize) ,
        top: Math.round( config.tokens.offsetSTop*componentSize) ,
      }]).png().toBuffer() 
    }
      return sharp(largeCoinsImagePath).resize(componentSize,componentSize ).composite([{
        input: imgBuffer,
        left:  Math.round(config.tokens.offsetLLeft*componentSize) ,
        top: Math.round( config.tokens.offsetLTop*componentSize) ,
      }]).png().toBuffer() 
      
      }));
    
  const nftImages = await Promise.all(resizedImages.map(async (imgBuffer, index) => {
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
    left:  componentLeftLocation( index% layers), 
    top:  componentTopLocation(Math.ceil( (index+1)/layers) ),
  })))
  if (layers === 1  ){
    composite.push({
      input: tokenSourceImages[0],
      left: Math.round( config.canvas.width/2 - componentSize/2) ,
      top:  Math.round( config.canvas.width/2 - componentSize/2.8),
    })
  }else{   
    tokenSourceImages.map((imgBuffer, index) => (
      composite.push({
      input: imgBuffer,
      left:  componentLeftLocation( layers - ( index  % layers) - 1 ) ,
      top:  componentTopLocation( layers - Math.ceil( (index+1)/layers) + 1 ),
    })))
    }
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

  const sourceImages =  tokenListKeys.map(async (key) => { 
    console.log("Gathering for" +key)
          if (key === "lovelace") {
            return { image: await sharp(adaImagePath).toBuffer() , nft: false , quantity : tokenList[key]  }
          }
          const tokenInfo = await  getTokenInfo(key)
        //  console.log(tokenInfo)
          if(tokenInfo.quantity === "1" ){
            console.log("NFT")
          }
          if(tokenInfo.metadata){
            return { image: Buffer.from(tokenInfo.metadata.logo, 'base64') , nft: false , quantity : tokenList[key]  }
          }else if(tokenInfo.onchain_metadata){
            const image = await  fetchImage(tokenInfo.onchain_metadata.image)
            if (tokenInfo.quantity === "1" ){
              return { image , nft: true  } 
            }else{
              return { image , nft: false, quantity : tokenList[key]  }
            }

          }})   
  //resolve all promises
  
  return (await Promise.all(sourceImages)).filter((image) => {return image !== undefined})


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
   tokens.updateOne({id: token.id}, {$set: {image: image, imageUpdate: false}})
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
  tokens = mongoClient.db(config.dbName).collection("Tokens")

  imageDb = mongoClient.db(config.dbName).collection("Images")
  const needImageUpdate = await tokens.find({imageUpdate: true}).toArray()
  updateImages(needImageUpdate)
  watchTransactions()
  }


  
async function watchTransactions() {
  // membersToUpdate is a list of members that need to be updated with the new transaction

  const pipeline = [
    {
      $match: {
        operationType: { $in: ["update", "insert"] },
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