//variables
let mousePos = [];
let gunUnflasher;
let headerHeight = 120;
let footerHeight = 75;
let borderWidth = window.innerWidth / 7;
let batCount = 0;
let batObjs = [];
let batEls = [];
let batGenFreq = 1000;
let batSpeedFreq = 50;
let lives = 3;
let score = 0;

let gunSelected

let guy = {
  speed: 25,
  width: 100,
  height: 100,
  xTrans: 0,
  yTrans: 0,
  attack: 0,
};

class Bat {
  constructor(batCount) {
    this.health = 10;
    this.speed = 10;
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
     setInterval(function () {
      q.xTrans += q.speed * xDir;
      q.yTrans += q.speed * yDir;
  
      if (onBorder(q.xTrans, q.yTrans)=== 'left' ||onBorder(q.xTrans, q.yTrans) ==='right') {
        xDir *= -1
      }
      if (onBorder(q.xTrans, q.yTrans)=== 'top' ||onBorder(q.xTrans, q.yTrans) ==='bottom') {
        yDir *= -1
      }
      renderBat();
      if (collide(q)) {
        batEls[q.id].remove();
        loseLife();
      }
    }, batSpeedFreq);
  }

  batCreate() {
    batEls[batCount] = document.createElement("img");
    batEls[batCount].classList.add("bat");
    batEls[batCount].src = "assets/bat.gif";
    batEls[batCount].id = `${batCount}`
    batEls[
      batCount
    ].style.transform = `translate(${this.xTrans}px, ${this.yTrans}px)`;
    mainEl.appendChild(batEls[batCount])
    batEls[batCount].addEventListener("click", decHealth);
    batCount++;
    render();
  }
}

//cached elements
mainEl = document.querySelector("main");
pistol = document.querySelector(".pistol");
rifle = document.querySelector(".rifle");
bazooka = document.querySelector(".bazooka");
guyEl = document.querySelector(".guy");
livesDiv = document.querySelector(".lives");
scoreEl = document.querySelector(".score");
modalEl = document.querySelector(".modal");
modalPEl = document.querySelector(".modal-p");
modalTitleEl = document.querySelector(".modal-title");
startBtnEl = document.querySelector(".start-game");
let guns = [pistol, rifle, bazooka]

//event listeners
document.addEventListener("mousemove", storeMouse);
document.addEventListener("keydown", buttonPress);
startBtnEl.addEventListener("click", startGame);

//functions
function init() {
  guy.xTrans = 0;
  guy.yTrans = 0;
  batCount = 0;
  batObjs = []
  batEls = []
  batGenFreq = 3000;
  lives = 3;
  gun = pistol
  render();
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
}

function fire(num) {
  num < 60 ? (num -= 48) : (num -= 96);
  if (num === 3) {
    gunSelect(bazooka)
   // gunFlash(bazooka)
    guy.attack = 5
  } else if (num === 2) {
    gunSelect(rifle)
    //gunFlash(rifle);
    guy.attack = 3
  } else {
    //gunFlash(pistol);
    gunSelect(pistol)
    guy.attack = 1
  }
}

function guyMove(num) {
  if (num === 37 || num === 65) {
    if (guy.xTrans > window.innerWidth * -0.5 + borderWidth) {
      guy.xTrans -= guy.speed;
      guyEl.style.transform = `translate(${guy.xTrans}px, ${guy.yTrans}px)`;
    }
  } else if (num === 38 || num === 87) {
    if (guy.yTrans > window.innerHeight * -0.5 + headerHeight) {
      guy.yTrans -= guy.speed;
      guyEl.style.transform = `translate(${guy.xTrans}px, ${guy.yTrans}px)`;
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
}
function gunSelect(gun){
  gunSelected = gun
guns.forEach(function(w){
  w.classList.remove('selected')
})
gun.classList.add('selected')
}


function gunFlash(gun) {
  const unFlash = function () {
    gun.id = ''
  };
  if (gunSelected === pistol) {
    flashInt = 100;
  }
  if (gunSelected === rifle) {
    flashInt = 500;
  }
  if (gunSelected === bazooka) {
    flashInt = 1000;
  }
  gunUnflasher = gun;
  gun.id = "fired"
  setTimeout(unFlash, flashInt);
}

function onBorder(x, y) {
  if (x < window.innerWidth * -0.5 + borderWidth) {
    return "left";
  } else if (y < 0) {
    return "top";
  } else if (x > window.innerWidth - borderWidth * 2) {
    return "right";
  } else if (y > window.innerHeight - footerHeight * 3) {
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
  while (livesDiv.firstChild) {
    livesDiv.removeChild(livesDiv.firstChild);
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
  renderLives();
  if (lives === 0) {
    gameOver();
  }
}

function gameOver() {
  clearInterval(newBats);
  for (i = 0; i < batCount; i++) {
    batEls[i].remove();
  }
  guyEl.style.display = "none";
  modalTitleEl.innerHTML = "Tarnation!";
  modalPEl.innerHTML =
    "The bats proved to be a formidable challenge, and the town's hope has dimmed in their relentless onslaught. Your valiant efforts were not in vain, but for now, darkness reigns over the Wild West. The townsfolk are counting on you to rise again and claim victory over these winged foes.";
  modalPEl.style.textAlign = "center";
  startBtnEl.innerHTML = "Play Again?";
  mainEl.appendChild(modalEl);
}

function startGame() {
  init()
  modalEl.remove();
  guyEl.style.display = "inline";
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

function renderGuy(){
  guyEl.style.transform = `translate(${guy.xTrans}px, ${guy.yTrans}px)`;

}

function decHealth(e){
gunFlash(gunSelected)
batObjs[e.target.id].health -= guy.attack
if(batObjs[e.target.id].health <= 0){
  batEls[e.target.id].remove()
  score ++
}
render()

}


init();


//MVP
//add sound

//STRETCH
//Use getClientBoundingRect() to make real borders
//add click delay for each gun
