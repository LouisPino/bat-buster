//variables
// let headerHeight = 120;
// let footerHeight = 75;
//let guySpeedFreq = 100; // frequency of motion when held
const mainEl = document.querySelector("main");
let mousePos = [];
let batCount = 0;
let batObjs = [];//// to be filled with bat objects as generated (ID matches position in batEls array)
let batEls = [];
let batGenFreq = 3000;
let batSpeedFreq = 15; //frequency of motions
let batSpeedMin = 3; // pixels moved per motion
let batSpeedRange = 3
let batMoveTimeId;
let batDim = 50;//Bat dimensions (h === w)
const maxLives = 3;
let lives = maxLives;
let heldKey;
let score = 0;
let fireDelay;
let bounds = {};//to be filled with bmainEl oundary info with getBounds()
let attackMult = 1; //Attack multiplier to be changed by power up
let powerTime = 10000;//Length of powerups
let fireDelayMult = 1;//fire rate multiplier to be changed by powerup
const pistolAudio = new Audio("assets/pistol.mp3");
const rifleAudio = new Audio("assets/rifle.mp3");
const bazookaAudio = new Audio("assets/bazooka.mp3");
const bonkAudio = new Audio("assets/bonk.mp3");
const hurtAudio = new Audio("assets/hurt.mp3");
let gunSelected; //store gun selection
let defense = false; //store whether or not we are in defense mode
let guyMoveId; //timer name for guyMove()
let sound = true; //store whether or not player wants sounds on
let powerUpCount = 0; // keep track of powerUps generated so each new one can be assigned a unique ID
let powerUpEls = [];// to be filled with powerUp elements as generated
let powerUpObjs = [];//to be filled with power up Objects as generated (ID matches position in powerupEls array)
let invincibility = false;//store invincibility state for powerUp
const powerUpFreq = 8 // create a powerUp when this many bats have been generated
const defensivePowerUps = 2 //all powerups apply to attack mode, this many apply to defense mode. Keep defenseive power ups in beginning of powerUpEls array and adjust this number to the amount of defensive power ups.
let invincibleLoop//declare name of powerup loop to avoid glitching 
let increaseAttackLoop//declare name of powerup loop to avoid glitching 
let increaseFireRateLoop //declare name of powerup loop to avoid glitching 

//Define Gun class, define guns, store in dictionary for later use
class Gun {
  constructor(fireDelay, hitPoints, name, audio) {
    this.name = name;
    this.fireDelay = fireDelay;
    this.hitPoints = hitPoints;
    this.El = document.querySelector(`.${name}`);
    this.imgEl = document.querySelector(`.${name} > img`);
    this.audio = audio;
  }
}
const pistol = new Gun(100, 3, "pistol", pistolAudio);
const rifle = new Gun(500, 4, "rifle", rifleAudio);
const bazooka = new Gun(1000, 5, "bazooka", bazookaAudio);
let guns = [pistol, rifle, bazooka];

//Define guy properties
let guy = {
  speed: 25,
  speedFreq: 100,
  width: 50,
  height: 100,
  xTrans: 0,
  yTrans: 0,
  attack: 0,
};

//Define Bat class
class Bat {
  constructor(batCount) {
    this.health = 10;
    this.speed = Math.floor(Math.random() * batSpeedRange + batSpeedMin);
    this.height = 50;
    this.width = 50;
    this.xTrans = randomInX();
    this.yTrans = topBottom();
    this.id = batCount;
  }
  batMove() {
    let q = this;
    let xDir = 1;
    let yDir = 1;
    if (q.xTrans < bounds.width / 2) {
      xDir = 1;
    } else if (q.xTrans > bounds.width / 2) {
      xDir = -1;
    }
    if (q.yTrans < bounds.height / 2) {
      yDir = 1;
    } else if (q.yTrans > bounds.height / 2) {
      yDir = -1;
    }
    batMoveTimeId = setInterval(function () {
      q.xTrans += q.speed * xDir;
      q.yTrans += q.speed * yDir;

      renderBat();
      if (collide(batEls, q.id)) {
        batEls[q.id].remove();
        if (invincibility === false) {
          loseLife();
        }
        if (invincibility === true) {
          score++;
          playAudio(bonkAudio)
          renderScore();
        }
      }

      if (
        onBorder(
          batEls[q.id].getBoundingClientRect().x,
          batEls[q.id].getBoundingClientRect().y
        ) === "left"
      ) {
        xDir *= -1;
      }
      if (
        onBorder(
          batEls[q.id].getBoundingClientRect().x + batDim,
          batEls[q.id].getBoundingClientRect().y
        ) === "right"
      ) {
        xDir *= -1;
      }
      if (
        onBorder(
          batEls[q.id].getBoundingClientRect().x,
          batEls[q.id].getBoundingClientRect().y
        ) === "top"
      ) {
        yDir *= -1;
      }
      if (
        onBorder(
          batEls[q.id].getBoundingClientRect().x,
          batEls[q.id].getBoundingClientRect().y + batDim
        ) === "bottom"
      ) {
        yDir *= -1;
      }
    }, batSpeedFreq);
  }

