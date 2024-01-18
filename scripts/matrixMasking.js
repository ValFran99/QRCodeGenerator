function maskFormula1(column, row){ return ((row + column) % 2) == 0; }

function maskFormula2(column, row){ return (row % 2) == 0; }

function maskFormula3(column, row){ return (column % 3) == 0; }

function maskFormula4(column, row){ return ((row + column) % 3) == 0; }

function maskFormula5(column, row){ return ((Math.floor(row / 2) + Math.floor(column / 3)) % 2) == 0; }

function maskFormula6(column, row){ return (((row * column) % 2) + ((row * column) % 3)) == 0; }

function maskFormula7(column, row){ return (( ((row * column) % 2) + ((row * column) % 3) ) % 2 ) == 0; }

function maskFormula8(column, row){ return (( ((row + column) % 2) + ((row * column) % 3) ) % 2) == 0; }

const ARRAY_OF_FORMULAS = [maskFormula1, maskFormula2, maskFormula3, maskFormula4, maskFormula5, maskFormula6, maskFormula7, maskFormula8];

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

var VERSION_STRINGS = {
  7: "000111110010010100",
  9: "001001101010011001",
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
}

function applyEveryMask(matrix){

  const everyMask = [];

  for(let i = 0; i < ARRAY_OF_FORMULAS.length; i++){
    everyMask.push(applyMask(JSON.parse(JSON.stringify(matrix)), ARRAY_OF_FORMULAS[i]));
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
  // man i miss pointers
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
  // same, trying to do everything in one pass
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
  let allModules = maskedMatrix.length * maskedMatrix.length;
  let blackPercentage = Math.floor((amountOfBlackModules / allModules) * 100);
  let previousMultiple = blackPercentage;
  let nextMultiple = blackPercentage; 


  // I need to get the next and previous multiple of 5 of the percentage
  if(blackPercentage % 5 == 0){
    nextMultiple = blackPercentage + 5;
  } else{
    while(previousMultiple % 5 != 0){
      previousMultiple--;
    }
    while(nextMultiple % 5 != 0){
      nextMultiple++;
    }
  }

  let absPrevious = Math.abs(previousMultiple - 50);
  let absNext = Math.abs(nextMultiple - 50);

  absPrevious = absPrevious / 5;
  absNext = absNext / 5;
  if(absPrevious < absNext){
    penaltyAcc += (absPrevious * 10);
  } else{
    penaltyAcc += (absNext * 10);
  }

  return penaltyAcc;

}

function calculatePenaltyToEveryMask(matrix){
  
  let everyMask = applyEveryMask(matrix);
  let everyPenalty = [];

  for(let maskIndex = 0; maskIndex < everyMask.length; maskIndex++){
    everyPenalty.push(calculateAllPenaltyRules(everyMask[maskIndex]))
  }

  return everyPenalty
}

export { calculatePenaltyToEveryMask, applyMask, fillWithFormatString, fillWithVersionString, ARRAY_OF_FORMULAS };