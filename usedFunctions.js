function splitString(data, n){
  let splitted = []
  let inter = []
  for(let i = 0; i < data.length; i++){
    inter.push(data[i])
    // console.log(inter)
    if((i + 1) % n == 0){

      splitted.push(inter.join(""))
      inter = []
    }
  }
  if (inter.length != 0){
    splitted.push(inter.join(""))
  }
  
  return splitted
}

function generateGaloisField(n, xorWith){
  
  let exponentToNumber = new Array(n);
  let numberToExponent = new Array(n);
  let midNumber = 0;
  let result = 0;
  exponentToNumber[0] = 1;
  numberToExponent[0] = 0;
  
  for (let i = 1; i < n; i++){
    midNumber = exponentToNumber[i-1]*2;
    result = (midNumber > 255) ? midNumber ^ xorWith : midNumber;
    exponentToNumber[i] = result;
    numberToExponent[result] = i;
  }
  numberToExponent[1] = 0;
  return [exponentToNumber, numberToExponent];
}

function multiplyWithGaloisFields(numberA, numberB, galoisField){
  /* 
    recibe dos numeros decimales y devuelve la multiplicación entre ellos teniendo el cuenta el field de galois dado
    y devuelve el resultado dentro del campo de galois
    */

  let exponentToNumber = galoisField[0];
  let numberToExponent = galoisField[1];

  let expA = numberToExponent[numberA];
  let expB = numberToExponent[numberB];

  let midSult = expA + expB;

  let resultExp = (midSult > 255) ? midSult % 255 : midSult; 

  return exponentToNumber[resultExp];

}

// console.log(generateGaloisField(256, 285))

// console.log(multiplyWithGaloisFields(7, 9, generateGaloisField(256, 285)))

export { splitString, generateGaloisField };