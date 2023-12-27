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

// Usando la mask 7

function createFormatString(ecLevel, maskPattern){
  let ecLevelToBin = {
    "L": "01",
    "M": "00",
    "Q": "11",
    "H": "10"
  };
  console.log(ecLevelToBin[ecLevel]);

  let binaryMaskPattern = maskPattern.toString(2).padStart(3);
  let formatString = ecLevelToBin[ecLevel] + binaryMaskPattern;
  console.log("init formatString: " + formatString);
  let generatorFormatString = "10100110111";
  // now we divide the format string by the generator n times
  
  // we add zeroes to the right to form a 15 bit string
  let regex = /(^0+)/g;
  formatString = formatString.padEnd(15, "0");
  // and remove the leading zeroes if necessary
  console.log(formatString.search(regex));
  formatString = formatString.replace(regex, "");
  
  
  console.log("formatString now before loop: " + formatString);
  let tempGeneratorFormatString = "";
  console.log("generatorString before loop:  " + generatorFormatString);
  

  while(formatString.length > 11){
    console.log(formatString.length)
    tempGeneratorFormatString = generatorFormatString.padEnd(formatString.length, "0");

    console.log("im xoring these generator: " + tempGeneratorFormatString);
    console.log("and this formatString:     " + formatString);
    formatString =  (parseInt(tempGeneratorFormatString, 2) ^ parseInt(formatString, 2)).toString(2);
    console.log("resulting in: " + formatString);

  }

  console.log("im xoring these generator: " + generatorFormatString);
  console.log("and this formatString:     " + formatString);

  formatString = (parseInt(generatorFormatString, 2) ^ parseInt(formatString, 2)).toString(2);
  return formatString;
}

console.log(createFormatString("Q", 7));
console.log(createFormatString("L", 4));
// var matrix = createMatrix(encodeData("https://www.youtube.com/watch?v=1daMpenuJ7o"), 13);

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

// console.log("seventh mask")

// var mask6 = applyMask(matrixCopy, maskFormula6)
// printMatrix(mask6)

// console.log("eigth mask")

// var mask7 = applyMask(matrixCopy, maskFormula7)
// printMatrix(mask7)




