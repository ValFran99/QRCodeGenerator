import { encodeData } from "./rawDataEncoding.js";

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

function addAlignmentPatterns(matrix, topLeftCoords){
  let alignmentPattern = [
    [[1, 1], [1, 1], [1, 1], [1, 1], [1, 1]],
    [[1, 1], [0, 1], [0, 1], [0, 1], [1, 1]],
    [[1, 1], [0, 1], [1, 1], [0, 1], [1, 1]],
    [[1, 1], [0, 1], [0, 1], [0, 1], [1, 1]],
    [[1, 1], [1, 1], [1, 1], [1, 1], [1, 1]]
  ]

  for(let i = 0; i < topLeftCoords.length; i++){
    let startX = topLeftCoords[i][0];
    let startY = topLeftCoords[i][1];

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
  for(let i = 8; i < 61; i++){
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

  addAlignmentPatterns(matrix, [[4, 32], [32, 4], [32, 32], [32, 60], [60, 32], [60, 60]])

  addTimingPatterns(matrix);

  // For the dark module

  matrix[61][8] = [1, 1];

  reserveSpaceForFormat(matrix)

  let version1 = [
    [[0, 1], [0, 1], [0, 1]],
    [[0, 1], [0, 1], [0, 1]],
    [[0, 1], [0, 1], [0, 1]],
    [[0, 1], [0, 1], [0, 1]],
    [[0, 1], [0, 1], [0, 1]],
    [[0, 1], [0, 1], [0, 1]]
  ];

  let version2 = [
    [[0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1]],
    [[0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1]],
    [[0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1]]
  ];

  reserveSpaceForVersion(matrix, version1, [0, 58]);

  reserveSpaceForVersion(matrix, version2, [58, 0]);

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
        matrix[i][j] = [dataPattern[binaryIndex], "0"]
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
        matrix[i][j] = [dataPattern[binaryIndex], "0"]
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

// createMatrix(encodeData("https://www.youtube.com/watch?v=1daMpenuJ7o"), 13);