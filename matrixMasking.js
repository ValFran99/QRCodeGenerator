import { createMatrix, printMatrix } from "./matrixGenerator.js";
import { encodeData } from "./rawDataEncoding.js";

function maskFormula1(column, row){ return ((row + column) % 2) == 0; }

function maskFormula2(column, row){ return (row % 2) == 0; }

function maskFormula3(column, row){ return (column % 3) == 0; }

function maskFormula4(column, row){ return ((row + column) % 3) == 0; }

function maskFormula5(column, row){ return ((Math.floor(row / 2) + Math.floor(column / 3)) % 2) == 0; }

function maskFormula6(column, row){ return (((row * column) % 2) + ((row * column) % 3)) == 0; }

function maskFormula7(column, row){ return (( ((row * column) % 2) + ((row * column) % 3) ) % 2 ) == 0; }

function maskFormula8(column, row){ return (( ((row + column) % 2) + ((row * column) % 3) ) % 2) == 0; }

function applyMask(matrix, maskFormula){
  for(let row = 0; row < matrix.length; row++){
    for(let col = 0; col < matrix.length; col++){
      if(matrix[row][col][1] == "1"){
        continue;
      }
      if(maskFormula(col, row)){

        matrix[row][col][0] = (matrix[row][col][0] == 0) ? 1 : 0

      }
    }
  }
  return matrix;
}


function createFormatString(ecLevel, maskPattern){
  let ecLevelToBin = {
    "L": "01",
    "M": "00",
    "Q": "11",
    "H": "10"
  };

  let binaryMaskPattern = maskPattern.toString(2).padStart(3);
  let formatString = ecLevelToBin[ecLevel] + binaryMaskPattern;
  let ecFormatString = formatString;
  let generatorFormatString = "10100110111";
  // now we divide the format string by the generator n times
  
  // we add zeroes to the right to form a 15 bit string
  let regex = /(^0+)/g;
  ecFormatString = ecFormatString.padEnd(15, "0");
  // and remove the leading zeroes if necessary
  ecFormatString = ecFormatString.replace(regex, "");
  
  let tempGeneratorFormatString = "";
  
  while(ecFormatString.length > 11){
    tempGeneratorFormatString = generatorFormatString.padEnd(ecFormatString.length, "0");

    ecFormatString =  (parseInt(tempGeneratorFormatString, 2) ^ parseInt(ecFormatString, 2)).toString(2);

  }

  ecFormatString = (parseInt(generatorFormatString, 2) ^ parseInt(ecFormatString, 2)).toString(2);

  let finalFormatString = formatString + ecFormatString.padEnd(10);
  let lastXorString = "101010000010010";

  return (parseInt(finalFormatString, 2) ^ parseInt(lastXorString, 2)).toString(2).padStart(15, "0");
}

var VERSION_STRINGS = {
  7: "000111110010010100",
  13: "001101100001000111",
  20: "010100100110100110",
  30: "011110110101110101"
}

const FORMAT_STRINGS = {
  1: {
    "L": "111011111000100",
    "M": "101010000010010",
    "Q": "011010101011111",
    "H": "001011010001001",
  },
  2: {
    "L": "111001011110011",
    "M": "101000100100101",
    "Q": "011000001101000",
    "H": "001001110111110",
  },
  3: {
    "L": "111110110101010",
    "M": "101111001111100",
    "Q": "011111100110001",
    "H": "001110011100111",
  },
  4: {
    "L": "111100010011101",
    "M": "101101101001011",
    "Q": "011101000000110",
    "H": "001100111010000",
  },
  5: {
    "L": "110011000101111",
    "M": "100010111111001",
    "Q": "010010010110100",
    "H": "000011101100010"
  },
  6: {
    "L": "110001100011000",
    "M": "100000011001110",
    "Q": "010000110000011",
    "H": "000001001010101"
  },
  7: {
    "L": "110110001000001",
    "M": "100111110010111",
    "Q": "010111011011010",
    "H": "000110100001100"
  },
  8: {
    "L": "110100101110110",
    "M": "100101010100000",
    "Q": "010101111101101",
    "H": "000100000111011"
  }
}

// console.log(createFormatString("Q", 7));
// console.log(createFormatString("L", 4));


