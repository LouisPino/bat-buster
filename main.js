//variables
let mousePos = [];
let gunUnflasher
const guySpeed = 15
let xTrans = 0
let yTrans = 0

//event listeners
document.addEventListener("mousemove", storeMouse);
document.addEventListener("keydown", buttonPress)

//cached elements
pistol = document.querySelector('.pistol')
rifle = document.querySelector('.rifle')
bazooka = document.querySelector('.bazooka')
guy = document.querySelector('.guy')



//functions

function init(){
guyPos = [0, 0]


}

function buttonPress(e) {
    //console.log(e.keyCode)
    let key1= e.keyCode >=48 && e.keyCode<= 57
    let key2= e.keyCode >=96 && e.keyCode<= 105
    if(key1 || key2){fire(e.keyCode)}
    else
 {moveGuy(e.keyCode)}
}


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
      gunFlash(bazooka)
    } else if (num === 2) {
      console.log("You shot your rifle");
      gunFlash(rifle)
    } else {
        console.log("You shot your pistol");
        gunFlash(pistol)
    }
  }

function moveGuy(num){
       // console.log('moved')
        if (num === 37 || num === 65) {
        //  console.log("You moved left");
          guy.style.transform = `translate(${xTrans - guySpeed}px, ${yTrans}px)`
          xTrans -= guySpeed
      //    console.log(guy)
        } else if (num === 38 || num === 87) {
         // console.log("You moved up");
          console.log(xTrans)
          guy.style.transform = `translate(${xTrans}px, ${yTrans - guySpeed}px)`
          yTrans -= guySpeed
        } else if (num === 39 || num === 68) {
       //   console.log("You moved right");
          guy.style.transform = `translate(${xTrans + guySpeed}px, ${yTrans}px)`
          xTrans += guySpeed
        } else if (num === 40 || num === 83){
        //  console.log("You moved down");
          guy.style.transform = `translate(${xTrans}px, ${yTrans + guySpeed}px)`
          yTrans += guySpeed
        }
    }

    function gunFlash(gun){
        const unFlash = function(){
            gun.classList.remove('fired')
        }
        if(gun === pistol){flashInt = 100}
        if(gun === rifle){flashInt = 500}
        if(gun === bazooka){flashInt = 1000}
        gunUnflasher = gun
        gun.classList.add('fired')
        setTimeout(unFlash, flashInt)
    }