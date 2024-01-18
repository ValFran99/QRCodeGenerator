import { calculatePenaltyToEveryMask, applyMask, fillWithFormatString, fillWithVersionString, ARRAY_OF_FORMULAS } from "./matrixMasking.js";
import { createMatrix, printMatrix } from "./matrixGenerator.js";
import { encodeData } from "./rawDataEncoding.js";



function createQRCode(element){
  // console.log("Placeholder")
  // console.log(element.children);
  let stringToEncode = element.children[1].value;
  let ecLevel = element.children[3].value;
  let version = element.children[5].value;
  // console.log(version)
  _createQRCode(stringToEncode, version, ecLevel)
}

function _createQRCode(stringToEncode, version, ecLevel){
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

  // console.log("All created boss")
  drawCanvas(maskedMatrix);
  return maskedMatrix;
}

function drawCanvas(qrCode){
  let canvas;
  if(document.getElementById("qrCanvas") == undefined){
    canvas = document.createElement("canvas");
    canvas.id = "qrCanvas";
    canvas.height = canvas.width = qrCode.length + 8;
    document.getElementById("mainDiv").appendChild(canvas);
  } else{
    canvas = document.getElementById("qrCanvas");
  }
}

export { createQRCode };

// var sevenLTest = "Hey guys, did you know that in terms of male human and female Pokemon breeding, Vaporeon is the most compatible Pokémon for humans?"
// var testStringV13 = "Hey guys, did you know that in terms of male human and female Pokemon breeding"
// var testStringV5 = "www.youtube.com/watch?v=sRgUrKWiXQs"
// var testStringV1 = "hello world"

// var masked = _createQRCode(testStringV1, 5, "L")

// printMatrix(masked)