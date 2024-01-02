import { splitString } from "./usedFunctions.js";
import { createErrorCorrectionCodewords } from "./errorCorrection.js";
// Usable versions 3, 6, 7, 13, 20, 30
// const QR_VERSION = 13;
// const QR_ERROR_CORRECTION = "Q";
// For version 13 and error correction q
// const TOTAL_BITS = 1952;

// const DATA_BY_VERSION_AND_ECLEVEL = {
//   1: {
//     "L": 152,
//     "M": 128,
//     "Q": 104,
//     "H": 72
//   },
//   13: {
//     "Q": 1952
//   }
// }

const DATA_BY_VERSION_AND_ECLEVEL = {
  1: {
    "L": {
      "totalDataBits": 152,
      "ecWordsAndBlocks": {
        "blocksInGroup1": 1,
        "codewordsPerBlock1": 19,
        "codeWordsPerBlock2": 0
      }
    },
    "M": {
      "totalDataBits": 128,
      "ecWordsAndBlocks": {
        "blocksInGroup1": 1,
        "codewordsPerBlock1": 16,
        "codeWordsPerBlock2": 0,
      }
    },
    "Q": {
      "totalDataBits": 104,
      "ecWordsAndBlocks": {
        "blocksInGroup1": 1,
        "codewordsPerBlock1": 13,
        "codeWordsPerBlock2": 0
      }
    },
    "H": {
      "totalDataBits": 72,
      "ecWordsAndBlocks": {
        "blocksInGroup1": 1,
        "codewordsPerBlock1": 9,
        "codeWordsPerBlock2": 0
      }
    }
  },
  5: {
    "L": {
      "totalDataBits": 864,
      "ecWordsAndBlocks": {
        "blocksInGroup1": 1,
        "codewordsPerBlock1": 108,
        "codeWordsPerBlock2": 0
      }
    },
    "M": {
      "totalDataBits": 688,
      "ecWordsAndBlocks": {
        "blocksInGroup1": 2,
        "codewordsPerBlock1": 43,
        "codeWordsPerBlock2": 0,
      }
    },
    "Q": {
      "totalDataBits": 496,
      "ecWordsAndBlocks": {
        "blocksInGroup1": 2,
        "codewordsPerBlock1": 15,
        "codeWordsPerBlock2": 16
      }
    },
    "H": {
      "totalDataBits": 368,
      "ecWordsAndBlocks": {
        "blocksInGroup1": 2,
        "codewordsPerBlock1": 11,
        "codeWordsPerBlock2": 12
      }
    }
  },
  13: {
    "L": {
      "totalDataBits": 3424,
      "ecWordsAndBlocks": {
        "blocksInGroup1": 4,
        "codewordsPerBlock1": 107,
        "codeWordsPerBlock2": 0
      }
    },
    "M": {
      "totalDataBits": 2672,
      "ecWordsAndBlocks": {
        "blocksInGroup1": 8,
        "codewordsPerBlock1": 37,
        "codeWordsPerBlock2": 38,
      }
    },
    "Q": {
      "totalDataBits": 1952,
      "ecWordsAndBlocks": {
        "blocksInGroup1": 8,
        "codewordsPerBlock1": 20,
        "codeWordsPerBlock2": 21
      }
    },
    "H": {
      "totalDataBits": 1440,
      "ecWordsAndBlocks": {
        "blocksInGroup1": 12,
        "codewordsPerBlock1": 11,
        "codeWordsPerBlock2": 12
      }
    }
  },
};

const REMAINDER_BITS_PER_VERSION = {
  1: 0,
  5: 7,
  13: 0
}


const CHAR_COUNT = {
  "1-9": {
    "0001": 10,
    "0010": 9,
    "0100": 8,
    "1000": 8
  },
  "10-26": {
    "0001": 12,
    "0010": 11,
    "0100": 16,
    "1000": 10
  }
}

const ALPHA_SPECIAL_CODES = {
  " ": 36,
  "$": 37,
  "%": 38,
  "*": 39,
  "+": 40,
  "-": 41,
  ".": 42,
  "/": 43,
  ":": 44
}

