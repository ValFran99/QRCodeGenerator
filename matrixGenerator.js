import { encodeData } from "./rawDataEncoding.js";


var ALIGNMENT_PATTERN_CENTER_COORDS = {
  5: [6, 30],
  13: [6, 34, 62]
}


function calculateSizeByVersion(versionNumber){
  return (((versionNumber - 1) * 4) + 21);
}

function addFinderPatterns(matrix, topLeftCoords){

  let finderPattern = [
    [[0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1]],
    [[0, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [0, 1]],
    [[0, 1], [1, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [1, 1], [0, 1]],
    [[0, 1], [1, 1], [0, 1], [1, 1], [1, 1], [1, 1], [0, 1], [1, 1], [0, 1]],
    [[0, 1], [1, 1], [0, 1], [1, 1], [1, 1], [1, 1], [0, 1], [1, 1], [0, 1]],
    [[0, 1], [1, 1], [0, 1], [1, 1], [1, 1], [1, 1], [0, 1], [1, 1], [0, 1]],
    [[0, 1], [1, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [1, 1], [0, 1]],
    [[0, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [0, 1]],
    [[0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1]]
  ]

  // console.log(finderPattern)

  let startX = topLeftCoords[0];
  let startY = topLeftCoords[1];

  let relativeX = 0;
  let relativeY = 0;

  for(let finderCol = 0; finderCol < finderPattern.length; finderCol++){
    for(let finderRow = 0; finderRow < finderPattern.length; finderRow++){

      relativeX = startX + finderCol - 1
      relativeY = startY + finderRow - 1

      if (relativeX < 0 || relativeY < 0 || relativeX >= matrix.length || relativeY >= matrix.length){
        continue;
      }

      matrix[relativeX][relativeY] = finderPattern[finderCol][finderRow]
    }
  }

}

function generateAllTopLeftPairsBetween(numbers){

  // shift the coords to the top left of the pattern
  numbers = numbers.map((x) => x - 2);

  if(numbers.length < 2){
    return numbers;
  }

  let allPairs = [];

  for(let i = 0; i < numbers.length; i++){
    for(let j = 0; j < numbers.length; j++){
      allPairs.push([numbers[i], numbers[j]]);
    }
  }
  return allPairs;
}

function checkAllCornersOK(matrix, coords){

  let x = coords[0]
  let y = coords[1]

  return matrix[x][y] == undefined && matrix[x+4][y] == undefined && matrix[x][y+4] == undefined && matrix[x+4][y+4] == undefined

}

function addAlignmentPatterns(matrix, coords){

  let pairs = generateAllTopLeftPairsBetween(coords);


  let alignmentPattern = [
    [[1, 1], [1, 1], [1, 1], [1, 1], [1, 1]],
    [[1, 1], [0, 1], [0, 1], [0, 1], [1, 1]],
    [[1, 1], [0, 1], [1, 1], [0, 1], [1, 1]],
    [[1, 1], [0, 1], [0, 1], [0, 1], [1, 1]],
    [[1, 1], [1, 1], [1, 1], [1, 1], [1, 1]]
  ]

  for(let i = 0; i < pairs.length; i++){
    let startX = pairs[i][0];
    let startY = pairs[i][1];
    // console.log("checking pair: ")
    // console.log([startX, startY])
    if(!checkAllCornersOK(matrix, [startX, startY])){
      // console.log("skipped")
      // console.log([startX, startY])
      continue;
    }

    let relativeX = 0;
    let relativeY = 0;

    for(let alignmentCol = 0; alignmentCol < alignmentPattern.length; alignmentCol++){
      for(let alignmentRow = 0; alignmentRow < alignmentPattern.length; alignmentRow++){

        relativeX = startX + alignmentCol
        relativeY = startY + alignmentRow

        matrix[relativeX][relativeY] = alignmentPattern[alignmentCol][alignmentRow]
      }
    }
  }

}

function addTimingPatterns(matrix){
  
  let flipper = true;
  let change;
  for(let i = 8; i < matrix.length - 8; i++){
    change = (flipper) ? [1, 1] : [0, 1];
    matrix[6][i] = change;
    matrix[i][6] = change;

    flipper = !flipper

  }
}

function reserveSpaceForFormat(matrix){

  // for the top left finder
  for(let i = 0; i < 9; i++){
    if(i == 6){
      continue;
    }
    matrix[8][i] = [0, 1];
    matrix[i][8] = [0, 1];
  }

  // top right finder

  for(let i = matrix.length - 8; i < matrix.length; i++){
    matrix[8][i] = [0, 1];
  }

  for(let i = matrix.length - 7; i < matrix.length; i++){
    matrix[i][8] = [0, 1];
  }

}

function reserveSpaceForVersion(matrix, figure, topLeftCoords){

  let startX = topLeftCoords[0];
  let startY = topLeftCoords[1];


  for(let figureCol = 0; figureCol < figure.length; figureCol++){
    for(let figureRow = 0; figureRow < figure[0].length; figureRow++){
      if(matrix[startX + figureCol][startY + figureRow] != undefined){
        continue;
      }
      matrix[startX + figureCol][startY + figureRow] = figure[figureCol][figureRow];

    }
  }
}

function createMatrix(data, version){
  let size = calculateSizeByVersion(version);
  let matrix = Array(size).fill().map(() => Array(size).fill())

  // Adds the finder patterns
  addFinderPatterns(matrix, [0, 0]);
  addFinderPatterns(matrix, [size - 7, 0]);
  addFinderPatterns(matrix, [0, size - 7]);

  if(version > 1){
    addAlignmentPatterns(matrix, ALIGNMENT_PATTERN_CENTER_COORDS[version])
  }


  addTimingPatterns(matrix);

  // For the dark module

  matrix[(4 * version) + 9][8] = [1, 1];

  reserveSpaceForFormat(matrix)

  let topRightSpace = [
    [[0, 1], [0, 1], [0, 1]],
    [[0, 1], [0, 1], [0, 1]],
    [[0, 1], [0, 1], [0, 1]],
    [[0, 1], [0, 1], [0, 1]],
    [[0, 1], [0, 1], [0, 1]],
    [[0, 1], [0, 1], [0, 1]]
  ];

  let bottomLeftSpace = [
    [[0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1]],
    [[0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1]],
    [[0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1]]
  ];
  if(version >= 7){
    reserveSpaceForVersion(matrix, topRightSpace, [0, size - 11]);
  
    reserveSpaceForVersion(matrix, bottomLeftSpace, [size - 11, 0]);
  }

  // printMatrix(matrix);
  fillPattern(matrix, data);
  // printMatrix(matrix);

  return matrix;
}

function fillPattern(matrix, dataPattern){

  let size = matrix.length;
  let binaryIndex = 0;
  let i = 14;
  let j = 61;
  let lastJ = size - 1;
  while(binaryIndex < dataPattern.length){
    // console.log("j is in the upwards: " + j);
    for(i = size - 1; i >= 0; i--){
      for(j = lastJ; j > lastJ - 2; j--){
        if(undefined != matrix[i][j]){
          continue;
        }
        matrix[i][j] = [dataPattern[binaryIndex], 0]
        // printMatrix(matrix);
        binaryIndex++;
        
      }
    }
    // To stop the second loop from executing at the end
    if(j < 0){
      break;
    }

    lastJ = j;

    // console.log("j is in the downwards: " + j);
    if(j == 6){
      lastJ = 5;
      continue;
    }

    for(i = 0; i < size; i++){
      for(j = lastJ; j > lastJ - 2; j--){
        if(undefined != matrix[i][j]){
          continue;
        }
        matrix[i][j] = [dataPattern[binaryIndex], 0]
        // printMatrix(matrix);
        binaryIndex++;
      }
    }
    // To skip the vertical alignment pattern thats always on the coord 6, 6
    if(j == 6){
      lastJ = 5;
      continue;
    }
    lastJ = j;

  }

}


function printMatrix(matrix){
  let line = "";
  for(let i = 0; i < matrix.length; i++){
    for(let j = 0; j < matrix.length; j++){
      if(matrix[i][j] == undefined){
        line += "#";
        continue;
      }
      line += matrix[i][j][0];
    }
    console.log(line)
    line = ""
  }
  console.log(" ");
}

export {createMatrix, printMatrix}

// let matrix = createMatrix(encodeData("HELLO WORLD", 1, "Q"), 1);
// printMatrix(matrix)