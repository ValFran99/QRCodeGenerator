import { createMatrix, printMatrix } from "./matrixGenerator.js";
import { encodeData } from "./rawDataEncoding.js";

function maskFormula0(column, row){ return ((row + column) % 2) == 0; }

function maskFormula1(column, row){ return (row % 2) == 0; }

function maskFormula2(column, row){ return (column % 3) == 0; }

function maskFormula3(column, row){ return ((row + column) % 3) == 0; }

function maskFormula4(column, row){ return ((Math.floor(row / 2) + Math.floor(column / 3)) % 2) == 0; }

function maskFormula5(column, row){ return (((row * column) % 2) + ((row * column) % 3)) == 0; }

function maskFormula6(column, row){ return (( ((row * column) % 2) + ((row * column) % 3) ) % 2 ) == 0; }

function maskFormula7(column, row){ return (( ((row + column) % 2) + ((row * column) % 3) ) % 2) == 0; }

function applyMask(matrix, maskFormula){
  for(let row = 0; row < matrix.length; row++){
    for(let col = 0; col < matrix.length; col++){
      if(matrix[row][col][1] == "1"){
        continue;
      }
      if(maskFormula(col, row)){

        matrix[row][col][0] = (matrix[row][col][0] == "0") ? "1" : "0"

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

// Usable versions 3, 6, 7, 13, 20, 30
var VERSION_STRINGS = {
  7: "000111110010010100",
  13: "001101100001000111",
  20: "010100100110100110",
  30: "011110110101110101"
}

// console.log(createFormatString("Q", 7));
// console.log(createFormatString("L", 4));


// To do so i can at least test if it works
function fillWithFormatString(matrix, usedMask, ecLevel){
  let formatString = createFormatString(ecLevel, usedMask);
  
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
  let versionString = VERSION_STRINGS[version];
  let indexString = 0;

  // fills bottom left rectangle
  for(let indexCol = 0; indexCol < 6; indexCol++){
    for(let indexRow = matrix.length - 11; indexRow < matrix.length - 8; indexRow++){
      matrix[indexRow][indexCol] = versionString[indexString];
      matrix[indexCol][indexRow] = versionString[indexString];
      indexString++;
    }
  }

  // fills top rigth rectangle

}
var matrix = createMatrix(encodeData("hello world"), 13);

// console.log("seventh mask")

var matrixMask7 = applyMask(matrix, maskFormula7)
// printMatrix(matrixMask7)
fillWithFormatString(matrixMask7, 7, "Q");
fillWithVersionString(matrixMask7, 13);
printMatrix(matrixMask7)
// console.log("basic matrix")

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




