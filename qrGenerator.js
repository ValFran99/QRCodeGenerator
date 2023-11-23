function getEncodingMode(textToEncode){
  regexNumeric = /^\d+$/;
  regexAlphanumeric = /^[\dA-Z $%*+\-./:]*$/;
  regexByte = /^[\x00-\xff]*$/;
  regexKanji = /^[\p{Script_Extensions=Han}\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}]*$/u;
  if (regexNumeric.test(textToEncode)){
    return 
  }
  
  if (regexAlphanumeric.test(textToEncode)){
    return 
  }
  
  if (regexByte.test(textToEncode)){
    return 
  }
  
  if (regexKanji.test(textToEncode)){
    return 
  } 
}

