import { calculatePenaltyToEveryMask, applyMask, fillWithFormatString, fillWithVersionString, ARRAY_OF_FORMULAS } from "./matrixMasking.js";
import { createMatrix, printMatrix } from "./matrixGenerator.js";
import { encodeData } from "./rawDataEncoding.js";

var VERSION_CAPACITIES = {};

fetch("./scripts/versionCapacities.json")
    .then((response) => response.json())
    .then((json) => VERSION_CAPACITIES = json)

function fillWithWhiteSpace(matrix){
  let matrixLength = matrix.length;
  let whiteArr;
  for(let i = 0; i < matrix.length; i++){
    for(let j = 0; j < 4; j++){
      matrix[i].push([0, 0])
      matrix[i].unshift([0, 0]);
    }
  }
  for(let i = 0; i < 4; i++){
    whiteArr = new Array(matrixLength + 8).fill([0, 1]);
    matrix.unshift(JSON.parse(JSON.stringify(whiteArr)));
    matrix.push(JSON.parse(JSON.stringify(whiteArr)));
  }
}

function getColorIndicesForCoord(x, y, width, offset){
  const red = (y * (width * 4) + x * 4) + offset;
  return [red, red + 1, red + 2, red + 3];
}

function createCanvas(qrCode, backgroundColor, pixelDataColor, version){

  let canvas = document.getElementById("qrCanvas");

  canvas.height = canvas.width = qrCode.length;

  let context = canvas.getContext("2d");

  let canvasImageData = context.getImageData(0, 0, canvas.width, canvas.width);
  let canvasPixelArray = canvasImageData.data;
  let colorIndices;
  let redIndex, greenIndex, blueIndex, alphaIndex;
  let colors;

  for(let col = 0; col < qrCode.length; col++){
    for(let row = 0; row < qrCode.length; row++){
      colorIndices = getColorIndicesForCoord(row, col, canvas.width, 0);
      [redIndex, greenIndex, blueIndex, alphaIndex] = colorIndices;
      
      colors = (qrCode[col][row][0] == 1)? pixelDataColor : backgroundColor;
      canvasPixelArray[redIndex] = colors[0];
      canvasPixelArray[greenIndex] = colors[1];
      canvasPixelArray[blueIndex] = colors[2];

      canvasPixelArray[alphaIndex] = 255;
    }
  }

  // filling the center with white to make space for the logos
  if(version != 1){
    let center = Math.floor(qrCode.length / 2);
    let logoLengthInPixels = Math.floor(qrCode.length / 4);
    let topLeftCoord = center - Math.floor(logoLengthInPixels / 2);
    
    for(let i = topLeftCoord; i < (center + Math.floor(logoLengthInPixels / 2) + 1); i++){
      for(let j = topLeftCoord; j < (center + Math.floor(logoLengthInPixels / 2) + 1); j++){
        colorIndices = getColorIndicesForCoord(j, i, canvas.width, 0);
        [redIndex, greenIndex, blueIndex, alphaIndex] = colorIndices;
        canvasPixelArray[redIndex] = backgroundColor[0];
        canvasPixelArray[greenIndex] = backgroundColor[1];
        canvasPixelArray[blueIndex] = backgroundColor[2];
        canvasPixelArray[alphaIndex] = 255;
      }
    }
  }


  let logo = document.getElementById("placeholderLogo");

  if(qrCode.length < 93){
    canvas.width = canvas.height = Math.floor(window.innerHeight / 2);
  } else if(qrCode.length < 157){
    canvas.width = canvas.height = Math.floor(window.innerHeight / 1.5);
  } else{
    canvas.width = canvas.height = Math.floor(window.innerHeight / 1.1);
  }
  
  let logoLengthInCanvas = Math.floor(canvas.width / 4);
  let centerCanvas = Math.floor(canvas.width / 2);
  let topLeftInCanvas = centerCanvas - Math.floor(logoLengthInCanvas / 2)
  
  // stackoverflow my beloved
  // https://stackoverflow.com/questions/3448347/how-to-scale-an-imagedata-in-html-canvas (last answer)
  createImageBitmap(canvasImageData).then((data) => {
    context.imageSmoothingEnabled = false; // keep pixel perfect
    context.drawImage(data, 0, 0, canvas.width, canvas.height)
    if(version != 1){
      context.drawImage(logo, topLeftInCanvas + 1, topLeftInCanvas + 1, logoLengthInCanvas - 5, logoLengthInCanvas - 5);
    }
  })


  // this should go in another function, but idk
  setTimeout(() => {
    var link = document.getElementById("downloadLink");
    link.style.display = "block"
    link.download = 'qrCode.png';
    link.href = canvas.toDataURL();
    document.getElementById("mainDiv").appendChild(link)
  }, 100);
  

}

function loadLogo(element){
  const reader = new FileReader();
  var image;

  reader.onload = (event) => {
    image = document.getElementById("placeholderLogo");
    image.src = event.target.result;
    image.style.display = "block";
    image.style.visibility = "visible";
  }

  reader.readAsDataURL(element.children[0].files[0])
} 

function updateCanvas(canvas){

}



function getIndex(textToEncode){
  let regexNumeric = /^\d+$/;
  let regexAlphanumeric = /^[\dA-Z $%*+\-./:]*$/;
  let regexByte = /^[\x00-\xff]*$/;
  let regexKanji = /^[\p{Script_Extensions=Han}\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}]*$/u;
  if (regexNumeric.test(textToEncode)){
    return 0;
  }
  
  if (regexAlphanumeric.test(textToEncode)){
    return 1;
  }
  
  if (regexByte.test(textToEncode)){
    return 2;
  }
  
  if (regexKanji.test(textToEncode)){
    return 3;
  } 
  return "0111";
}

function calculateVersion(textLength, ecLevel, index){

  for(const version in VERSION_CAPACITIES){
    if(!(textLength > VERSION_CAPACITIES[version][ecLevel][index])){
      return version;
    }
  }
  return 40;
}


function createQRCode(element){
  let stringToEncode = element.children[1].value;
  let ecLevel = element.children[3].value;
  // let version = element.children[5].value;
  let version = calculateVersion(stringToEncode.length, ecLevel, getIndex(stringToEncode));
  let pixelColorHex = element.children[7].value;
  let backColorHex = element.children[9].value;
  let backgroundColor = [
    parseInt(backColorHex.substring(1, 3), 16), 
    parseInt(backColorHex.substring(3, 5), 16), 
    parseInt(backColorHex.substring(5, 7), 16)
  ];
  let pixelColor = [
    parseInt(pixelColorHex.substring(1, 3), 16), 
    parseInt(pixelColorHex.substring(3, 5), 16), 
    parseInt(pixelColorHex.substring(5, 7), 16)
  ];
  _createQRCode(stringToEncode, version, ecLevel, backgroundColor, pixelColor)
}

function _createQRCode(stringToEncode, version, ecLevel, backgroundColor, pixelColor){
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

  fillWithWhiteSpace(maskedMatrix);

  createCanvas(maskedMatrix, backgroundColor, pixelColor, version); 

  return maskedMatrix;
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

export { createQRCode, loadLogo };

// var sevenLTest = "Hey guys, did you know that in terms of male human and female Pokemon breeding, Vaporeon is the most compatible Pokémon for humans?"
// var testStringV13 = "Hey guys, did you know that in terms of male human and female Pokemon breeding"
// var testStringV5 = "www.youtube.com/watch?v=sRgUrKWiXQs"
// var testStringV1 = "hello world"

// var masked = testLocal(testStringV1, 1, "L")

// printMatrix(masked)