/////////variables/////////
////cached elements
bodyEl = document.querySelector("body");
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
const mainEl = document.querySelector("main");

/////environment
let mousePos = []; // helpful for debugging, not in use for game
let bounds = {}; //to be filled with mainEl boundary info with getBounds()

////bat stuff
let batCount = 0;
let batObjs = []; //// to be filled with bat objects as generated (ID matches position in batEls array)
let batEls = [];
let batGenFreq = 3000;
let batSpeedFreq = 15; //frequency of motions
let batSpeedMin = 1; // pixels moved per motion
let batSpeedRange = 3;
let batMoveTimeId;
let batDim = 40; //Bat dimensions (h === w), must match .bat max-height

///state
const maxLives = 3;
let lives = maxLives;
let score = 0;
const powerTime = 10000; //Length of powerups
let defense = false; //store whether or not we are in defense mode
let sound = true; //store whether or not player wants sounds on
let inAttackMode = false;

////guy
let guyMoveId; //timer name for guyMove()
let heldKeys = []; //hold and array of keys held down to be used by guyMove attack mode
let previousKey; //Store last key pressed for preventing held keys in defense mode
const guySpeed = 15;
const guy = {
  speed: 15,
  speedFreq: 100,
  width: window.getComputedStyle(guyEl).width.slice(0, 2),
  height: window.getComputedStyle(guyEl).height.slice(0, 2),
  xTrans: 0,
  yTrans: 0,
  attack: 0,
};
////weapons
let fireDelay; //Declaring delay between shots do be changed when selecting weapon
let attackMult = 1; //Attack multiplier to be changed by power up
let fireDelayMult = 1; //fire rate multiplier to be changed by powerup
let gunSelected; //store gun selection
const bulletTime = 40; //match css .bullet transition time

///////audio
const audioMult = 2; // global audio volume multiplier
const pistolAudio = new Audio("assets/audio/pistol.mp3");
const rifleAudio = new Audio("assets/audio/rifle.mp3");
const bazookaAudio = new Audio("assets/audio/bazooka.mp3");
const bonkAudio = new Audio("assets/audio/bonk.mp3");
const hurtAudio = new Audio("assets/audio/hurt.mp3");
//mixer
pistolAudio.volume = 0.1 * audioMult;
rifleAudio.volume = 0.125 * audioMult;
bazookaAudio.volume = 0.15 * audioMult;
bonkAudio.volume = 0.225 * audioMult;
hurtAudio.volume = 0.25 * audioMult;

////powerups
let powerUpCount = 0; // keep track of powerUps generated so each new one can be assigned a unique ID
let powerUpEls = []; // to be filled with powerUp elements as generated
let powerUpObjs = []; //to be filled with power up Objects as generated (ID matches position in powerupEls array)
let invincibility = false; //store invincibility state for powerUp
let powerUpFreq = 8; // create a powerUp when this many bats have been generated
const defensivePowerUps = 2; //all powerups apply to attack mode, this many apply to defense mode. Keep defenseive power ups in beginning of powerUpEls array and adjust this number to the amount of defensive power ups.
let invincibleLoop; //declare name of powerup loop to avoid glitching
let increaseAttackLoop; //declare name of powerup loop to avoid glitching
let increaseFireRateLoop; //declare name of powerup loop to avoid glitching

//////classes///////
////Define Gun class, define guns, store in dictionary for later use
class Gun {
  constructor(fireDelay, hitPoints, name, audio, bulletColor, bulletSize) {
    this.name = name;
    this.fireDelay = fireDelay;
    this.hitPoints = hitPoints;
    this.El = document.querySelector(`.${name}`);
    this.imgEl = document.querySelector(`.${name} > img`);
    this.audio = audio;
    this.bulletColor = bulletColor;
    this.bulletSize = bulletSize;
  }
}
const pistol = new Gun(100, 3, "pistol", pistolAudio, "brown", 8);
const rifle = new Gun(350, 4, "rifle", rifleAudio, "black", 10);
const bazooka = new Gun(900, 5, "bazooka", bazookaAudio, "green", 16);
let guns = [pistol, rifle, bazooka];

////Define Bat class
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
          playAudio(bonkAudio);
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
          batEls[q.id].getBoundingClientRect().right,
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
    batEls[batCount].setAttribute("draggable", false);
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
    if (batCount % powerUpFreq === 0) {
      newPowerUp();
    }
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
  checkCollision() {
    let q = this;
    checkPowerUpCollision(q);
  }
}

