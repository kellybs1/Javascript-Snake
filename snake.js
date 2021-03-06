
//create the canvas
var c = document.createElement("canvas"); 
c.width = "560";
c.height = "280";
c.style = "border:1px solid #000000;";

//create score and status divs
var scoreOut = document.createElement("div");
scoreOut.setAttribute('id', 'scoreOut');
var gameStatus = document.createElement("div");
gameStatus.setAttribute('id', 'status');

//set up global variables
var scoreMain = 0;
var scoreMove = 1;
var scoreEat = 1337;
var direction;
var blockSize = 20;
var timerTick = 85;
var snakeTails = [];
//get the canvas that we set up above to draw on
//var c = document.getElementById("myCanvas");
var board = c.getContext("2d");
//load visible elements
document.getElementById("gameDiv").appendChild(c);
document.getElementById("gameDiv").appendChild(scoreOut);
document.getElementById("gameDiv").appendChild(gameStatus);
//useful positioning
var centerWidth = c.width / 2;
var centerHeight = c.height / 2;
//snake and frog objects
var snake = {
    xPos: centerWidth,
    yPos: centerWidth - blockSize,
    size: blockSize,
    colour: '#FF9933'
}
var frog = {
    xPos: 0,
    yPos: 0,
    size: blockSize,
    alive: false,
    colour: '#006600'
}

//clears the screen
function clearScreen() {
    board.clearRect(0, 0, c.width, c.height);
}

//draws a square on screen at given x and y, in the given colour
function drawBlock(xPos, yPos, fillColour) {
    board.fillStyle = fillColour;
    board.fillRect(xPos, yPos, blockSize, blockSize);
    board.strokeRect(xPos, yPos, blockSize, blockSize);
}

// Returns a random integer between min (included) and max (included)
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//picks a new spot for frog if it is not already spawned
function moveFrog() {
    if (frog.alive == false) {
        do {
            frog.xPos = getRandomIntInclusive(blockSize, c.width - (blockSize * 2));
            frog.yPos = getRandomIntInclusive(blockSize, c.height - (blockSize * 2));
            //while positions are multiples of blocksize and this position isn't inside snake
        } while ((blockSizeMultiple(frog.xPos, frog.yPos) == false) || (checkFrogSpawnClear(frog.xPos, frog.yPos) == false))
        frog.alive = true;
    }
}

//Checks that chosen spawn point isn't inside snake
function checkFrogSpawnClear(xPos, yPos) {
    var clear = true;
    for (i = 0; i < snakeTails.length; i++) {
        //match the given xpos and ypos to the current section of the tail
        if (xPos == snakeTails[i].xPos && yPos == snakeTails[i].yPos) {
            clear = false;
        }
    }
    return clear;
}

//Checks that position values are multiples of blocksize
function blockSizeMultiple(xPos, yPos) {
    var isMultiple = true;
    if (xPos % blockSize != 0 || yPos % blockSize != 0) {
        isMultiple = false;
    }
    return isMultiple;
}

//checks for snake going outside of bounds
function checkWallCollision() {
    if (snake.xPos < 0 || snake.xPos >= c.width || snake.yPos < 0 || snake.yPos >= c.height) {
        gameOver();
    }
}

//check for snake colliding with food
function checkFrogSnakeCollision() {
    if (snake.xPos == frog.xPos && snake.yPos == frog.yPos) {
        frog.alive = false;
        scoreByEating();
        growSnake();
    }
}

//adds current position to snake tail array
function growSnake() {
    snakeTails.push({
        xPos: snake.xPos,
        yPos: snake.yPos
    });
}

//draws tails of snakes
function drawSnakeTails() {
    for (i = 1; i < snakeTails.length; i++) {
        drawBlock(snakeTails[i].xPos, snakeTails[i].yPos, snake.colour);
    }
}

//moves each tail section into the position of the section ahead of it
function followSnakeTails() {
    for (i = snakeTails.length - 1; i >= 1; i--) {
        snakeTails[i].xPos = snakeTails[i - 1].xPos;
        snakeTails[i].yPos = snakeTails[i - 1].yPos;
    }
}

//check for snake colliding with self
function checkSnakeSelfCollision() {
    //do not check for collision with 1st tail block, allows "turning around" with 2-block-only snake
    for (i = 2; i < snakeTails.length; i++) {
        if (snake.xPos == snakeTails[i].xPos && snake.yPos == snakeTails[i].yPos) {
            gameOver();
        }
    }
}

//score by eating a frog
function scoreByEating() {
    scoreMain += scoreEat;
}

//score for each movement, a "lifetime" score
function scoreByMoving() {
    if (direction > 0) {
        scoreMain += scoreMove;
    }
}

//updates score display
function updateScore() {
    document.getElementById("scoreOut").innerHTML = "Score: " + scoreMain;
}

//finished by failure
function gameOver() {
    direction = 0;
    clearInterval(myTicker);
    document.getElementById("status").innerHTML = "Game Over!";
}

//moves snake in direction of current key press, used in tandem with document.body.onkeydown event
function moveSnake() {
    switch (direction) {
        case 1:
            snake.yPos -= blockSize;
            break;

        case 2:
            snake.xPos += blockSize;
            break;

        case 3:
            snake.yPos += blockSize;
            break;

        case 4:
            snake.xPos -= blockSize;
            break;
    }
    //set first array item to new current position -> tails follow this point
    setSnakeHeadPosition();
    scoreByMoving();
}

//reset snake head position in array
function setSnakeHeadPosition() {
    snakeTails[0] = {
        xPos: snake.xPos,
        yPos: snake.yPos
    };
}

//reloads page -> restarts game
function reloadPage() {
    location.reload();
}

//translates arrow keys (38,39,40,41) to direction choices 
//82 is R key for restarting game
document.body.onkeydown = function(e) {
    var event = window.event ? window.event : e;

    switch (event.keyCode) {
        case 38:
            e.preventDefault();
            direction = 1;
            break;

        case 39:
            e.preventDefault();
            direction = 2;
            break;

        case 40:
            e.preventDefault();
            direction = 3;
            break;

        case 37:
            e.preventDefault();
            direction = 4;
            break;

        case 82:
            e.preventDefault();
            reloadPage();
            break;
    }
}

//main timer event to run functions each tick
var myTicker = setInterval(tickEvents, timerTick);

function tickEvents() {
    clearScreen();
    moveSnake();
    drawBlock(snake.xPos, snake.yPos, snake.colour);
    checkSnakeSelfCollision();
    moveFrog();
    drawBlock(frog.xPos, frog.yPos, frog.colour);
    checkWallCollision();
    checkFrogSnakeCollision();
    drawSnakeTails();
    followSnakeTails();
    updateScore();
}
