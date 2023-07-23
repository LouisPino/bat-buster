//variables
let mousePos = [];
let gunUnflasher;
let headerHeight = 120;
let footerHeight = 75;
let borderWidth = window.innerWidth / 7;
let batCount = 0;
let batObjs = [];
let batEls = [];
let batGenFreq = 3000;
let batSpeedFreq = 100;
let batSpeed = 20 // pixels moved per jump
let guySpeedFreq = 100; // frequency of jump
let batMoveTimeId;
let batDim = 50;
const maxLives = 3;
let lives = maxLives;
let heldKey;
let score = 0;
let fireDelay;
let bounds = {};
const pistolAudio = new Audio("assets/pistol.mp3");
const rifleAudio = new Audio("assets/rifle.mp3");
const bazookaAudio = new Audio("assets/bazooka.mp3");
const bonkAudio = new Audio("assets/bonk.mp3");
const hurtAudio = new Audio("assets/hurt.mp3");
let gunSelected;
let defense = false
let guyMoveId

class Gun {
  constructor(fireDelay, hitPoints, name, audio) {
    this.name = name;
    this.fireDelay = fireDelay;
    this.hitPoints = hitPoints;
    this.El = document.querySelector(`.${name}`);
    this.audio = audio;
  }
}


const pistol = new Gun(100, 3, "pistol", pistolAudio);
const rifle = new Gun(500, 4, "rifle", rifleAudio);
const bazooka = new Gun(1000, 5, "bazooka", bazookaAudio);
let guns = [pistol, rifle, bazooka];




let guy = {
  speed: 25,
  width: 50,
  height: 100,
  xTrans: 0,
  yTrans: 0,
  attack: 0,
};

class Bat {
  constructor(batCount) {
    this.health = 10;
    this.speed = Math.floor(Math.random() * 4 + batSpeed);
    this.height = 50;
    this.width = 50;
    this.xTrans = Math.floor(
      Math.random() * (window.innerWidth - borderWidth * 2 - this.width)
    );
    this.yTrans = topBottom();
    this.id = batCount;
  }

  batMove() {
    let q = this;
    let xDir = 1;
    let yDir = 1;
    if (q.xTrans < window.innerWidth / 2 - borderWidth) {
      xDir = 1;
    } else if (q.xTrans > window.innerWidth / 2 - borderWidth) {
      xDir = -1;
    }
    if (q.yTrans < window.innerHeight / 2 - 100) {
      yDir = 1;
    } else if (q.yTrans > window.innerHeight / 2 - 100) {
      yDir = -1;
    }
    batMoveTimeId = setInterval(function () {
      q.xTrans += q.speed * xDir;
      q.yTrans += q.speed * yDir;

      renderBat();
      if (collide(q)) {
        batEls[q.id].remove();
        loseLife();
      }

      if (
        onBorder(
          batEls[q.id].getBoundingClientRect().x,
          batEls[q.id].getBoundingClientRect().y
        ) === "left"
      ) {
        q.xTrans += batSpeed *2.5
        xDir *= -1;
      }
      if (
        onBorder(
          batEls[q.id].getBoundingClientRect().x + batDim,
          batEls[q.id].getBoundingClientRect().y
        ) === "right"
      ) {
        q.xTrans -= batSpeed *2.5
        xDir *= -1;
      }
      if (
        onBorder(
          batEls[q.id].getBoundingClientRect().x,
          batEls[q.id].getBoundingClientRect().y
        ) === "top"
      ) {
        q.yTrans += batSpeed *2.5
        yDir *= -1;
      }
      if (
        onBorder(
          batEls[q.id].getBoundingClientRect().x,
          batEls[q.id].getBoundingClientRect().y + batDim
        ) === "bottom"
      ) {
        q.yTrans -= batSpeed *2.5
        yDir *= -1;
      }
    }, batSpeedFreq);
  }

  batCreate() {
    batEls[batCount] = document.createElement("img");
    batEls[batCount].classList.add("bat");
    batEls[batCount].src = "assets/bat.gif";
    batEls[batCount].draggable = "false";
    batEls[batCount].id = `${batCount}`;
    batEls[
      batCount
    ].style.transform = `translate(${this.xTrans}px, ${this.yTrans}px)`;
    mainEl.appendChild(batEls[batCount]);
    batEls[batCount].addEventListener("mousedown", decHealth);
    batCount++;
    render();
  }
}

//cached elements
mainEl = document.querySelector("main");
pistolEl = document.querySelector(".pistol");
rifleEl = document.querySelector(".rifle");
bazookaEl = document.querySelector(".bazooka");
guyEl = document.querySelector(".guy");
livesDiv = document.querySelector(".lives");
scoreEl = document.querySelector(".score");
modalEl = document.querySelector(".modal");
modalPEl = document.querySelector(".modal-p");
modalTitleEl = document.querySelector(".modal-title");
startBtnEl = document.querySelector(".attack");
defenseBtnEl = document.querySelector(".defense");


