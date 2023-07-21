//variables
let mousePos = []






//event listeners
window = document.addEventListener('mousemove', storeMouse)








//functions
function storeMouse(e){
mousePos[0] = e.clientX
mousePos[1] = e.clientY
console.log(mousePos)
}