// Some hardcoded stuff

import { splitString } from "./usedFunctions.js";

const QR_VERSION = 13;
const QR_ERROR_CORRECTION = "Q";

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
    var threeDigits = ""
    var digitsInBinary = ""
    var amountToPad = 0
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

    // more ugly stuff

    let charA = "";
    let charB = "";
    let twoChars = "";
    let charAcode = 0;
    let charBcode = 0;

    for(let i = 0; i < splittedString.length; i++){
      twoChars = splittedString[i];

      
      charA = twoChars[0];

      if(twoChars.length == 1){
        charAcode = charA in ALPHA_SPECIAL_CODES ? ALPHA_SPECIAL_CODES[charA] : parseInt(charA, 36);
        encodedString += " " + charAcode.toString(2).padStart(6, "0") + " ";
        continue;
      }

      charB = twoChars[1];
      if(!(charA in ALPHA_SPECIAL_CODES)){
        charAcode = parseInt(charA, 36);
      } else{
        charAcode = ALPHA_SPECIAL_CODES[charA];
      }
      if(!(charB in ALPHA_SPECIAL_CODES)){
        charBcode = parseInt(charB, 36);
      } else{
        charBcode = ALPHA_SPECIAL_CODES[charB];
      }
      console.log(charB + charBcode)
      var medSult = (45 * charAcode) + charBcode
      encodedString += medSult.toString(2) + " ";
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

  
  

  return enMode + charCount + encodedString;

}

let url = "https://www.youtube.com/watch?v=FtutLA63Cp8"
let number = "40006090052010098006849819847979"
let alpha = "HELLO WORLD"

console.log(encodeData(alpha))
