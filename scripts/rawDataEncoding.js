import { splitString } from "./usedFunctions.js";
import { createErrorCorrectionCodewords } from "./errorCorrection.js";

var DATA_BY_VERSION_AND_ECLEVEL = {};

/*
  Loads all the necessary data from a json file
*/
fetch("./scripts/dataAndCWByVersionAndEcLevel.json")
    .then((response) => response.json())
    .then((json) => DATA_BY_VERSION_AND_ECLEVEL = json)

const REMAINDER_BITS_PER_VERSION = {
  1: 0,
  2: 7,
  3: 7,
  5: 7,
  7: 0,
  9: 0,
  10: 0,
  11: 0,
  13: 0,
  15: 3,
  20: 3,
  25: 4,
  30: 3,
  35: 0,
  40: 0
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
  },
  "27-40": {
    "0001": 14,
    "0010": 13,
    "0100": 16,
    "1000": 12
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

  let codeWords = breakIntoCodeblocks(encodedData, version, ecMode);
  let ecCodeWords = createErrorCorrectionCodewords(codeWords, version, ecMode);

  let finalMessage = interleaveCW(codeWords);
  finalMessage += interleaveCW(ecCodeWords);

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

    // ugly stuff incoming
    digitsInBinary = parseInt(threeDigits, 10).toString(2);
    if (threeDigits.length < 3) {
      if (threeDigits.length == 1) {
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
    charAcode = charA in ALPHA_SPECIAL_CODES ? ALPHA_SPECIAL_CODES[charA] : parseInt(charA, 36);
    
    if (twoChars.length == 1) {
      alphaEncoded += charAcode.toString(2).padStart(6, "0");
      continue;
    }
    
    charB = twoChars[1];
    charBcode = charB in ALPHA_SPECIAL_CODES ? ALPHA_SPECIAL_CODES[charB] : parseInt(charB, 36);
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

export { encodeData, breakIntoCodeblocks, DATA_BY_VERSION_AND_ECLEVEL };