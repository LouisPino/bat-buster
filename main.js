//variables
let mousePos = [];

//event listeners
document.addEventListener("mousemove", storeMouse);
//document.addEventListener("keypress", numPress);
document.addEventListener("keydown", buttonPress)

function buttonPress(e) {
    //console.log(e.keyCode)
    let key1= e.keyCode >=48 && e.keyCode<= 57
    let key2= e.keyCode >=96 && e.keyCode<= 105
    if(key1 || key2){fire(e.keyCode)}
    else
 {moveGuy(e.keyCode)}
 //if(e.keyCode >=37 && e.keyCode <= 40)
}

//functions
function storeMouse(e) {
  mousePos[0] = e.clientX;
  mousePos[1] = e.clientY;
  //console.log(mousePos)
}

function fire(num) {
    //console.log('fired')
    num < 60 ? num-=48 : num-=96
    if (num === 3) {
      console.log("You shot your bazooka");
    } else if (num === 2) {
      console.log("You shot your rifle");
    } else {
      console.log("You shot your pistol");
    }
  }

function moveGuy(num){
       // console.log('moved')
        if (num === 37 || num === 65) {
          console.log("You moved left");
        } else if (num === 38 || num === 87) {
          console.log("You moved up");
        } else if (num === 39 || num === 68) {
          console.log("You moved right");
        } else if (num === 40 || num === 83){
          console.log("You moved down");
        }
    }