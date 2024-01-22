import { calculatePenaltyToEveryMask, applyMask, fillWithFormatString, fillWithVersionString, ARRAY_OF_FORMULAS } from "./matrixMasking.js";
import { createMatrix, printMatrix } from "./matrixGenerator.js";
import { encodeData } from "./rawDataEncoding.js";



function createQRCode(element){
  let stringToEncode = element.children[1].value;
  let ecLevel = element.children[3].value;
  let version = element.children[5].value;
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

  createCanvas(maskedMatrix);
  return maskedMatrix;
}

function getColorIndicesForCoord(x, y, width, offset){
  const red = (y * (width * 4) + x * 4) + offset;
  return [red, red + 1, red + 2, red + 3];
}

function createCanvas(qrCode){

  let canvas = document.getElementById("qrCanvas");

  canvas.height = canvas.width = qrCode.length + 8;

  let context = canvas.getContext("2d");

  let canvasImageData = context.getImageData(0, 0, canvas.width, canvas.width);
  let canvasPixelArray = canvasImageData.data;
  let colorIndices;
  let redIndex, greenIndex, blueIndex, alphaIndex;
  let valueToSet;

  for(let col = 0; col < qrCode.length; col++){
    for(let row = 0; row < qrCode.length; row++){
      colorIndices = getColorIndicesForCoord(row, col, canvas.width, canvas.width * 16 + 16);
      [redIndex, greenIndex, blueIndex, alphaIndex] = colorIndices;
      
      valueToSet = (qrCode[col][row][0] == 1)? 0 : 255;

      canvasPixelArray[redIndex] = canvasPixelArray[greenIndex] = canvasPixelArray[blueIndex] = valueToSet;
      canvasPixelArray[alphaIndex] = 255;
    }
  }
  if(qrCode.length < 93){
    canvas.width = canvas.height = Math.floor(window.innerHeight / 2);
  } else if(qrCode.length < 157){
    canvas.width = canvas.height = Math.floor(window.innerHeight / 1.5);
  } else{
    canvas.width = canvas.height = Math.floor(window.innerHeight / 1.2);
  }

  // stackoverflow my beloved
  // https://stackoverflow.com/questions/3448347/how-to-scale-an-imagedata-in-html-canvas (last answer)
  createImageBitmap(canvasImageData).then((data) => {
    context.imageSmoothingEnabled = false; // keep pixel perfect
    context.drawImage(data, 0, 0, canvas.width, canvas.height)
  })

}

function testLocal(stringToEncode, version, ecLevel){
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

export { createQRCode };

// var sevenLTest = "Hey guys, did you know that in terms of male human and female Pokemon breeding, Vaporeon is the most compatible Pokémon for humans?"
// var testStringV13 = "Hey guys, did you know that in terms of male human and female Pokemon breeding"
// var testStringV5 = "www.youtube.com/watch?v=sRgUrKWiXQs"
// var testStringV1 = "hello world"

// var masked = testLocal(testStringV1, 1, "L")

// printMatrix(masked)