// To do so i can at least test if it works
function fillWithFormatString(matrix, usedMask, ecLevel){
  let formatString = FORMAT_STRINGS[usedMask][ecLevel];
  
  var indexStringStart = 0;
  var indexStringMid = 6;
  var indexStringEnd = 14;

  // fill top left finder
  for(let indexMatrix = 0; indexMatrix < 9; indexMatrix++){
    if(indexMatrix == 6){
      continue;
    }
    matrix[8][indexMatrix] = [formatString[indexStringStart], 1];
    matrix[indexMatrix][8] = [formatString[indexStringEnd], 1];
    indexStringStart++;
    indexStringEnd--;
  }

  // fill the bottom left pattern
  for(let i = matrix.length - 7; i < matrix.length; i++){
    matrix[i][8] = [formatString[indexStringMid], 1];
    indexStringMid--;
  }
  indexStringStart = 7
  // and the top right pattern
  for(let i = matrix.length - 8; i < matrix.length; i++){
    matrix[8][i] = [formatString[indexStringStart], 1];
    indexStringStart++;
  }
  
}

function fillWithVersionString(matrix, version){
  if(version < 7){
    return
  }
  let versionString = VERSION_STRINGS[version];
  let indexString = versionString.length - 1;

  // fills bottom left rectangle
  for(let indexCol = 0; indexCol < 6; indexCol++){
    for(let indexRow = matrix.length - 11; indexRow < matrix.length - 8; indexRow++){
      matrix[indexRow][indexCol] = versionString[indexString];
      matrix[indexCol][indexRow] = versionString[indexString];
      indexString--;
    }
  }

  // fills top rigth rectangle
}

function applyEveryMask(matrix){

  const arrayOfFormulas = [maskFormula1, maskFormula2, maskFormula3, maskFormula4, maskFormula5, maskFormula6, maskFormula7, maskFormula8];
  const everyMask = [];

  for(let i = 0; i < arrayOfFormulas.length; i++){
    everyMask.push(applyMask(JSON.parse(JSON.stringify(matrix)), arrayOfFormulas[i]));
  }

  return everyMask
}

function checkRow(stackRow, accRow, matrixValue){
  if(stackRow.length == 0){
    stackRow.push(matrixValue);
    return;
  }

  if(stackRow[stackRow.length - 1] == matrixValue){
    stackRow.push(matrixValue);
  }
  else{
    stackRow.length = 0;
    stackRow.push(matrixValue)
  }

  if(stackRow.length == 5){
    accRow[0] += 3;
  }
  if(stackRow.length > 5){
    accRow[0] += 1;
  }
}

function checkCol(stackCol, accCol, matrixValue){
  if(stackCol.length == 0){
    stackCol.push(matrixValue);
    return;
  }

  if(stackCol[stackCol.length - 1] == matrixValue){
    stackCol.push(matrixValue);
  }
  else{
    stackCol.length = 0;
    stackCol.push(matrixValue)
  }

  if(stackCol.length == 5){
    accCol[0] += 3;
  }
  if(stackCol.length > 5){
    accCol[0] += 1;
  }
}

function calculateAllPenaltyRules(maskedMatrix){

  let penaltyAcc = 0;
  let stackCol = [];
  let stackRow = [];
  // this is so ugly, i cant believe i miss pointers lol
  let accCol = [0];
  let accRow = [0];
  let matrixSize = maskedMatrix.length;

  // first rule and also calculate # of black modules for the 4th rule
  // Its pretty ugly bc im trying to do everything in one pass
  let amountOfBlackModules = 0;

  for(let row = 0; row < maskedMatrix.length; row++){
    for(let col = 0; col < maskedMatrix.length; col++){
      if(maskedMatrix[row][col][0] == 1){
        amountOfBlackModules++;
      }
      checkCol(stackCol, accCol, maskedMatrix[col][row][0]);
      checkRow(stackRow, accRow, maskedMatrix[row][col][0]);
    }
  }
  penaltyAcc = accCol[0] + accRow[0];


  let topLeftValue;
  // second rule
  for(let row = 0; row < maskedMatrix.length; row++){
    for(let col = 0; col < maskedMatrix.length; col++){
      if(col + 1 >= matrixSize || row + 1 >= matrixSize){
        continue;
      }
      topLeftValue = maskedMatrix[row][col][0];
      if((topLeftValue == maskedMatrix[row+1][col][0]) && (topLeftValue == maskedMatrix[row][col+1][0]) && (topLeftValue == maskedMatrix[row+1][col+1][0])){
        penaltyAcc += 3;
      }
    }

  }
  
  // third rule
  // Its pretty ugly bc im trying to do everything in one pass
  let pattern1 = "10111010000";
  let pattern2 = "00001011101";
  let flagPtrn1Row = true;
  let flagPtrn2Row = true;
  let flagPtrn1Col = true;
  let flagPtrn2Col = true;

  for(let row = 0; row < (maskedMatrix.length - 11); row++){
    for(let col = 0; col < (maskedMatrix.length - 11); col++){
      for(let patternIndex = 0; patternIndex < 11; patternIndex++){
        if(flagPtrn1Row){
          flagPtrn1Row = maskedMatrix[row][col + patternIndex][0] == pattern1[patternIndex];
        }

        if(flagPtrn2Row){
          flagPtrn2Row = maskedMatrix[row][col + patternIndex][0] == pattern2[patternIndex];
        }

        if(flagPtrn1Col){
          flagPtrn1Col = maskedMatrix[row + patternIndex][col][0] == pattern1[patternIndex];
        }

        if(flagPtrn2Col){
          flagPtrn2Col = maskedMatrix[row + patternIndex][col][0] == pattern2[patternIndex];
        }

        if(!flagPtrn1Row && !flagPtrn2Row && !flagPtrn1Col && !flagPtrn2Col){
          break;
        }
      }
      if(flagPtrn1Row){
        penaltyAcc += 40;
      }
      if(flagPtrn2Row){
        penaltyAcc += 40;
      }
      if(flagPtrn1Col){
        penaltyAcc += 40;
      }
      if(flagPtrn2Col){
        penaltyAcc += 40;
      }
      flagPtrn1Row = flagPtrn2Row = flagPtrn1Col = flagPtrn2Col = true;
    }
  }


  // fourth rule

  return penaltyAcc;

}

