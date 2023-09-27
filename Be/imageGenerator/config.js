const config = {
    mongoUri : "mongodb://127.0.0.1:27017",
    dbName: "TokenVaults",
    // blockfrostKey : "preprodLZ9dHVU61qVg6DSoYjxAUmIsIMRycaZp",
    blockfrostKey : "preprod",
    blockfrostUrl : "https://passthrough.broclan.io",
    canvas : {height: 4000, width: 4000},
    margin : 230,
    shelf : {ratio: 8, offset: 0.52, base: 400},
    tokens: {logoRatio : 0.36, offsetLTop: 0.256, offsetLLeft: 0.16 ,  offsetSTop: 0.588, offsetSLeft: 0.43 , smallLimit : 100 , mediumLimit : 1001 },
    }


module.exports = config