function getEncodingMode(textToEncode){
  let regexNumeric = /^\d+$/;
  let regexAlphanumeric = /^[\dA-Z $%*+\-./:]*$/;
  let regexByte = /^[\x00-\xff]*$/;
  let regexKanji = /^[\p{Script_Extensions=Han}\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}]*$/u;
  if (regexNumeric.test(textToEncode)){
    return "0001";
  }
  
  if (regexAlphanumeric.test(textToEncode)){
    return "0010";
  }
  
  if (regexByte.test(textToEncode)){
    return "0100";
  }
  
  if (regexKanji.test(textToEncode)){
    return "1000";
  } 
  return "0111";
}

function getCharCount(textLength, mode, versionRange){
  let binary = textLength.toString(2);
  
  return binary.padStart(CHAR_COUNT[versionRange][mode], "0");
}

function encodeData(textToEncode, version, ecMode){

  let versionRange;

  if(version < 10){
    versionRange = "1-9"
  } else if (version < 27){
    versionRange = "10-26";
  } else{
    versionRange = "27-40";
  }
  let enMode = getEncodingMode(textToEncode);
  let charCount = getCharCount(textToEncode.length, enMode, versionRange);
  let encodedString = "";

  if (enMode == "0001"){
    // numeric
    encodedString = encodeNumericMode(textToEncode);
  }

  if (enMode == "0010"){
    // alphanumeric
    encodedString = encodeAlphanumericMode(textToEncode);
  }

  if (enMode == "0100"){
    // byte
    for(let index = 0; index < textToEncode.length; index++){
      encodedString += textToEncode.charCodeAt(index).toString(2).padStart(8,"0");
    }
  }

  if (enMode == "1000"){
    // kanji, never doing this
    return "fuck off";
  }
  
  // adding terminator

  let encodedData = enMode + charCount + encodedString;

  // console.log("encoded data before any padding: " + encodedData);

  let terminator = (DATA_BY_VERSION_AND_ECLEVEL[version][ecMode]["totalDataBits"] - encodedData.length < 4) ? DATA_BY_VERSION_AND_ECLEVEL[version][ecMode]["totalDataBits"] - encodedData.length : 4;
  encodedData = encodedData.padEnd(encodedData.length + terminator, "0");

  // making the length a multiple of 8

  if (encodedData.length % 8 != 0){
    let pad = 8 - ( encodedData.length % 8 );
    encodedData = encodedData.padEnd(encodedData.length + pad, "0");
  }

  // final padding 
  if (encodedData.length < DATA_BY_VERSION_AND_ECLEVEL[version][ecMode]["totalDataBits"]){
    encodedData = encodedData.padEnd(DATA_BY_VERSION_AND_ECLEVEL[version][ecMode]["totalDataBits"], "1110110000010001");
  }

  // console.log("encoded data after padding: " + encodedData);

  let codeWords = breakIntoCodeblocks(encodedData, version, ecMode);
  // console.log("The codewords: ");
  // console.log(codeWords)
  let ecCodeWords = createErrorCorrectionCodewords(codeWords, version, ecMode);
  // console.log("The ec codewords: ");
  // console.log(ecCodeWords);

  // let finalMessage = ""

  let finalMessage = interleaveCW(codeWords);

  
  finalMessage += interleaveCW(ecCodeWords);
  
  // console.log(finalMessage)
  let totalLength = finalMessage.length + REMAINDER_BITS_PER_VERSION[version]

  return finalMessage.padEnd(totalLength, "0");
}

function interleaveCW(codeWords){

  let interleavedWords = "";

  let limitBlocksGroup1 = codeWords[0].length;
  let limitBlocksGroup2 = codeWords[1].length;
  let limitCodeWordsGroup1 = codeWords[0][0].length;
  let limitCodeWordsGroup2 = (limitBlocksGroup2 == 0) ? 0 : codeWords[1][0].length;
  

  let group = 0;
  let word = 0;

  while (true){
    if(word > limitCodeWordsGroup1 && word > limitCodeWordsGroup2){
      break;
    }
    if(word < limitCodeWordsGroup1){
      interleavedWords += iterateThroughBlocks(codeWords, word, group, limitBlocksGroup1, limitCodeWordsGroup1);
    }
    group++;
    if(word < limitCodeWordsGroup2){
      interleavedWords += iterateThroughBlocks(codeWords, word, group, limitBlocksGroup2, limitCodeWordsGroup2);
    }
    word++;
    group = 0;
  }
  return interleavedWords;

}