  batCreate() {
    batEls[batCount] = document.createElement("img");
    batEls[batCount].classList.add("bat");
    batEls[batCount].src = "assets/bat.gif";
    batEls[batCount].id = `${batCount}`;
    batEls[
      batCount
    ].style.transform = `translate(${this.xTrans}px, ${this.yTrans}px)`;
    mainEl.appendChild(batEls[batCount]);
    if (!defense) {
      batEls[batCount].addEventListener("mousedown", decHealth);
    }
    if (defense) {
      score++;
    }
    batCount++;
    if(batCount % powerUpFreq === 0){newPowerUp()}
    render();
  }
}

////Define PowerUp class, define PowerUps, store in dictionary for later use
class PowerUp {
  constructor(name, func) {
    this.name = name;
    this.src = `assets/${name}.png`;
    this.effect = func;
    this.xTrans = randomInX();
    this.yTrans = randomInY();
  }
  checkCollision() {//probably don't need this?
    let q = this;
    checkPowerUpCollision(q);
  }
}

const invincible = new PowerUp("invincible", invincibleFunc);
const increaseAttack = new PowerUp("increaseAttack", increaseAttackFunc);
const increaseFireRate = new PowerUp("increaseFireRate", increaseFireRateFunc);
const extraLife = new PowerUp("extraLife", extraLifeFunc);
let powerUpList = [invincible, extraLife, increaseAttack, increaseFireRate];

//cached elements
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
soundIconEl = document.querySelector(".sound-icon");

//event listeners
document.addEventListener("mousemove", storeMouse);
document.addEventListener("keydown", buttonPress);
document.addEventListener("keyup", buttonUnPress);
startBtnEl.addEventListener("click", startGame);
defenseBtnEl.addEventListener("click", startGameDefenseMode);
soundIconEl.addEventListener("click", toggleSound);

//functions
function init() {
  getBounds(mainEl.getBoundingClientRect());
  guy.xTrans = 0;
  guy.yTrans = 0;
  batCount = 0;
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
  if (!defense) {
    isHeld(e.keyCode);
  }
  let key1 = e.keyCode >= 48 && e.keyCode <= 57;
  let key2 = e.keyCode >= 96 && e.keyCode <= 105;
  if (key1 || key2) {
    chooseWeapon(e.keyCode);
  }
}

function storeMouse(e) {
  mousePos[0] = e.clientX;
  mousePos[1] = e.clientY;
  //console.log(mousePos)
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
  num = e.keyCode;
  if (num === 37 || num === 65) {
    if (guy.left - guy.width / 2 > bounds.left) {
      guy.xTrans -= guy.speed;
    }
  } else if (num === 38 || num === 87) {
    if (guy.top > bounds.top) {
      guy.yTrans -= guy.speed;
    }
  } else if (num === 39 || num === 68) {
    if (guy.right + guy.width / 2 < bounds.right) {
      guy.xTrans += guy.speed;
    }
  } else if (num === 40 || num === 83) {
    if (guy.bottom + guy.height / 2 < bounds.bottom) {
      guy.yTrans += guy.speed;
    }
  }
  renderGuy();
  getGuyBounds();
}
function guyMove() {
  guyMoveId = setInterval(function () {
    getGuyBounds();
    if (heldKey === 37 || heldKey === 65) {
      if (guy.left - guy.width > bounds.left) {
        guy.xTrans -= guy.speed;
      }
    } else if (heldKey === 38 || heldKey === 87) {
      if (guy.top > bounds.top) {
        guy.yTrans -= guy.speed;
      }
    } else if (heldKey === 39 || heldKey === 68) {
      if (guy.right + guy.width / 2 < bounds.right) {
        guy.xTrans += guy.speed;
      }
    } else if (heldKey === 40 || heldKey === 83) {
      if (guy.bottom + guy.height / 2 < bounds.bottom) {
        guy.yTrans += guy.speed;
      }
    }
    renderGuy();
  }, guy.speedFreq);
}

function gunSelectBorder(gun) {
  guns.forEach(function (w) {
    w.imgEl.classList.remove("selected");
    w.imgEl.id = ''
  });
  gun.imgEl.classList.add("selected");
}

