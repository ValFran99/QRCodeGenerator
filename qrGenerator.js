// Some hardcoding stuff

QR_VERSION = 13
QR_ERROR_CORRECTION = "Q"


function getEncodingMode(textToEncode){
  regexNumeric = /^\d+$/;
  regexAlphanumeric = /^[\dA-Z $%*+\-./:]*$/;
  regexByte = /^[\x00-\xff]*$/;
  regexKanji = /^[\p{Script_Extensions=Han}\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}]*$/u;
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

CHAR_COUNT = {
  "0001": 12,
  "0010": 11,
  "0100": 16,
  "1000": 10
}

function getCharCount(textLength, mode){
  binary = textLength.toString(2);
  
  return binary.padStart(CHAR_COUNT[mode], "0");
}

function encodeData(textToEncode){
  enMode = getEncodingMode(textToEncode);
  charCount = getCharCount(textToEncode.length, enMode);
  encodedString = ""
  for(let index = 0; index < textToEncode.length; index++){
    encodedString += textToEncode.charCodeAt(index).toString(2).padStart(8,"0")
  }

  return enMode + charCount + encodedString

}

url = "Hello, world!"

console.log(encodeData(url))
