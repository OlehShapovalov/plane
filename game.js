window.onload = init;

// creating a map
var map;
var ctxMap;

// creating a player
var pl;
var ctxPl;

// creating a enemy
var enemyCvs;
var ctxEnemy;

var stats;
var ctxStats;

var drawBtn;
var clearBtn;

// game board size
var gameWidth = 800;
var gameHeight = 500;

// add images
var background = new Image();
background.src = "bg.png";

var background1 = new Image();
background1.src = "bg.png";

var tiles = new Image();
tiles.src = "tiles.png";

var player;
var enemies = [];

var isPlaying;
var health;

var mapX = 0;
var map1X = gameWidth;

// for creating enemies
var spawnInterval;
var spawnTime = 6000;
var spawnAmount = 10;

var mouseX;
var mouseY;

var mouseControl = false;

var requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame; //for each browser

// initialize variables
function init () {
    map = document.getElementById("map");
    ctxMap = map.getContext("2d");

    pl = document.getElementById("player");
    ctxPl = pl.getContext("2d");

    enemyCvs = document.getElementById("enemy");
    ctxEnemy = enemyCvs.getContext("2d");

    stats = document.getElementById("stats");
    ctxStats = stats.getContext("2d");

    map.width = gameWidth;
    map.height = gameHeight;
    pl.width = gameWidth;
    pl.height = gameHeight;
    enemyCvs.width = gameWidth;
    enemyCvs.height = gameHeight;
    stats.width = gameWidth;
    stats.height = gameHeight;

    ctxStats.fillStyle = "#3D3D3D";
    ctxStats.font = "bold 15pt Arial";

    drawBtn = document.getElementById("drawBtn");
    clearBtn = document.getElementById("clearBtn");

    drawBtn.onclick = drawRect;
    clearBtn.onclick = clearRect;
    /*drawBtn.addEventListener ("click", drawRect, false);
    clearBtn.addEventListener ("click", clearRect, false);*/

    player = new Player();

    resetHealth();

    startLoop();

    document.onmousemove = mouseMove;
    document.addEventListener("click", mouseClick, false);
    document.onkeydown = checkKeyDown;
    document.onkeyup = checkKeyUp;
}

function mouseMove (e) {
    if (!mouseControl) {
        return;
    }
    mouseX = e.pageX - map.offsetLeft;
    mouseY = e.pageY - map.offsetTop;
    player.drawX = mouseX - player.width/2;
    player.drawY = mouseY - player.height/2;

    document.getElementById("gameName").innerHTML = "X: " + mouseX + " Y: " + mouseY;
}

function mouseClick (e) {
    if (!mouseControl) {
        return;
    }
    document.getElementById("gameName").innerHTML = "Clicked";
}

function resetHealth () {
    health = 10;
}

function spawnEnemy (count) {
    for (var i=0; i<count; i++) {
        enemies[i] = new Enemy();
    }
}

function startCreatingEnemies() {
    stopCreatingEnemies();
    spawnInterval = setInterval(function()
    {
        spawnEnemy(spawnAmount)
    }, spawnTime);
}

function stopCreatingEnemies () {
    clearInterval(spawnInterval);
}

function loop () {
    if (isPlaying) {
        draw();
        update();
        requestAnimFrame(loop); // for all browsers
    }
}

function startLoop () {
    isPlaying = true;
    loop();
    startCreatingEnemies();
}

function stopLoop () {
    isPlaying = false;
}

function draw() {
    player.draw();
    clearCtxEnemy();
    for (var i=0; i<enemies.length; i++) {
        enemies[i].draw();
    }
}

function update () {
    moveBg();
    drawBg();
    updateStats();
    player.update();
    for (var i=0; i<enemies.length; i++) {
        enemies[i].update();
    }
}

function moveBg () {
    var vel = 4;
    mapX -= 4;
    map1X -= 4;
    if (mapX+gameWidth<0) {
        mapX = gameWidth-4;
    }
    if (map1X+gameWidth<0) {
        map1X = gameWidth-4;
    }
}

// objects
function Player() {
    this.srcX = 0;
    this.srcY = 0;
    this.drawX = 0;
    this.drawY = 0;
    this.width = 86;
    this.height = 70;
    this.speed = 5;

    // for keys
    this.isUp = false;
    this.isDown = false;
    this.isRight = false;
    this.isLeft = false;
}