function iterateThroughBlocks(codeWords, word, group, limitBlocks, limitCodewords) {

  let interleaved = "";

  for (let indexBlock = 0; indexBlock < limitBlocks; indexBlock++) {
    if (word > limitCodewords) {
      break;
    }
    interleaved += codeWords[group][indexBlock][word];
  }
  return interleaved;
}
function encodeNumericMode(textToEncode) {

  let splittedData = splitString(textToEncode, 3);
  let threeDigits = "";
  let digitsInBinary = "";
  let amountToPad = 0;
  let numericEncoded = "";
  for (let i = 0; i < splittedData.length; i++) {
    threeDigits = splittedData[i];
    digitsInBinary = parseInt(threeDigits, 10).toString(2);

    // ugly stuff incoming
    if (threeDigits[0] == 0) {
      if (threeDigits[1] == 0) {
        amountToPad = 4;
      } else {
        amountToPad = 7;
      }
    } else {
      amountToPad = 10;
    }
    numericEncoded += digitsInBinary.padStart(amountToPad, "0");
  }
  return numericEncoded;
}

function encodeAlphanumericMode(textToEncode) {

  let splittedString = splitString(textToEncode, 2);

  let charA = "";
  let charB = "";
  let twoChars = "";
  let charAcode = 0;
  let charBcode = 0;
  let alphaEncoded = "";

  for (let i = 0; i < splittedString.length; i++) {
    twoChars = splittedString[i];


    charA = twoChars[0];
    charB = twoChars[1];
    charAcode = charA in ALPHA_SPECIAL_CODES ? ALPHA_SPECIAL_CODES[charA] : parseInt(charA, 36);
    charBcode = charB in ALPHA_SPECIAL_CODES ? ALPHA_SPECIAL_CODES[charB] : parseInt(charB, 36);
    if (twoChars.length == 1) {
      alphaEncoded += charAcode.toString(2).padStart(6, "0");
      continue;
    }

    var medSult = (45 * charAcode) + charBcode;
    alphaEncoded += medSult.toString(2).padStart(11, "0");
  }
  return alphaEncoded;
}

function breakIntoCodeblocks(data, version, ecMode){
  let codewords = splitString(data, 8);

  let codeBlocks = [[], []];
  let block = [];

  for (let i = 0; i < codewords.length; i++){
    if(codeBlocks[0].length < DATA_BY_VERSION_AND_ECLEVEL[version][ecMode]["ecWordsAndBlocks"].blocksInGroup1){
      block.push(codewords[i]);
      if(block.length == DATA_BY_VERSION_AND_ECLEVEL[version][ecMode]["ecWordsAndBlocks"].codewordsPerBlock1){
        codeBlocks[0].push(JSON.parse(JSON.stringify(block)));
        block = [];
      }
    } else{
      block.push(codewords[i]);
      if(block.length == DATA_BY_VERSION_AND_ECLEVEL[version][ecMode]["ecWordsAndBlocks"].codeWordsPerBlock2){
        codeBlocks[1].push(JSON.parse(JSON.stringify(block)));
        block = [];
      }
    }
  }

  return codeBlocks;
}

const HARDCODED_DATA_FOR_TEST = "0100001101010101010001101000011001010111001001100101010111000010011101110011001000000110000100100000011001100111001001101111011011110110010000100000011101110110100001101111001000000111001001100101011000010110110001101100011110010010000001101011011011100110111101110111011100110010000001110111011010000110010101110010011001010010000001101000011010010111001100100000011101000110111101110111011001010110110000100000011010010111001100101110000011101100000100011110110000010001111011000001000111101100"


// console.log(encodeData("HELLO WORLD", 5, "Q"));
// console.log("Pls execute this man")
// let dataCodewords = breakIntoCodeblocks(HARDCODED_DATA_FOR_TEST, 5, "Q")
// console.log("The data codewords: ")
// console.log(dataCodewords)
// console.log("The ecCodewords: ")
// let ecCodewords = createErrorCorrectionCodewords(dataCodewords, 5, "Q")
// console.log(ecCodewords)
// let exampleInterleaved = "";
// exampleInterleaved += interleaveCW(dataCodewords)
// exampleInterleaved += interleaveCW(ecCodewords)
// console.log("everything interleaved: ")
// console.log(exampleInterleaved)

export { encodeData, breakIntoCodeblocks, DATA_BY_VERSION_AND_ECLEVEL };