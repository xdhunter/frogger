// global variables
var gameStarted = false;
var score = 0;
var enemyBaseSpeed = 150;
var gemLifeTime = 500;
var gemDisappearTime = 3000;
var audio = document.createElement("audio");


var Helper = {};
Helper.updateScore = function() {
    if (score < 100) {
        score += 10;
    } else {
        score += 20;
    }
    this.playSound("win");
    this.updateEnemySpeed();
};

Helper.updateEnemySpeed = function() {
    if (score === 100 || score === 200 || score  === 50) {
        enemyBaseSpeed += 5;
    } 
};

Helper.randomNumberInAS = function(a1, n, d) { // arithmetic sequence
    return Math.floor(Math.random() * n) * d + a1;
}

Helper.playSound = function(event) {
    if (event === "jump") {
        audio.src = "sounds/smw_swimming.wav";
        audio.play();
    } else if (event === "died") {
        audio.src = "sounds/Meh.m4a";
        audio.play();
    } else if (event === "win") {
        audio.src = "sounds/smw_1-up.wav";
        audio.play();
    } else if (event === "reborn") {
        audio.src = "sounds/smw_stomp.wav";
        audio.play();
    }
}

var Gemstone = function() {
    this.sprite = 'images/gem-blue.png';
    this.getNewLife();
}

Gemstone.prototype.update = function(dt) {
    if (!gameStarted)
        return;
    
    if (this.life > 0) {
        this.life--;
    } else {
        this.waitingTime++;
        if (this.waitingTime === gemDisappearTime) {
            this.getNewLife();
        }
    }
}

Gemstone.prototype.render = function() {
    if (this.life > 0) {
        ctx.drawImage(Resources.get(this.sprite), 5 + this.x, 50 + this.y, 83, 101);
    }
}

Gemstone.prototype.getNewLife = function() {
    this.life = gemLifeTime;
    this.y = Helper.randomNumberInAS(60, 3, 83);
    this.x = Helper.randomNumberInAS(0, 5, 101);
    this.waitingTime = 0;
}

Gemstone.prototype.isLive = function() {
    return this.life > 0;
}

Gemstone.prototype.pickupByPlayer = function(player) {
    if (this.x === player.x && this.y === player.y) {
        Helper.updateScore();
        Helper.playSound("getGem");
        this.life = 0;
    }
}

// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.init();
};

Enemy.prototype.init = function(x) {
    if (x === undefined) {
        this.x = Math.random() * 500;
    } else {
        this.x = 0;
    }
    this.y = Helper.randomNumberInAS(60, 3, 83);
    this.speed = Helper.randomNumberInAS(enemyBaseSpeed, 5, 30);
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed * dt;
    if (this.x > 500) {
        this.init(0);
    }
    
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

var Player = function() {
    this.sprite = "images/char-boy.png";
    this.init();
};

Player.prototype.init = function() {
    this.x = 202;
    this.y = 392;
    this.resetTimer = 0;
}

Player.prototype.setResetTimer = function() {
    this.resetTimer = 10;
}

Player.prototype.update = function() {
    if (this.resetTimer > 0) {
        this.resetTimer--;
        if (this.resetTimer === 0) {
            this.init();
            Helper.playSound("reborn");
        }
        return;
    }
   for (var i = 0; i < allEnemies.length; i++) {
       var enemy = allEnemies[i];
       if (this.y === enemy.y && enemy.x > this.x - 50 && enemy.x < this.x + 50) {
           this.setResetTimer();
           Helper.playSound("died");
       }
   }
   
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.handleInput = function(keyInput) {
    if (this.resetTimer > 0) {
        return;
    }
    
    Helper.playSound("jump");
    
    if (keyInput === "left") {
        this.x -= 101;
    } else if (keyInput === "right") {
        this.x += 101;
    } else if (keyInput === "up") {
        this.y -= 83;
    } else if (keyInput === "down") {
        this.y += 83;
    }
    
    if (this.x > 500) {
        this.x -= 101;
    } else if (this.x < 0) {
        this.x = 0;
    }
    
    if (this.y > 392) {
        this.y -= 83;
    } else if (this.y < 60) { // touched the water
        this.y = 60;
        this.setResetTimer();
        Helper.updateScore();
    }
    
    if (gem.isLive()) {
        gem.pickupByPlayer(this);
    }
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var allEnemies = [new Enemy(), new Enemy(), new Enemy(), new Enemy()];
var player = new Player();
var gem = new Gemstone();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
    
    // showing your score in text board
    document.getElementById("textBoard").innerHTML = "Your score is " + score;
    gameStarted = true;
});

function resetGame() {
    score = 0;
    enemyBaseSpeed = 150;
    gameStarted = false;
    player.init();
    gem.getNewLife();
    for(var i = 0; i < allEnemies; i++) {
        Enemy[i].init();
    }
    document.getElementById("textBoard").innerHTML = "Welcome to Frogger Game!"
}
