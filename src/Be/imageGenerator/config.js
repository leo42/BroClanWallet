import { Block } from "@dcspark/cardano-multiplatform-lib-nodejs"

const config = {
    mongoUri : "mongodb://127.0.0.1:27017",
    // blockfrostKey : "preprodLZ9dHVU61qVg6DSoYjxAUmIsIMRycaZp",
    blockfrostKey : "mainnetpHvIYtcVH3eRVTJLwln9cd6aUCC9zAh6",
    blockfrostUrl : "https://cardano-mainnet.blockfrost.io/api/v0",
    canvas : {height: 1024, width: 1024},
    margin : 10,
    posittioning: [ {}, { positions: [{top: 10, left: 10}] , size: 1000}, 
                    { positions: [{top: 10, left: 10}, {top: 10, left: 10}] , size: 400},
                    { positions: [{top: 20, left: 20}, {top: 350, left: 350}, {top: 690, left: 690}] , size: 300},
                    { positions: [{top: 40, left: 40}, {top: 690, left: 40}, {top: 40, left: 690}, {top: 690, left: 690}] , size: 300},
                    { positions: [{top: 40, left: 40}, {top: 690, left: 40}, {top: 40, left: 690}, {top: 690, left: 690}, {top: 350, left: 350}] , size: 300},
                    { positions: [{top: 10, left: 10}, {top: 10, left: 10}, {top: 10, left: 10}, {top: 10, left: 10}, {top: 10, left: 10}, {top: 10, left: 10}] , size: 250},]
}

export default config