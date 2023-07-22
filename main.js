//variables
let mousePos = [];
let gunUnflasher;
let headerHeight = 120;
let footerHeight = 75;
let borderWidth = window.innerWidth / 7;
let batCount = 0
let batObjs = []
let batEls = []
let batGenFreq = 1000
let batSpeedFreq = 50

let guy = {
  speed: 25,
  width: 100,
  height: 100,
  xTrans: 0,
  yTrans: 0,
};

class Bat {
  constructor(batCount) {
    this.health = 10;
    this.speed = 20;
    this.height = 50;
    this.width = 50;
    this.xTrans = Math.floor(Math.random()* (window.innerWidth - borderWidth*2 - this.width));
    this.yTrans = topBottom();
    this.id = batCount
  }
 


 batMove(){
   let q = this
   if(this.xTrans < window.innerWidth/2 - borderWidth){
   setInterval(function(){
    {q.xTrans += q.speed}
    renderBat()
    if(onBorder(q.xTrans, q.yTrans)){
      batEls[q.id].remove()
        }
  }, batSpeedFreq)}



  
  if(this.xTrans > window.innerWidth/2 - borderWidth){
    setInterval(function(){
     {q.xTrans -= q.speed}
   }, batSpeedFreq)}
   if(this.yTrans < window.innerHeight/2 - 100){
    setInterval(function(){
     {q.yTrans += q.speed}
   }, batSpeedFreq)}
   if(this.yTrans > window.innerHeight/2 - 100){
     setInterval(function(){
      {q.yTrans -= q.speed}
    }, batSpeedFreq)}
  }






  batCreate() {
    batEls[batCount] = document.createElement('img')
    batEls[batCount].classList.add('bat')
    batEls[batCount].src = 'assets/bat.gif'
    batEls[batCount].style.transform = `translate(${this.xTrans}px, ${this.yTrans}px)`
    mainEl.appendChild(batEls[batCount])
    batCount++
  }
}

//event listeners
document.addEventListener("mousemove", storeMouse);
document.addEventListener("keydown", buttonPress);

//cached elements
mainEl = document.querySelector("main");
pistol = document.querySelector(".pistol");
rifle = document.querySelector(".rifle");
bazooka = document.querySelector(".bazooka");
guyEl = document.querySelector(".guy");

//functions

function init() {
  guy.xTrans = 0
  guy.yTrans = 0
  batCount = 0
  batGenFreq = 3000
}

function buttonPress(e) {
  let key1 = e.keyCode >= 48 && e.keyCode <= 57;
  let key2 = e.keyCode >= 96 && e.keyCode <= 105;
  if (key1 || key2) {
    fire(e.keyCode);
  } else {
    guyMove(e.keyCode);
  }
}

function storeMouse(e) {
  mousePos[0] = e.clientX;
  mousePos[1] = e.clientY;
  console.log(mousePos)

}

function fire(num) {
  num < 60 ? (num -= 48) : (num -= 96);
  if (num === 3) {
    gunFlash(bazooka);
  } else if (num === 2) {
    gunFlash(rifle);
  } else {
    gunFlash(pistol);
  }
}

function guyMove(num) {
  if (num === 37 || num === 65) {
    if (guy.xTrans > window.innerWidth * -0.5 + borderWidth) {
      guyEl.style.transform = `translate(${guy.xTrans - guy.speed}px, ${
        guy.yTrans
      }px)`;
      guy.xTrans -= guy.speed;
    }
  } else if (num === 38 || num === 87) {
    if (guy.yTrans > window.innerHeight * -0.5 + headerHeight) {
      guyEl.style.transform = `translate(${guy.xTrans}px, ${
        guy.yTrans - guy.speed
      }px)`;
      guy.yTrans -= guy.speed;
    }
  } else if (num === 39 || num === 68) {
    if (guy.xTrans < window.innerWidth * 0.5 - borderWidth - guy.width) {
      guyEl.style.transform = `translate(${guy.xTrans + guy.speed}px, ${
        guy.yTrans
      }px)`;
      guy.xTrans += guy.speed;
    }
  } else if (num === 40 || num === 83) {
    if (
      guy.yTrans * -1 >
      window.innerHeight * -0.5 + footerHeight + guy.height
    ) {
      guyEl.style.transform = `translate(${guy.xTrans}px, ${
        guy.yTrans + guy.speed
      }px)`;
      guy.yTrans += guy.speed;
    }
  }
  console.log(guy.xTrans, guy.yTrans, onBorder(guy.xTrans, guy.yTrans))
}

function gunFlash(gun) {
  const unFlash = function () {
    gun.classList.remove("fired");
  };
  if (gun === pistol) {
    flashInt = 100;
  }
  if (gun === rifle) {
    flashInt = 500;
  }
  if (gun === bazooka) {
    flashInt = 1000;
  }
  gunUnflasher = gun;
  gun.classList.add("fired");
  setTimeout(unFlash, flashInt);
}

console.log(window.innerHeight)
function onBorder(x, y){
if(x < window.innerWidth * -0.5 + borderWidth){return 'left'}
else if(y < 0){return 'top'}
else if(x > window.innerWidth - borderWidth * 2){return 'right'}
else if(y > window.innerHeight - footerHeight * 3){return 'bottom'}
else return false
}



function topBottom(){
  y = Math.floor(Math.random()*2)
  return  y === 0 ? 0 : window.innerHeight - footerHeight - 50 - headerHeight
}

function renderBat(){
  batEls.forEach(function(batEl, idx){
    batEl.style.transform = `translate(${batObjs[idx].xTrans}px, ${batObjs[idx].yTrans}px)`
  })
}

function increaseBatGenFreq(){
  if (3 % batCount === 0 && batGenFreq > 500){
  batGenFreq -= 500
  clearInterval(newBats)
  releaseBats()
  console.log()
  }
}


function releaseBats(){
  newBats = setInterval(function(){
    batObjs[batCount] = new Bat(batCount)
    batObjs[batCount].batCreate()
    batObjs[batCount-1].batMove()
    increaseBatGenFreq()
  }, batGenFreq)
}

init()
releaseBats()