// Some hardcoded stuff

import { splitString } from "./usedFunctions.js";

const QR_VERSION = 13;
const QR_ERROR_CORRECTION = "Q";


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

const CHAR_COUNT = {
  "0001": 12,
  "0010": 11,
  "0100": 16,
  "1000": 10
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
    // tengo que partir esto en grupos de 3
    let splittedData = splitString(textToEncode)
    console.log(splittedData)
  }

  if (enMode == "0010"){
    // alphanumeric
  }

  if (enMode == "0100"){
    // byte
    for(let index = 0; index < textToEncode.length; index++){
      encodedString += textToEncode.charCodeAt(index).toString(2).padStart(8,"0");
    }
  }

  if (enMode == "1000"){
    // kanji
  }

  
  

  return enMode + charCount + encodedString;

}

let url = "https://www.youtube.com/watch?v=FtutLA63Cp8"
let number = "4006090052010098006849819847979"

console.log(encodeData(number))
