import { encodeData, DATA_BY_VERSION_AND_ECLEVEL } from "./rawDataEncoding.js";
import { convertToNumbers, convertToExponents } from "./usedFunctions.js";

// Temp stuff

const EXP = [1,2,4,8,16,32,64,128,29,58,116,232,205,135,19,38,76,152,45,90,180,117,234,201,
                            143,3,6,12,24,48,96,192,157,39,78,156,37,74,148,53,106,212,181,119,238,193,159,
                            35,70,140,5,10,20,40,80,160,93,186,105,210,185,111,222,161,95,190,97,194,153,47,
                            94,188,101,202,137,15,30,60,120,240,253,231,211,187,107,214,177,127,254,225,223,
                            163,91,182,113,226,217,175,67,134,17,34,68,136,13,26,52,104,208,189,103,206,129,
                            31,62,124,248,237,199,147,59,118,236,197,151,51,102,204,133,23,46,92,184,109,218,
                            169,79,158,33,66,132,21,42,84,168,77,154,41,82,164,85,170,73,146,57,114,228,213,183,
                            115,230,209,191,99,198,145,63,126,252,229,215,179,123,246,241,255,227,219,171,75,150,
                            49,98,196,149,55,110,220,165,87,174,65,130,25,50,100,200,141,7,14,28,56,112,224,221,
                            167,83,166,81,162,89,178,121,242,249,239,195,155,43,86,172,69,138,9,18,36,72,144,61,
                            122,244,245,247,243,251,235,203,139,11,22,44,88,176,125,250,233,207,131,27,54,108,216,
                            173,71,142,1];

const LOG = [0,0,1,25,2,50,26,198,3,223,51,238,27,104,199,75,4,100,224,14,52,141,239,129,28,193,105,
                            248,200,8,76,113,5,138,101,47,225,36,15,33,53,147,142,218,240,18,130,69,29,181,194,125,
                            106,39,249,185,201,154,9,120,77,228,114,166,6,191,139,98,102,221,48,253,226,152,37,179,
                            16,145,34,136,54,208,148,206,143,150,219,189,241,210,19,92,131,56,70,64,30,66,182,163,
                            195,72,126,110,107,58,40,84,250,133,186,61,202,94,155,159,10,21,121,43,78,212,229,172,
                            115,243,167,87,7,112,192,247,140,128,99,13,103,74,222,237,49,197,254,24,227,165,153,119,
                            38,184,180,124,17,68,146,217,35,32,137,46,55,63,209,91,149,188,207,205,144,135,151,178,
                            220,252,190,97,242,86,211,171,20,42,93,158,132,60,57,83,71,109,65,162,31,45,67,216,183,
                            123,164,118,196,23,73,236,127,12,111,246,108,161,59,82,41,157,85,170,251,96,134,177,187,
                            204,62,90,203,89,95,176,156,169,160,81,11,245,22,235,122,117,44,215,79,174,213,233,230,
                            231,173,232,116,214,244,234,168,80,88,175];


const GEN_POLY_COEFF_BY_EC_CODEWORDS = {
  7: [0, 87, 229, 146, 149, 238, 102, 21],
  10: [0, 251, 67, 46, 61, 118, 70, 64, 94, 32, 45],
  13: [0, 74, 152, 176, 100, 86, 100, 106, 104, 130, 218, 206, 140, 78],
  17: [0, 43, 139, 206, 78, 43, 239, 123, 206, 214, 147, 24, 99, 150, 39, 243, 163, 136],
  18: [0, 215, 234, 158, 94, 184, 97, 118, 170, 79, 187, 152, 148, 252, 179, 5, 98, 96, 153],
  20: [0, 17, 60, 79, 50, 61, 163, 26, 187, 202, 180, 221, 225, 83, 239, 156, 164, 212, 212, 188, 190],
  22: [0, 210, 171, 247, 242, 93, 230, 14, 109, 221, 53, 200, 74, 8, 172, 98, 80, 219, 134,
    160, 105, 165, 231],
  24: [0, 229, 121, 135, 48, 211, 117, 251, 126, 159, 180, 169, 152, 192, 226, 228, 218, 111, 0,
    117, 232, 87, 96, 227, 21],
  26: [0, 173, 125, 158, 2, 103, 182, 118, 17, 145, 201, 111, 28, 165, 53, 161, 21, 245, 142, 13,
    102, 48, 227, 153, 145, 218, 70]

}