//event listeners
document.addEventListener("mousemove", storeMouse);
document.addEventListener("keydown", buttonPress);
document.addEventListener("keyup", buttonUnPress);
startBtnEl.addEventListener("click", startGame);
defenseBtnEl.addEventListener("click", startGameDefenseMode);

//functions
function init() {
  getBounds(mainEl.getBoundingClientRect());
  guy.xTrans = 0;
  guy.yTrans = 0;
  batCount = 0;
  batObjs = [];
  batEls = [];
  batGenFreq = 3000;
  lives = maxLives;

  render();
}

function getBounds(main) {
  bounds = {
    right: main.right,
    left: main.left,
    top: main.top,
    bottom: main.bottom,
    width: main.width,
    height: main.height,
  };
}

function buttonPress(e) {
  if (!defense) {isHeld(e.keyCode)};
  let key1 = e.keyCode >= 48 && e.keyCode <= 57;
  let key2 = e.keyCode >= 96 && e.keyCode <= 105;
  if (key1 || key2) {
    chooseWeapon(e.keyCode);
  }
 // if(!defense){guyMove(e.keyCode)}
}

function storeMouse(e) {
  mousePos[0] = e.clientX;
  mousePos[1] = e.clientY;
}

function chooseWeapon(num) {
  num < 60 ? (num -= 48) : (num -= 96);
  gunSelected = guns[num - 1];
  fireDelay = gunSelected.fireDelay;
  guy.attack = gunSelected.hitPoints;
  gunSelectBorder(gunSelected);
}

//DEFENSE MODE GUYMOVE()
 function guyMoveDefenseMode(e) {
  num = e.keyCode
   if (num === 37 || num === 65) {
     if (guy.left - guy.width/2 > bounds.left) {
       guy.xTrans -= guy.speed;
    }
   } else if (num === 38 || num === 87) {
     if (guy.top > bounds.top) {
       guy.yTrans -= guy.speed;
     }
   } else if (num === 39 || num === 68) {
     if (guy.right+guy.width/2 < bounds.right) {
       guy.xTrans += guy.speed;
     }
   } else if (num === 40 || num === 83) {
     if (
       guy.bottom + guy.height/2< bounds.bottom
     ) {
       guy.yTrans += guy.speed;
     }
   }
   renderGuy()
     getGuyBounds()
 }
function guyMove(){
  guyMoveId = setInterval(function () {
    if (heldKey === 37 || heldKey === 65) {
      if (guy.left - guy.width/2 > bounds.left) {
        guy.xTrans -= guy.speed;
      }
    } else if (heldKey === 38 || heldKey === 87) {
      if (guy.top > bounds.top) {
        guy.yTrans -= guy.speed;
      }
    } else if (heldKey === 39 || heldKey === 68) {
      if (guy.right+guy.width/2 < bounds.right) {
        guy.xTrans += guy.speed;
      }
    } else if (heldKey === 40 || heldKey === 83) {
      if (
        guy.bottom + guy.height/2< bounds.bottom
      ) {
        guy.yTrans += guy.speed;
      }
    }
    renderGuy();
    getGuyBounds()
    console.log('guyM oveRunning')
  }, guySpeedFreq);
}

function gunSelectBorder(gun) {
  guns.forEach(function (w) {
    w.El.classList.remove("selected");
  });
  gun.El.classList.add("selected");
}

function gunFlash(gun) {
  const unFlash = function () {
    gunSelected.El.id = "";
  };
  gunUnflasher = gun;
  playAudio(gunSelected.audio);
  gunSelected.El.id = "fired";
  setTimeout(unFlash, fireDelay);
}

function onBorder(x, y) {
  if (x < bounds.left) {
    return "left";
  } else if (y < bounds.top) {
    return "top";
  } else if (x > bounds.right) {
    return "right";
  } else if (y > bounds.bottom) {
    return "bottom";
  } else return false;
}

function topBottom() {
  y = Math.floor(Math.random() * 2);
  return y === 0 ? 0 : window.innerHeight - footerHeight - 50 - headerHeight;
}

function renderBat() {
  batEls.forEach(function (batEl, idx) {
    batEl.style.transform = `translate(${batObjs[idx].xTrans}px, ${batObjs[idx].yTrans}px)`;
  });
}

function increaseBatGenFreq(batCount) {
  if (batCount % 12 === 0 && batGenFreq > 500) {
    clearInterval(newBats);
    batGenFreq -= 500;
    releaseBats();
  }
}

function releaseBats() {
  newBats = setInterval(function () {
    batObjs[batCount] = new Bat(batCount);
    batObjs[batCount].batCreate();
    batObjs[batCount - 1].batMove();
    increaseBatGenFreq(batCount);
  }, batGenFreq);
}

