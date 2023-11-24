function splitString(number){
  splitted = []
  inter = []
  for(let i = 0; i < number.length; i++){
    inter.push(number[i])
    // console.log(inter)
    if((i + 1) % 3 == 0){

      splitted.push(inter.join(""))
      inter = []
    }
  }
  if (inter.length != 0){
    splitted.push(inter.join(""))
  }
  
  return splitted
}