// import { encodeData } from "./rawDataEncoding.js";

function calculateSizeByVersion(versionNumber){
  return (((versionNumber - 1) * 4) + 21);
}

function createFinderPattern(matrix, topLeftCoords){

  let finderPattern = [
    [[1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1]],
    [[1, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [1, 1]],
    [[1, 1], [0, 1], [1, 1], [1, 1], [1, 1], [0, 1], [1, 1]],
    [[1, 1], [0, 1], [1, 1], [1, 1], [1, 1], [0, 1], [1, 1]],
    [[1, 1], [0, 1], [1, 1], [1, 1], [1, 1], [0, 1], [1, 1]],
    [[1, 1], [0, 1], [0, 1], [0, 1], [0, 1], [0, 1], [1, 1]],
    [[1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1]]
  ]

  // console.log(finderPattern)

  let startX = topLeftCoords[0];
  let startY = topLeftCoords[1];

  for(let finderCol = 0; finderCol < 7; finderCol++){
    for(let finderRow = 0; finderRow < 7; finderRow++){
      matrix[startX + finderCol][startY + finderRow] = finderPattern[finderCol][finderRow]
    }
  }
}

function createMatrix(data, version){
  let size = calculateSizeByVersion(version);
  let matrix = Array(size).fill().map(() => Array(size).fill())
  createFinderPattern(matrix, [0, 0]);
  createFinderPattern(matrix, [size - 7, 0]);
  createFinderPattern(matrix, [0, size - 7]);

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