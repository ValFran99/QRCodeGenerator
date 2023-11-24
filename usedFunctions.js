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

export { splitString };