function render() {
  renderBat();
  renderLives();
  renderScore();
  renderGuy();
}

function renderLives() {
  let lifeEls = [];
  let emptyLifeEls = [];
  while (livesDiv.firstChild) {
    livesDiv.removeChild(livesDiv.firstChild);
  }

  for (i = 0; i < maxLives - lives; i++) {
    emptyLifeEls[i] = document.createElement("img");
    emptyLifeEls[i].src = "assets/heart_empty.png";
    livesDiv.appendChild(emptyLifeEls[i]);
  }
  for (i = 0; i < lives; i++) {
    lifeEls[i] = document.createElement("img");
    lifeEls[i].src = "assets/heart.png";
    livesDiv.appendChild(lifeEls[i]);
  }
}

function renderScore() {
  scoreEl.innerText = `Score: ${score}`;
}

function loseLife() {
  lives -= 1;
  playAudio(hurtAudio);
  renderLives();
  if (lives === 0) {
    gameOver();
  }
}

function gameOver() {
  clearInterval(newBats);
  clearInterval(guyMoveId)
  for (i = 0; i < batCount; i++) {
    batEls[i].remove();
  }
  init();
  lives = 0;
  renderLives();
  guyEl.style.display = "none";
  modalTitleEl.innerHTML = "Tarnation!";
  modalPEl.innerHTML =
    "The bats proved to be a formidable challenge, and the town's hope has dimmed in their relentless onslaught. Your valiant efforts were not in vain, but for now, darkness reigns over the Wild West. The townsfolk are counting on you to rise again and claim victory over these winged foes.<br> <br> <br><h2>Play Again?</h2> ";
  modalPEl.style.textAlign = "center";
  //startBtnEl.innerHTML = "Play Again?";
  mainEl.appendChild(modalEl);
}

function startGame() {
  init();
  initAttack()
  score = 0;
  renderScore();
  modalEl.remove();
  guyEl.style.display = "inline";
  getGuyBounds()
  releaseBats();
}
function startGameDefenseMode() {
  init();
  initDefense()
  score = 0;
  renderScore();
  modalEl.remove();
  guyEl.style.display = "inline";
  getGuyBounds()
  releaseBats();
}

function collide(q) {
  if (
    batEls[q.id].getBoundingClientRect().x - q.width / 2 <
      guyEl.getBoundingClientRect().x &&
    batEls[q.id].getBoundingClientRect().x + q.width / 2 >
      guyEl.getBoundingClientRect().x &&
    batEls[q.id].getBoundingClientRect().y >
      guyEl.getBoundingClientRect().y - guy.height &&
    batEls[q.id].getBoundingClientRect().y - q.height <
      guyEl.getBoundingClientRect().y
  ) {
    return true;
  }
}

function renderGuy() {
  guyEl.style.transform = `translate(${guy.xTrans}px, ${guy.yTrans}px)`;
}

function decHealth(e) {
  gunFlash();
  delayFire();
  batObjs[e.target.id].health -= guy.attack;
  if (batObjs[e.target.id].health <= 0) {
    batEls[e.target.id].remove();
    score++;
    playAudio(bonkAudio);
  }
  render();
}

function playAudio(audio) {
  audio.currentTime = 0;
  audio.play();
}

function isHeld(keyCode) {
  heldKey = keyCode;
}

function buttonUnPress(keyCode) {
  heldKey = null;
}

function delayFire() {
  batEls.forEach(function (batEl) {
    batEl.removeEventListener("mousedown", decHealth);
    setTimeout(function () {
      batEl.addEventListener("mousedown", decHealth);
    }, fireDelay);
  });
}

function getGuyBounds(){
  guy.left= guyEl.getBoundingClientRect().left
  guy.right= guyEl.getBoundingClientRect().right
  guy.top= guyEl.getBoundingClientRect().top
  guy.bottom= guyEl.getBoundingClientRect().bottom
}

function initAttack(){
  guy.speed = 50
  defense = false
  for (gun of guns){
    gun.El.style.display = 'inline'
    console.log(gun.El)
  }
  chooseWeapon(49)
  document.removeEventListener('keydown', guyMoveDefenseMode)
  guyMove()
}

function initDefense(){
  guy.speed = 25
  defense = true
for (gun of guns){
gun.El.style.display = 'none'
}
document.addEventListener('keydown', guyMoveDefenseMode)
if(guyMoveId === true){clearInterval(guyMoveId)}
}



//init()
//initDefense()
//guyMove()
//initAttack()

//startGame()


//MVP
//fix first bat glitching out
//figure out how to clear batMoveLoop






//stretch
//heldkey mutliple keys (maybe 4 event listeners one for each key?)
//sound toggle
//fine tune collide


//can still kill on defense mode
//need score counter on defnese mode