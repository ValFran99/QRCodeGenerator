/*
  Splits a string into an array of strings with length 'n'
*/
function splitString(data, n){
  let splitted = []
  let inter = []
  for(let i = 0; i < data.length; i++){
    inter.push(data[i])
    if((i + 1) % n == 0){

      splitted.push(inter.join(""))
      inter = []
    }
  }
  if (inter.length != 0){
    splitted.push(inter.join(""))
  }
  return splitted
}

/*
  Used one time to generate the fields that are declared in 'errorCorrection.js'
*/
function generateGaloisField(n, xorWith){
  
  let exponentToNumber = new Array(n);
  let numberToExponent = new Array(n);
  let midNumber = 0;
  let result = 0;
  exponentToNumber[0] = 1;
  numberToExponent[0] = 0;
  
  for (let i = 1; i < n; i++){
    midNumber = exponentToNumber[i-1]*2;
    result = (midNumber > 255) ? midNumber ^ xorWith : midNumber;
    exponentToNumber[i] = result;
    numberToExponent[result] = i;
  }
  numberToExponent[1] = 0;

  return [exponentToNumber, numberToExponent];
}

function multiplyWithGaloisFields(numberA, numberB, galoisField){

  let exponentToNumber = galoisField[0];
  let numberToExponent = galoisField[1];

  let expA = numberToExponent[numberA];
  let expB = numberToExponent[numberB];

  let midSult = expA + expB;

  let resultExp = (midSult > 255) ? midSult % 255 : midSult; 

  return exponentToNumber[resultExp];

}

function convertToNumbers(polyInExponents, exponentToNumber){
  for(let i = 0; i < polyInExponents.length; i++){
    if(polyInExponents[i] == -1){
      continue;
    }
    polyInExponents[i] = exponentToNumber[polyInExponents[i]];
  }
  return polyInExponents;
}

function convertToExponents(polyInNumbers, numberToExponent){
  for(let i = 0; i < polyInNumbers.length; i++){
    if(polyInNumbers[i] == -1){
      continue;
    }
    polyInNumbers[i] = numberToExponent[polyInNumbers[i]];
  }
  return polyInNumbers;
}

export { splitString, generateGaloisField, multiplyWithGaloisFields, convertToNumbers, convertToExponents};