function calculatePenaltyToEveryMask(matrix){
  
  let everyMask = applyEveryMask(matrix);
  let everyPenalty = [];

  for(let maskIndex = 0; maskIndex < everyMask.length; maskIndex++){
    console.log("Calculating penalty for this mask: ")
    printMatrix(everyMask[maskIndex]);
    everyPenalty.push(calculateAllPenaltyRules(everyMask[maskIndex]))
  }
  console.log(everyPenalty)
  return everyPenalty
}

// this should go to another file really
function finishMatrix(stringToEncode, maskToApply, appliedMask, version, ecLevel){

  let matrix = createMatrix(encodeData(stringToEncode, version, ecLevel), version);
  // printMatrix(matrix)
  // fillWithFormatString(matrix, appliedMask, ecLevel);
  calculatePenaltyToEveryMask(matrix)
  applyEveryMask(matrix)



  let maskedMatrix = applyMask(JSON.parse(JSON.stringify(matrix)), maskToApply)

  // console.log("Mask 5")
  // console.log(maskedMatrix)
  // console.log("The normal matrix")
  // console.log(matrix)



  fillWithFormatString(maskedMatrix, appliedMask, ecLevel);
  
  
  if(version >= 7){
    fillWithVersionString(maskedMatrix, version);
    // fillWithVersionString(matrix, version);
  }
  // printMatrix(matrix)
  // return ""
  return maskedMatrix
}

// function addWhiteSpace(matrix){
//   console.log(matrix)
// }

// let matrix = createMatrix(encodeData("https://www.youtube.com/watch?v=YEXYVk6wZJo", 5, "Q"), 5);
// printMatrix(matrix)

// console.log("seventh mask")

var sevenLTest = "Hey guys, did you know that in terms of male human and female Pokémon breeding, Vaporeon is the most compatible Pokémon for humans?"
var testStringV13 = "Hey guys, did you know that in terms of male human and female Pokemon breeding"
var testStringV5 = "https://www.youtube.com/watch?v=sRgUrKWiXQs"
var testStringV1 = "hello world"
// var testStringV1 = "THIS THING IN ALPHANUMERIC SHOULD WORK CORRECTLY BC REASONS"
var masked = finishMatrix(testStringV1, maskFormula5, 5, 1, "L")

// console.log("basic matrix")

printMatrix(masked)
// addWhiteSpace(matrixMask)
// printMatrix(matrix)



// var matrixCopy = JSON.parse(JSON.stringify(matrix))

// console.log("first mask")

// var mask0 = applyMask(matrixCopy, maskFormula0)
// printMatrix(mask0)

// console.log("second mask")

// var mask1 = applyMask(matrixCopy, maskFormula1)
// printMatrix(mask1)

// console.log("third mask")

// var mask2 = applyMask(matrixCopy, maskFormula2)
// printMatrix(mask2)

// console.log("fourth mask")

// var mask3 = applyMask(matrixCopy, maskFormula3)
// printMatrix(mask3)

// console.log("fifth mask")

// var mask4 = applyMask(matrixCopy, maskFormula4)
// printMatrix(mask4)

// console.log("sixth mask")

// var mask5 = applyMask(matrixCopy, maskFormula5)
// printMatrix(mask5)


// console.log("eigth mask")

// var mask7 = applyMask(matrixCopy, maskFormula7)
// printMatrix(mask7)