const invincible = new PowerUp("invincible", invincibleFunc);
const increaseAttack = new PowerUp("increaseAttack", increaseAttackFunc);
const increaseFireRate = new PowerUp("increaseFireRate", increaseFireRateFunc);
const extraLife = new PowerUp("extraLife", extraLifeFunc);
let powerUpList = [invincible, extraLife, increaseAttack, increaseFireRate];

//////////event listeners//////////////
document.addEventListener("mousemove", storeMouse);
document.addEventListener("keydown", buttonPress);
startBtnEl.addEventListener("click", startGame);
defenseBtnEl.addEventListener("click", startGameDefenseMode);
soundIconEl.addEventListener("click", toggleSound);
document.addEventListener("keydown", printKeyCode);
document.addEventListener("keyup", printKeyCodeUP);
document.addEventListener("scroll", getBounds);
window.addEventListener("resize", getBounds);

/////////////////functions////////////////

//////initializations//////
function init() {
  getBounds(mainEl.getBoundingClientRect());
  guy.xTrans = 0;
  guy.yTrans = 0;
  batCount = 0;
  batGenFreq = 3000;
  lives = maxLives;
  render();
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

function initDefense() {
  guy.speed = guySpeed;
  defense = true;
  powerUpFreq = 5;
  for (gun of guns) {
    gun.El.style.display = "none";
  }
  document.addEventListener("keydown", guyMoveDefenseModeParser);
  if (guyMoveId === true) {
    clearInterval(guyMoveId);
  }
  introTextEl = document.createElement("h2");
  introTextEl.innerHTML = "The bats took your weapons! <br><br>RUN!!!!";
  introTextEl.classList.add("intro-text");
  mainEl.appendChild(introTextEl);
  setTimeout(function () {
    introTextEl.remove();
  }, batGenFreq);
  mainEl.style.cursor = "default";
}

function initAttack() {
  inAttackMode = true;
  mainEl.addEventListener("mousedown", shotMarker);
  mainEl.addEventListener("mousedown", bulletLaunch);
  document.addEventListener("keydown", spaceFire);
  guy.speed = guySpeed * 2;
  defense = false;
  powerUpFreq = 8;
  for (gun of guns) {
    gun.El.style.display = "flex";
  }
  chooseWeapon(49);
  document.removeEventListener("keydown", guyMoveDefenseModeParser);
  guyMove();
  introTextEl = document.createElement("h2");
  introTextEl.innerHTML = "LET'S BUST SOME BATS";
  introTextEl.classList.add("intro-text");
  mainEl.appendChild(introTextEl);
  setTimeout(function () {
    introTextEl.remove();
  }, batGenFreq);
  mainEl.style.cursor = "crosshair";
}

//////weapons//////
function buttonPress(e) {
  let key1 = e.keyCode >= 48 && e.keyCode <= 57;
  let key2 = e.keyCode >= 96 && e.keyCode <= 105;
  if (key1 || key2) {
    if (inAttackMode) {
      chooseWeapon(e.keyCode);
    }
  }
}

function chooseWeapon(num) {
  num < 60 ? (num -= 48) : (num -= 96);
  gunSelected = guns[num - 1];
  fireDelay = gunSelected.fireDelay;
  guy.attack = gunSelected.hitPoints;
  gunSelectBorder(gunSelected);
}

function gunSelectBorder(gun) {
  guns.forEach(function (w) {
    w.imgEl.classList.remove("selected");
    w.imgEl.id = "";
  });
  if (gun !== "none") {
    gun.imgEl.classList.add("selected");
  }
}

function gunFlash(gun) {
  const unFlash = function () {
    gunSelected.imgEl.id = "";
  };
  playAudio(gunSelected.audio);
  gunSelected.imgEl.id = "fired";
  setTimeout(unFlash, fireDelay * fireDelayMult);
}

function shotMarker() {
  shotMarkEl = document.createElement("div");
  shotMarkEl.classList.add("shot-marker");
  shotMarkEl.style.left = `${mousePos[0] - 10 + window.scrollX}px`;
  shotMarkEl.style.top = `${mousePos[1] - 10 + window.scrollY}px`;
  bodyEl.appendChild(shotMarkEl);
  setTimeout(function () {
    for (child of bodyEl.children) {
      if (child.classList[0] === "shot-marker") child.remove();
    }
  }, 150);
}

function delayFire() {
  batEls.forEach(function (batEl) {
    batEl.removeEventListener("mousedown", decHealth);
    mainEl.removeEventListener("mousedown", shotMarker);
    mainEl.removeEventListener("mousedown", bulletLaunch);
    document.removeEventListener("keydown", spaceFire);
    setTimeout(function () {
      batEl.addEventListener("mousedown", decHealth);
      mainEl.addEventListener("mousedown", shotMarker);
      mainEl.addEventListener("mousedown", bulletLaunch);
      document.addEventListener("keydown", spaceFire);
    }, fireDelay * fireDelayMult);
  });
}

function bulletLaunch() {
  bulletEl = document.createElement("div");
  bulletEl.classList.add("bullet");
  bodyEl.appendChild(bulletEl);
  bulletEl.style.left = `${guy.right + window.scrollX}px`;
  bulletEl.style.top = `${guy.top + (guy.height / 2 - 4) + window.scrollY}px`;
  bulletEl.style.backgroundColor = gunSelected.bulletColor;
  bulletEl.style.width = `${gunSelected.bulletSize * 1.5}px`;
  bulletEl.style.height = `${gunSelected.bulletSize}px`;
  if (mousePos[0] < guy.right) {
    bulletEl.style.transform = `rotate(.5turn)`;
  }
  setTimeout(function () {
    bulletEl.style.left = `${mousePos[0] - 10 + window.scrollX}px`;
    bulletEl.style.top = `${mousePos[1] - 10 + window.scrollY}px`;
    setTimeout(function () {
      for (child of bodyEl.children) {
        if (child.classList[0] === "bullet") child.remove();
      }
    }, bulletTime);
  }, bulletTime);
}

function spaceFire(e) {
  if (e.keyCode === 32) {
    bulletLaunch();
    shotMarker();
    for (batEl of batEls) {
      if (
        mousePos[0] < batEl.getBoundingClientRect().right + window.scrollX &&
        mousePos[0] > batEl.getBoundingClientRect().left + window.scrollX &&
        mousePos[1] > batEl.getBoundingClientRect().top + window.scrollY &&
        mousePos[1] < batEl.getBoundingClientRect().bottom + window.scrollY
      ) {
        decHealth(batEl.id);
      }
    }
  }
}

//////moving the guy/////
function guyMoveDefenseMode(e) {
  num = e;
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

function guyMoveDefenseModeParser(e) {
  keyPressed = e.keyCode;
  if (keyPressed !== previousKey) {
    previousKey = keyPressed;
    guyMoveDefenseMode(keyPressed);
  }
}

//ATTACK MODE ONLY
function guyMove() {
  guyMoveId = setInterval(function () {
    getGuyBounds();
    if (heldKeys.includes(37) || heldKeys.includes(65)) {
      if (guy.left - guy.width / 2 > bounds.left) {
        guy.xTrans -= guy.speed;
      }
    }
    if (heldKeys.includes(38) || heldKeys.includes(87)) {
      if (guy.top > bounds.top) {
        guy.yTrans -= guy.speed;
      }
    }
    if (heldKeys.includes(39) || heldKeys.includes(68)) {
      if (guy.right + guy.width / 2 < bounds.right) {
        guy.xTrans += guy.speed;
      }
    }
    if (heldKeys.includes(40) || heldKeys.includes(83)) {
      if (guy.bottom + guy.height / 2 < bounds.bottom) {
        guy.yTrans += guy.speed;
      }
    }
    renderGuy();
  }, guy.speedFreq);
}

function getGuyBounds() {
  guy.left = guyEl.getBoundingClientRect().left;
  guy.right = guyEl.getBoundingClientRect().right;
  guy.top = guyEl.getBoundingClientRect().top;
  guy.bottom = guyEl.getBoundingClientRect().bottom;
}

///////detections//////
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
  return y === 0 ? 0 : bounds.height - batDim;
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

//////bat stuff//////
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

/////powerUps/////
function newPowerUp() {
  if (defense) {
    x = Math.floor(Math.random() * defensivePowerUps);
  } else {
    x = Math.floor(Math.random() * powerUpList.length);
  }
  powerUpEls[powerUpCount] = document.createElement("img");
  powerUpEls[powerUpCount].classList.add("power-up");
  powerUpEls[powerUpCount].src = powerUpList[x].src;
  xTrans = randomInX();
  yTrans = randomInY();
  powerUpObjs[powerUpCount] = new PowerUp(
    powerUpList[x].name,
    powerUpList[x].effect
  );
  powerUpEls[
    powerUpCount
  ].style.transform = `translate(${xTrans}px, ${yTrans}px)`;
  powerUpObjs[powerUpCount].id = powerUpCount;
  powerUpObjs[powerUpCount].checkCollision();
  mainEl.appendChild(powerUpEls[powerUpCount]);
  powerUpCount++;
}

////////renders//////
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
function renderGuy() {
  guyEl.style.transform = `translate(${guy.xTrans}px, ${guy.yTrans}px)`;
}

//////state changes/////
function loseLife() {
  lives -= 1;
  playAudio(hurtAudio);
  renderLives();
  if (lives === 0) {
    gameOver();
  }
}

function gameOver() {
  inAttackMode = false;
  gunSelectBorder("none");
  mainEl.removeEventListener("mousedown", bulletLaunch);
  document.removeEventListener("keydown", spaceFire);
  clearInterval(newBats);
  clearInterval(guyMoveId);
  for (powerUpEl of powerUpEls) {
    powerUpEl.remove();
  }
  for (i = 0; i < batCount; i++) {
    batEls[i].remove();
  }
  init();
  mainEl.removeEventListener("mousedown", shotMarker);
  lives = 0;
  renderLives();
  guyEl.style.display = "none";
  modalTitleEl.innerHTML = "Tarnation!";
  modalPEl.innerHTML =
    "The bats proved to be a formidable challenge, and the town's hope has dimmed in their relentless onslaught. Your valiant efforts were not in vain, but for now, darkness reigns over the Wild West. The townsfolk are counting on you to rise again and claim victory over these winged foes.<br> <br> <br><h2>Play Again?</h2> ";
  modalPEl.style.textAlign = "center";
  mainEl.appendChild(modalEl);
}

function decHealth(e) {
  if (typeof e === "object") {
    id = e.target.id;
  } else {
    id = e;
  }
  gunFlash();
  delayFire();
  batObjs[id].health -= guy.attack * attackMult;
  if (batObjs[id].health <= 5) {
    batEls[id].src = "assets/bat_damaged.gif";
  }
  if (batObjs[id].health <= 0) {
    batEls[id].remove();
    score++;
    playAudio(bonkAudio);
  }
  bulletLaunch();
  render();
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

//////do things, get values/////
function getBounds() {
  main = mainEl.getBoundingClientRect();
  bounds = {
    right: main.right,
    left: main.left,
    top: main.top,
    bottom: main.bottom,
    width: main.width,
    height: main.height,
  };
}

function playAudio(audio) {
  if (sound) {
    audio.currentTime = 0;
    audio.play();
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

//////power ups
function invincibleFunc() {
  clearInterval(invincibleLoop);
  invincibility = true;
  powerUpText("I'm invincible!");
  guyEl.src = "assets/guyInvincible.gif";
  invincibleLoop = setTimeout(function () {
    guyEl.src = "assets/guy.png";
    invincibility = false;
  }, powerTime);
}

function increaseAttackFunc() {
  clearInterval(increaseAttackLoop);
  powerUpText("Attack increased!");
  attackMult = 2;
  increaseAttackLoop = setTimeout(function () {
    attackMult = 1;
  }, powerTime);
}

function increaseFireRateFunc() {
  clearInterval(increaseFireRateLoop);
  powerUpText("Fire rate increased!");
  fireDelayMult = 0.5;
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
  lives++;
  powerUpText("Extra life!");
  renderLives();
}

function powerUpText(text) {
  textEl = document.createElement("h2");
  textEl.classList.add("power-up-text");
  textEl.innerHTML = text;
  bodyEl.appendChild(textEl);
  textEl.style.left = `${guy.left}px`;
  textEl.style.top = `${guy.top - guy.height / 2}px`;
  setTimeout(function () {
    for (child of bodyEl.children) {
      if (child.classList[0] === "power-up-text") child.remove();
    }
  }, 2000);
}

////handle events/////
function printKeyCode(e) {
  if (!heldKeys.includes(e.keyCode)) {
    heldKeys.push(e.keyCode);
  }
}

function printKeyCodeUP(e) {
  heldKeys.splice(heldKeys.indexOf(e.keyCode), 1);
}

function storeMouse(e) {
  mousePos[0] = e.clientX;
  mousePos[1] = e.clientY;
}

//animate smaller version of gun moving to guy when selected, moves with him
//update favicon to bat img
