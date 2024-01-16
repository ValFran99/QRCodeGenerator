import { calculatePenaltyToEveryMask, applyMask, fillWithFormatString, fillWithVersionString, ARRAY_OF_FORMULAS } from "./matrixMasking.js";
import { createMatrix, printMatrix } from "./matrixGenerator.js";
import { encodeData } from "./rawDataEncoding.js";

function createQRCode(stringToEncode, version, ecLevel){

  let matrix = createMatrix(encodeData(stringToEncode, version, ecLevel), version);
  let everyPenalty = calculatePenaltyToEveryMask(matrix);
  let minPenalty = Math.min(...everyPenalty);
  let indexOfMin = everyPenalty.indexOf(minPenalty);
  let appliedMask = indexOfMin + 1;

  let maskedMatrix = applyMask(matrix, ARRAY_OF_FORMULAS[indexOfMin]);
  fillWithFormatString(maskedMatrix, appliedMask, ecLevel);
  
  
  if(version >= 7){
    fillWithVersionString(maskedMatrix, version);
  }

  return maskedMatrix
}


var sevenLTest = "Hey guys, did you know that in terms of male human and female Pokemon breeding, Vaporeon is the most compatible Pokémon for humans?"
var testStringV13 = "Hey guys, did you know that in terms of male human and female Pokemon breeding"
var testStringV5 = "www.youtube.com/watch?v=sRgUrKWiXQs"
var testStringV1 = "hello world"

var masked = createQRCode(testStringV5, 5, "Q")

printMatrix(masked)