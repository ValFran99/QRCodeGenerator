// import { encodeData } from "./rawDataEncoding.js";

function calculateSizeByVersion(versionNumber){
  return (((versionNumber - 1) * 4) + 21);
}

function createFinderPattern(matrix, topLeftCoords){

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

function createAlignmentPattern(matrix, topLeftCoords){
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

function createMatrix(data, version){
  let size = calculateSizeByVersion(version);
  let matrix = Array(size).fill().map(() => Array(size).fill())

  // Adds the finder patterns
  createFinderPattern(matrix, [0, 0]);
  createFinderPattern(matrix, [size - 7, 0]);
  createFinderPattern(matrix, [0, size - 7]);

  createAlignmentPattern(matrix, [[3, 31], [31, 3], [31, 31], [31, 59], [59, 31], [59, 59]])

  // Adds the

  printMatrix(matrix, size);

  // console.log(matrix)
  // addFinderPatterns(matrix, size);
  return matrix;
}

function printMatrix(matrix, size){
  let line = "";
  for(let i = 0; i < size; i++){
    for(let j = 0; j < size; j++){
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

createMatrix("011101", 13);