const EC_CODWORDS_PER_BLOCK = {
  1: {
    "L": 7,
    "M": 10,
    "Q": 13,
    "H": 17
  },
  5: {
    "L": 26,
    "M": 24,
    "Q": 18,
    "H": 22
  },
  7: {
    "L": 20,
    "M": 18,
    "Q": 18,
    "H": 26
  },
  13: {
    "L": 26,
    "M": 22,
    "Q": 24,
    "H": 22
  }
}

// const GEN_POLY_COEFF_BY_VERSION_AND_ECMODE = [0, 229, 121, 135, 48, 211, 117, 251, 126, 159, 180, 169,
//   152, 192, 226, 228, 218, 111, 0, 117, 232, 87, 96, 227, 21];

function createMessagePolynomial(block){
  let codeword = "";
  let poly = [];
  let ogMesPolyLength = 0;
  for(let i = 0; i < block.length; i++){
    codeword = block[i];
    poly.push(parseInt(codeword, 2));
  }
  ogMesPolyLength = poly.length;

  // // now we multiply the polynomial by x^n, with n being the no. of ec codewords needed per block
  // for (let i = 0; i < EC_CODWORDS_PER_BLOCK[version][ecMode]; i++ ){
  //   poly.push(0);
  // }
  return [poly, ogMesPolyLength];
}

function gmult (a, b) {
  if (a === 0 || b === 0) { return (0); }
  var i = LOG[a];
  var j = LOG[b];
  return EXP[(i+j)%255];
}


function exponentArrToNumber(arr){
  for(let i = 0; i < arr.length; i++){
    arr[i] = EXP[arr[i]]
  }
  return arr
}

function polynomialDivision(msg, n_ec_words) {
  // return parity bytes

  // Simulate a LFSR with generator polynomial for n byte RS code.

  // if (this.gen_poly == null) { this.gen_poly = this.genPoly(this.n_ec_bytes); }
  // let gen_poly = [117,68,11,164,154,122,127,1]
  // console.log("would use")
  // console.log(GEN_POLY_COEFF_BY_EC_CODEWORDS[n_ec_words])
  let gen_poly = exponentArrToNumber(JSON.parse(JSON.stringify(GEN_POLY_COEFF_BY_EC_CODEWORDS[n_ec_words]))).reverse()
  let fullGenPolyLength = ((4*gen_poly.length) - gen_poly.length)
  
  // console.log("The used genPoly")
  // console.log(gen_poly)
  var LFSR = new Array(gen_poly.length);
  var i;

  for(let i = 0; i < fullGenPolyLength; i++){
    gen_poly.push(0)
  }
  for(i = 0; i < LFSR.length; i++) { LFSR[i] = 0; }

  for (i = 0; i < msg.length; i++) {
    var dbyte = msg[i] ^ LFSR[LFSR.length - 2];
    var j;
    for (j = LFSR.length - 2; j > 0; j--) {
      LFSR[j] = LFSR[j-1] ^ gmult(gen_poly[j], dbyte);
    }
    LFSR[0] = gmult(gen_poly[0], dbyte);
  }

  var parity = [];
  for (i = LFSR.length - 2; i >= 0; i--) { parity.push(LFSR[i]); }
  // console.log("The ec codewords")
  // console.log(parity)
  return decArrToBinary(parity);
}


// function polynomialDivision(polMes, polGen, polMesOGLength){

//   console.log("The message polynomial: ")
//   console.log(polMes)
//   // so I dont mutate the original generator by mistake
//   let usablePolGen = JSON.parse(JSON.stringify(polGen));
//   let ogPolGen = JSON.parse(JSON.stringify(polGen));


//   for(let i = 0; i < polMesOGLength; i++){
//     console.log("#####################################")
//     console.log("            DIVISION NUMBER: " + i);
//     console.log("#####################################")
//     let firstExponent = NUMBER_TO_EXPONENT[polMes[0]];
//     // multiply the generator poly with the first term of the message poly
//     for(let j = 0; j < usablePolGen.length; j++){
//       if(usablePolGen[j] == -1){
//         continue;
//       }
//       let midSult = firstExponent + usablePolGen[j];
//       usablePolGen[j] = midSult > 255 ? midSult % 255 : midSult;
//     }
//     // convert the gen poly to integers
//     usablePolGen = convertToNumbers(usablePolGen, EXP);
    