function Enemy () {
    this.srcX = 0;
    this.srcY = 70;
    this.drawX = Math.floor(Math.random()* gameWidth) + gameWidth;
    this.drawY = Math.floor(Math.random()* gameHeight);
    this.width = 96;
    this.height = 23;
    this.speed = 8;
}

// draw the enemy on the map
Enemy.prototype.draw = function () {
    ctxEnemy.drawImage(tiles, this.srcX, this.srcY, this.width, this.height,
        this.drawX, this.drawY, this.width, this.height);
};
Enemy.prototype.update = function () {
    this.drawX -= 7; // enemy's speed
    if (this.drawX + this.width < 0) {
        this.destroy();
    }
};

Enemy.prototype.destroy = function () {
    enemies.splice(enemies.indexOf(this),1);
};

// draw the player on the map
Player.prototype.draw = function () {
    clearCtxPlayer();
    ctxPl.drawImage(tiles, this.srcX, this.srcY, this.width, this.height,
        this.drawX, this.drawY, this.width, this.height);
};
Player.prototype.update = function () {

    if (health < 0) {
        resetHealth();
    }

    if (this.drawX < 0) {
        this.drawX = 0;
    }
    if (this.drawX > gameWidth - this.width) {
        this.drawX = gameWidth - this.width;
    }
    if (this.drawY < 0) {
        this.drawY = 0;
    }
    if (this.drawY > gameHeight - this.height) {
        this.drawY = gameHeight - this.height;
    }

    for (var i=0; i<enemies.length; i++) {
        if (this.drawX >= enemies[i].drawX &&
            this.drawY >= enemies[i].drawY &&
            this.drawX <= enemies[i].drawX + enemies[i].width &&
            this.drawY <= enemies[i].drawY + enemies[i].height) {
            health--;
        }
    }
    this.chooseDir();
};

Player.prototype.chooseDir = function () {
    if (this.isUp) {
        this.drawY -= this.speed;
    }
    if (this.isDown) {
        this.drawY += this.speed;
    }
    if (this.isRight) {
        this.drawX += this.speed;
    }
    if (this.isLeft) {
        this.drawX -= this.speed;
    }
};

function checkKeyDown (e) {
    var keyID = e.keyCode || e.which;

    if(keyID == 38){
        player.isUp = true;
        e.preventDefault();
    }
    if(keyID == 40){
        player.isDown = true;
        e.preventDefault();
    }
    if(keyID == 37){
        player.isLeft = true;
        e.preventDefault();
    }
    if(keyID == 39){
        player.isRight = true;
        e.preventDefault();
    }
}

function checkKeyUp (e) {
    var keyID = e.keyCode || e.which;

    if(keyID == 38){
        player.isUp = false;
        e.preventDefault();
    }
    if(keyID == 40){
        player.isDown = false;
        e.preventDefault();
    }
    if(keyID == 37){
        player.isLeft = false;
        e.preventDefault();
    }
    if(keyID == 39){
        player.isRight = false;
        e.preventDefault();
    }
}

function drawRect () {
    ctxMap.fillStyle = "3D3D3D";
    ctxMap.fillRect (10, 10, 100, 100);
}

function clearRect () {
    ctxMap.clearRect(0, 0, 800, 500);
}

// cleans all the region of moving Player
function clearCtxPlayer () {
    ctxPl.clearRect(0, 0, gameWidth, gameHeight);
}

// cleans all the region of moving Enemy
function clearCtxEnemy () {
    ctxEnemy.clearRect(0, 0, gameWidth, gameHeight);
}

function updateStats () {
    ctxStats.clearRect(0, 0, gameWidth, gameHeight);
    ctxStats.fillText("Health: " + health, 10,20);
}

function drawBg () {
    ctxMap.clearRect(0, 0, gameWidth, gameHeight);
    ctxMap.drawImage(background, 0, 0, 800, 500, // the numbers associated with the image
        mapX, 0, gameWidth, gameHeight); // numbers responsible for the location of the object on the stage
    ctxMap.drawImage(background1, 0, 0, 800, 500,
        map1X, 0, gameWidth, gameHeight);
}
