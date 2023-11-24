// Some hardcoded stuff

import { splitString } from "./usedFunctions.js";

const QR_VERSION = 13;
const QR_ERROR_CORRECTION = "Q";
const TOTAL_DATA_BITS = 1952;

const CHAR_COUNT = {
  "0001": 12,
  "0010": 11,
  "0100": 16,
  "1000": 10
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



function getCharCount(textLength, mode){
  let binary = textLength.toString(2);
  
  return binary.padStart(CHAR_COUNT[mode], "0");
}

function encodeData(textToEncode){
  let enMode = getEncodingMode(textToEncode);
  let charCount = getCharCount(textToEncode.length, enMode);
  let encodedString = "";

  if (enMode == "0001"){
    // numeric
    let splittedData = splitString(textToEncode, 3);
    let threeDigits = ""
    let digitsInBinary = ""
    let amountToPad = 0
    for (let i = 0; i < splittedData.length; i++){
      threeDigits = splittedData[i];
      digitsInBinary = parseInt(threeDigits, 10).toString(2);

      // ugly stuff incoming
      if(threeDigits[0] == 0){
        if(threeDigits[1] == 0){
          amountToPad = 4;
        } else{
          amountToPad = 7;
        }  
      } else{
        amountToPad = 10;
      }
      encodedString += digitsInBinary.padStart(amountToPad, "0");   
    }
  }

  if (enMode == "0010"){
    // alphanumeric
    let splittedString = splitString(textToEncode, 2);

    let charA = "";
    let charB = "";
    let twoChars = "";
    let charAcode = 0;
    let charBcode = 0;

    for(let i = 0; i < splittedString.length; i++){
      twoChars = splittedString[i];

      
      charA = twoChars[0];
      charB = twoChars[1];
      charAcode = charA in ALPHA_SPECIAL_CODES ? ALPHA_SPECIAL_CODES[charA] : parseInt(charA, 36);
      charBcode = charB in ALPHA_SPECIAL_CODES ? ALPHA_SPECIAL_CODES[charB] : parseInt(charB, 36);
      if(twoChars.length == 1){
        encodedString += charAcode.toString(2).padStart(6, "0");
        continue;
      }

      var medSult = (45 * charAcode) + charBcode
      encodedString += medSult.toString(2).padStart(11, "0");
    }
  }

  if (enMode == "0100"){
    // byte
    for(let index = 0; index < textToEncode.length; index++){
      encodedString += textToEncode.charCodeAt(index).toString(2).padStart(8,"0");
    }
  }

  if (enMode == "1000"){
    // kanji, LOL
  }

  // adding terminator

  let encodedData = enMode + charCount + encodedString;
  let terminator = (TOTAL_DATA_BITS - encodedData.length < 4) ? TOTAL_DATA_BITS - encodedData.length : 4;
  encodedData = encodedData.padEnd(encodedData.length + terminator, "0");

  // making the length a multiple of 8

  // encodedData = encodedData + "111"

  if (encodedData.length % 8 != 0){
    let pad = 8 - ( encodedData.length % 8 );
    encodedData = encodedData.padEnd(encodedData.length + pad, "0");
  }

  // final padding 
  if (encodedData.length < TOTAL_DATA_BITS){
    encodedData = encodedData.padEnd(TOTAL_DATA_BITS, "1110110000010001");
  }

  return encodedData;
}


let url = "https://www.youtube.com/watch?v=FtutLA63Cp8"
let number = "40006090052010098006849819847979"
let alpha = "HELLO WORLD"

console.log(encodeData(alpha))
