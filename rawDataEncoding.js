import { splitString } from "./usedFunctions.js";
import { createErrorCorrectionCodewords } from "./errorCorrection.js";
// Usable versions 3, 6, 7, 13, 20, 30
// const QR_VERSION = 13;
// const QR_ERROR_CORRECTION = "Q";
// For version 13 and error correction q
const TOTAL_DATA_BITS = 1952;
// for version 1 and error correction q is different

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
  let terminator = (TOTAL_DATA_BITS - encodedData.length < 4) ? TOTAL_DATA_BITS - encodedData.length : 4;
  encodedData = encodedData.padEnd(encodedData.length + terminator, "0");

  // making the length a multiple of 8

  if (encodedData.length % 8 != 0){
    let pad = 8 - ( encodedData.length % 8 );
    encodedData = encodedData.padEnd(encodedData.length + pad, "0");
  }

  // final padding 
  if (encodedData.length < TOTAL_DATA_BITS){
    encodedData = encodedData.padEnd(TOTAL_DATA_BITS, "1110110000010001");
  }

  let codeWords = breakIntoCodeblocks(encodedData);
  let ecCodeWords = createErrorCorrectionCodewords(codeWords);

  let finalMessage = interleaveCW(codeWords, 1, 7, 4, 21);

  finalMessage += interleaveCW(ecCodeWords, 1, 7, 4, 24);

  return finalMessage;
}

function interleaveCW(words, limitGroup, limitFstBlock, limitSecBlock, limitCodeWord){

  let group = 0;
  let block = 0;
  let codeWord = 0;

  let interleavedWords = "";

  while(true){
    // this thing should depend on the version and ec correction of the choose qr code, but fuck that
    if(group == limitGroup && block == limitSecBlock && codeWord == limitCodeWord){
      break;
    }
    if(group == limitGroup && block == limitSecBlock){
      codeWord++;
      group = 0;
      block = 0;
      continue;
    }

    let cw = words[group][block][codeWord];
    if (cw != undefined){
      interleavedWords += words[group][block][codeWord];
    }

    if(block == limitFstBlock){
      block = 0;
      group = 1;
      continue;
    }
    block++;

  }
  return interleavedWords;
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

function breakIntoCodeblocks(data){
  let codewords = splitString(data, 8);

  let codeBlocks = [[], []];
  let block = [];

  for (let i = 0; i < codewords.length; i++){
    if(codeBlocks[0].length < 8){
      block.push(codewords[i]);
      if(block.length == 20){
        codeBlocks[0].push(JSON.parse(JSON.stringify(block)));
        block = [];
      }
    } else{
      block.push(codewords[i]);
      if(block.length == 21){
        codeBlocks[1].push(JSON.parse(JSON.stringify(block)));
        block = [];
      }
    }
  }

  return codeBlocks;
}

// console.log(encodeData("HELLO WORLD"));

export { encodeData, breakIntoCodeblocks };