function gunFlash(gun) {
  const unFlash = function () {
    gunSelected.imgEl.id = "";
  };
  playAudio(gunSelected.audio);
  gunSelected.imgEl.id = "fired";
  setTimeout(unFlash, fireDelay * fireDelayMult);
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
  return y === 0 ? 0 : bounds.bottom - batDim * 3.5;
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

function newPowerUp() {
  if(defense){x = Math.floor(Math.random() * defensivePowerUps)}
  else{x = Math.floor(Math.random() * powerUpList.length)};
  powerUpEls[powerUpCount] = document.createElement("img");
  powerUpEls[powerUpCount].classList.add("power-up");
  powerUpEls[powerUpCount].src = powerUpList[x].src;
  xTrans = randomInX();
  yTrans = randomInY();
  powerUpEls[
    powerUpCount
  ].style.transform = `translate(${xTrans}px, ${yTrans}px)`;
  powerUpObjs[powerUpCount] = new PowerUp(
    powerUpList[x].name,
    powerUpList[x].effect
  );
  powerUpObjs[powerUpCount].id = powerUpCount;
  powerUpObjs[powerUpCount].checkCollision();
  mainEl.appendChild(powerUpEls[powerUpCount]);
  powerUpCount++;
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
    lifeEls[i].src = "assets/extraLife.png";
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
  clearInterval(guyMoveId);
  for (powerUpEl of powerUpEls){
    powerUpEl.remove()
  }
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
  mainEl.appendChild(modalEl);
}

function startGame() {
  init();
  initAttack();
  score = 0;
  renderScore();
  modalEl.remove();
  guyEl.style.display = "inline";
  getGuyBounds();
  releaseBats();
}
function startGameDefenseMode() {
  init();
  initDefense();
  score = 0;
  renderScore();
  modalEl.remove();
  guyEl.style.display = "inline";
  getGuyBounds();
  releaseBats();
}

function collide(arr, id) {
  if (
    arr[id].getBoundingClientRect().left <
      guyEl.getBoundingClientRect().right &&
    arr[id].getBoundingClientRect().right >
      guyEl.getBoundingClientRect().left &&
    arr[id].getBoundingClientRect().bottom >
      guyEl.getBoundingClientRect().top &&
    arr[id].getBoundingClientRect().top < guyEl.getBoundingClientRect().bottom
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
  batObjs[e.target.id].health -= guy.attack * attackMult;
  if (batObjs[e.target.id].health <= 5) {
    batEls[e.target.id].src = "assets/bat_damaged.gif";
  }
  if (batObjs[e.target.id].health <= 0) {
    batEls[e.target.id].remove();
    score++;
    playAudio(bonkAudio);
  }
  render();
}

function playAudio(audio) {
  if (sound) {
    audio.currentTime = 0;
    audio.play();
  }
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
    }, fireDelay * fireDelayMult);
  });
}

function getGuyBounds() {
  guy.left = guyEl.getBoundingClientRect().left;
  guy.right = guyEl.getBoundingClientRect().right;
  guy.top = guyEl.getBoundingClientRect().top;
  guy.bottom = guyEl.getBoundingClientRect().bottom;
}

function initAttack() {
  guy.speed = 50;
  defense = false;
  for (gun of guns) {
    gun.El.style.display = "flex";
  }
  chooseWeapon(49);
  document.removeEventListener("keydown", guyMoveDefenseMode);
  guyMove();
}

function initDefense() {
  guy.speed = 25;
  defense = true;
  for (gun of guns) {
    gun.El.style.display = "none";
  }
  document.addEventListener("keydown", guyMoveDefenseMode);
  if (guyMoveId === true) {
    clearInterval(guyMoveId);
  }
}

function toggleSound() {
  if (sound) {
    soundIconEl.src = "assets/nosound.png";
    sound = false;
  } else {
    soundIconEl.src = "assets/sound.png";
    sound = true;
  }
}

function randomInX() {
  return Math.floor(
    Math.random() * (mainEl.getBoundingClientRect().width * 0.9) +
      mainEl.getBoundingClientRect().width * 0.05
  );
}

function randomInY() {
  return Math.floor(
    Math.random() * (mainEl.getBoundingClientRect().height * 0.9) +
      mainEl.getBoundingClientRect().height * 0.05
  );
}

function invincibleFunc() {
  clearInterval(invincibleLoop)
  invincibility = true;
  guyEl.src = 'assets/guyInvincible.gif'
   invincibleLoop = setTimeout(function () {
    guyEl.src = 'assets/guy.png'
    invincibility = false;
  }, powerTime);
}


function increaseAttackFunc(x) {
  clearInterval(increaseAttackLoop)
  x = 2;
  attackMult = x;
   increaseAttackLoop = setTimeout(function () {
    attackMult = 1;
  }, powerTime);
}

function increaseFireRateFunc(x) {
  clearInterval(increaseFireRateLoop)
  x = 0.5;
  fireDelayMult = x;
   increaseFireRateLoop = setTimeout(function () {
    fireDelayMult = 1;
  }, powerTime);
}

function checkPowerUpCollision(q) {
  checkPowerUpCollisionId = setInterval(function () {
    if (collide(powerUpEls, q.id)) {
      powerUpObjs[q.id].effect();
      powerUpEls[q.id].remove();
    }
  }, 100);
}

function extraLifeFunc() {
  lives ++
  renderLives()
}

//MVP:
//clean up where variables get initialized, which are constant and which can change, group by purpose, 

// nice touches: indicator img for power ups with countdown
//heldkey mutliple keys (maybe 4 event listeners one for each key?)
//figure out how to store high score