//     // now we have to xor the terms of the message poly with the terms of the generator poly
//     console.log("The gen poly for the operation: ")
//     console.log(usablePolGen)
//     console.log("The message poly for the operation: ")
//     console.log(polMes)
//     for(let k = 0; k < usablePolGen.length; k++){
//       if(usablePolGen[k] == -1){
//         continue;
//       }
//       polMes[k] = usablePolGen[k] ^ polMes[k];
//     }
//     // removes the unnecesary 0 at the beginning of the new message poly
//     polMes.shift();
//     // so both polys have the same length
//     ogPolGen.pop()
//     usablePolGen = [...ogPolGen]
//     console.log("The result message poly: ")
//     console.log(polMes)
//     console.log("The usable generator: ")
//     console.log(ogPolGen)

//   }

//   // console.log("If it mutates or not the polys: ")
//   // console.log(GEN_POLY_COEFF_BY_VERSION_AND_ECMODE[5]["Q"])
//   console.log("####################################################")
//   console.log("#                FINISHED THE GROUP                #")
//   console.log("####################################################")
//   return decArrToBinary(polMes);
// }

function decArrToBinary(arr){
  let binArr = [];
  for (let i = 0; i < arr.length; i++){
    binArr.push(arr[i].toString(2).padStart(8, "0"));
  }
  return binArr
}

// this depends on the length of the original message polynomials, that depends on the amount of codewords per block

function createErrorCorrectionCodewords(codeBlocks, version, ecMode){

  let group1 = codeBlocks[0];
  let group2 = codeBlocks[1];
  let group1ECWords = [];
  let group2ECWords = [];

  for (let i = 0; i < group1.length; i++){
    let ecWords1 = ecCodewordsByBlock(group1[i], version, ecMode);
    group1ECWords.push(Array.from(ecWords1));
  }

  for (let i = 0; i < group2.length; i++){
    let ecWords2 = ecCodewordsByBlock(group2[i], version, ecMode);
    group1ECWords.push(Array.from(ecWords2));
  }
  return [group1ECWords, group2ECWords]
  
}

function ecCodewordsByBlock(block, version, ecMode){
  let mesPoly = [];
  let lenPoly = 0;
  let ogMesPolyLength = 0;
  let messagePolyArr = [];
  
  messagePolyArr = createMessagePolynomial(block);
  // console.log("Everything devuelto lol: ")
  // console.log(messagePolyArr);
  mesPoly = messagePolyArr[0];
  ogMesPolyLength = messagePolyArr[1];
  // console.log(mesPoly)
  // lenPoly = mesPoly.length - GEN_POLY_COEFF_BY_EC_CODEWORDS[EC_CODWORDS_PER_BLOCK[version][ecMode]].length;
  // for(let j = 0; j < lenPoly; j++){
  //   GEN_POLY_COEFF_BY_EC_CODEWORDS[EC_CODWORDS_PER_BLOCK[version][ecMode]].push(-1);
  // }
  // Ahora ya tengo los dos polinomios, puedo empezar a operar
  // let genPoly = GEN_POLY_COEFF_BY_EC_CODEWORDS[EC_CODWORDS_PER_BLOCK[version][ecMode]]
  // genPoly = exponentArrToNumber(genPoly)
  // console.log("The gen poly: ")
  // console.log(genPoly)
  // console.log("The message poly: ")
  // console.log(mesPoly)

  // for(let i = 0; i < (genPoly.length - 1); i++){
  //   mesPoly.push(0)
  // }
  // console.log("The message polynomial")
  // console.log(mesPoly)
  return polynomialDivision(mesPoly, EC_CODWORDS_PER_BLOCK[version][ecMode]);

}

// createErrorCorrectionCodewords(encodeData("HELLO WORLD"))
// console.log("before first function: " + HARD_GEN)
// console.log(polynomialDivision([...HARD_MES], HARD_GEN, 16));
// console.log("after first function: " + HARD_GEN)
// console.log(polynomialDivision([...HARD_MES], HARD_GEN, 16));
// console.log("after second function: " + HARD_GEN)

export { createErrorCorrectionCodewords };