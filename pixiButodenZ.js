/**********************************************************************
 * This .js file contains all of the pixi.js code to run & render the
 * Pixi Butoden Z game.
 * 
 * @author - Spencer Keeton
 * @version - v1.1
 * @date - April 20th, 2021
 * 
 * CIS 367-01
**********************************************************************/

//Load game font
var font = new FontFaceObserver("retroGamingFont");
font.load().then(function () {
    console.log("Font is available.");
}, function() {
    console.log("Font is not availale.");
});

//Health text style
let hpStyle = new PIXI.TextStyle({
    fontFamily: "retroGamingFont",
    fontSize: 20,
    dropShadow: true,
    dropShadowAlpha: 0.6,
    dropShadowAngle: 8,
    dropShadowBlur: 4,
    drowdpShadowDistance: 3
});

//Game over win/loss text style
let gameOverStyle = new PIXI.TextStyle({
    fontFamily: "retroGamingFont",
    fontSize: 40,
    dropShadow: true,
    dropShadowAlpha: 0.6,
    dropShadowAngle: 8,
    dropShadowBlur: 4,
    dropShadowDistance: 3
});

//"-- GAME"/"PIXI" text style
let gameOverGameStyle = new PIXI.TextStyle({
    fontFamily: "retroGamingFont",
    fontSize: 40,
    fill: "#F2EB1D",
    strokeThickness: 7,
    dropShadow: true,
    dropShadowAlpha: 0.6,
    dropShadowAngle: 8,
    dropShadowBlur: 4,
    dropShadowDistance: 3
});

//"OVER --"/"BUTODEN" text style
let gameOverOverStyle = new PIXI.TextStyle({
    fontFamily: "retroGamingFont",
    fontSize: 40,
    fill: "#E30E0E",
    strokeThickness: 7,
    dropShadow: true,
    dropShadowAlpha: 0.6,
    dropShadowAngle: 8,
    dropShadowBlur: 4,
    dropShadowDistance: 3
});

//"Play Again?"/"Start Game" buttons text style
let playAgainStyle = new PIXI.TextStyle({
    fontFamily: "retroGamingFont",
    fontSize: 30,
    dropShadow: true,
    dropShadowAlpha: 0.6,
    dropShadowAngle: 8,
    dropShadowBlur: 4,
    dropShadowDistance: 3
});

//"Created By" text style
let createdByStyle = new PIXI.TextStyle({
    fontFamily: "retroGamingFont",
    fontSize: 15,
    dropShadow: true,
    dropShadowAlpha: 0.6,
    dropShadowAngle: 8,
    dropShadowBlur: 4,
    dropShadowDistance: 3
});


/* Constants */

//Speed of ki blasts
const KI_SPEED = 10;

//Constant used in calculating the paralax speed
const BG_SPEED = 1;

//Player
const PLAYER = "player";

//Enemy (AI)
const ENEMY = "enemy";

//Win/Lose conditions
const WIN = 1;
const LOSE = 0;

/* Variables */

//Application canvas
let app;

//Gameplay container (health & sprites)
let gameScene;

//Variables for sprites/background
let skyBG, mountainScroll, cloudScroll, player, enemy, healthBar, dragonBallGO, dragonBallStart, zLogo;

//Variables for the health bars
let playerHealthBar, enemyHealthBar, playerHealthBorder, enemyHealthBorder, playerHpText, enemyHpText;

//Variables for health
let playerHp = 500;
let enemyHp = 500;

//Variable used in calculating parallax
let bgX = 0;

//Array to store the keyboard key codes
let keys = {};

//Array that stores player ki blast entities
let playerKiBlasts = [];

//Array that stores AI ki blast entities
let enemyKiBlasts = [];

//AI hit indicator
let enemyHit = false;

//Player hit indicator
let playerHit = false;

//Variable for the AI ki fire timer
let timer;

//Variable to limit player ki fire
let kiTimeCount = 0;

//Start screen variables
let startScreen, startScreenPixiText, startScreenButodenText, startScreenButton,
    startScreenButtonText, startScreenBorder, startScreenBox;

//Variable for game over
let gameOver = false;

//Game over screen variables
let gameOverScreen, gameOverGameText, gameOverOverText, winScreen, loseScreen,
    perfectWinScreen, perfectLossScreen;

//Play again container & variables
let playAgain, playAgainText, playAgainBorder, playAgainBox;

//"Created By" text variables
let createdByText, classSectionText, dateVersionText;


//I DO NOT OWN ANY MUSIC OR SOUNDS USED
//THIS MUSIC IS BEING USED FOR AN EDUCATIONAL/PERSONAL PROJECT
//AS WELL AS PURE ENTERTAINMENT
//IT IS NOT MEANT FOR PAID/COMMERCIAL DISTRIBUTION
//MUSIC IS PROPERTY OF BANDAI NAMCO/AKATSUKI INC.
//ALL SOUNDS ARE PROPERTY OF TOEI ANIMATION

//Music/sound variables
const titleMusic = PIXI.sound.Sound.from("audio/DokkanButodenHome.ogg");
const gameMusic = PIXI.sound.Sound.from("audio/DokkanButodenTitle.ogg");
const startSound = PIXI.sound.Sound.from("audio/ScouterBlip.ogg");
const kiBlastSound = PIXI.sound.Sound.from("audio/KiBlast.ogg");
const hit1Sound = PIXI.sound.Sound.from("audio/hit1.ogg");
const hit2Sound = PIXI.sound.Sound.from("audio/hit2.ogg");
const hit3Sound = PIXI.sound.Sound.from("audio/hit3.ogg");
const hit4Sound = PIXI.sound.Sound.from("audio/hit4.ogg");
const hit5Sound = PIXI.sound.Sound.from("audio/hit5.ogg");
const hit6Sound = PIXI.sound.Sound.from("audio/hit6.ogg");


//Initial window onload; loads the canvas & eventListeners
//and runs the initGame function
window.onload = function (){
    app = new PIXI.Application({
        width: 1024,
        height: 720,
        backgroundColor: 0xAAAAAA
    });

    document.querySelector("#gameDiv").appendChild(app.view);
    document.querySelector("#gameDiv").addEventListener("pointerdown", playerFireKi);

    app.loader
        .add("images/pixiButodenZ.json");
    app.loader.onComplete.add(initGame);
    app.loader.load();

    //Add keyboard eventListeners
    window.addEventListener("keydown", keysDown);
    window.addEventListener("keyup", keysUp);
}


//Function to run the game
function gameLoop(delta){
    //Update parallax backgrounds
    updateBg();

    if(gameOver == false){
        //Move the AI character
        contain(player, {x: 15, y: 35, width: 895, height: 680});
        
        //Move AI
        enemy.y += enemy.vy;
        
        //Keep the AI character contained & reverse movement
        let aiHitsWall = contain(enemy, {x: 15, y: 35, width: 1009, height: 680});
        if(aiHitsWall == "top" || aiHitsWall == "bottom"){
            enemy.vy *= -1;
        }

        //Reduce enemy.alpha to indicate a hit
        if(enemyHit){
            enemy.alpha = 0.5;
            enemyHit = false;
            healthManager(ENEMY);
        }else{
            enemy.alpha = 1;
        }

        //Reduce player.alpha to indicate a hit
        if(playerHit){
            player.alpha = 0.5;
            playerHit = false;
            healthManager(PLAYER);
        }else{
            player.alpha = 1;
        }
        
        /* Keyboard Movement */
        //W
        if(keys["87"]){
            player.y -= 5;
        }
        //A
        if(keys["65"]){
            player.x -= 5;
        }
        //S
        if(keys["83"]){
            player.y += 5;
        }
        //D
        if(keys["68"]){
            player.x += 5;
        }
        
        //Update ki blasts for the player
        playerUpdateKi(delta);

        //Update ki blasts for the AI
        enemyUpdateKi(delta);

        //Handle collision
        collisionHandler();

        PIXI.timerManager.update();
    }
}


//Function to initialize the game (values, sprites, etc.)
function initGame(){
    //Initialize gameOver to false
    gameOver = false;


    /* Load in sprites */

    //Create spritesheet
    let sheet = app.loader.resources["images/pixiButodenZ.json"].textures;
    
    //Sky background
    skyBG = new PIXI.Sprite(sheet["Sky_BG.png"]);
    app.stage.addChild(skyBG);
    
    //Mountain parallax
    mountainScroll = new PIXI.TilingSprite(sheet["MountainScroll.png"], 1051, 276);
    mountainScroll.y = 461;
    app.stage.addChild(mountainScroll);

    //Cloud parallax
    cloudScroll = new PIXI.TilingSprite(sheet["CloudScroll.png"], 1356, 317);
    cloudScroll.y = 50;
    app.stage.addChild(cloudScroll);

    gameScene = new PIXI.Container();
    app.stage.addChild(gameScene);
    gameScene.visible = true;

    //Main player sprite
    player = new PIXI.Sprite(sheet["Goku_Player.png"]);
    player.x = 68;
    player.y = app.view.height / 2 - player.height / 2;
    gameScene.addChild(player);

    //AI sprite
    enemy = new PIXI.Sprite(sheet["Vegeta_DokkanButoden_AI.png"]);
    enemy.x = 910;
    enemy.y = app.view.height / 2 - enemy.height / 2;
    enemy.vy = 2.5;
    gameScene.addChild(enemy);


    /* Health Bar Setup */

    //Create the player & AI health bars
    createHealthBar();

    //Create the player health text
    playerHpText = new PIXI.Text("500 / 500 HP", hpStyle);
    playerHpText.position.set(320, 5);
    gameScene.addChild(playerHpText);

    //Create the AI health text
    enemyHpText = new PIXI.Text("500 / 500 HP", hpStyle);
    enemyHpText.position.set(545, 5);
    gameScene.addChild(enemyHpText);

    /* Start Screen Setup */
    
    //Hide the gameScene
    gameScene.visible = false;

    //Start title music
    //(must click screen to start music, stupid chrome thing)
    titleMusic.play({
        loop: true,
        volume: 0.05
    });

    //Start screen
    startScreen = new PIXI.Container();
    app.stage.addChild(startScreen);
    startScreen.visible = true;
    startScreenPixiText = new PIXI.Text("PIXI", gameOverGameStyle);
    startScreenPixiText.position.set(283, 275);
    startScreenButodenText = new PIXI.Text("BUTODEN", gameOverOverStyle);
    startScreenButodenText.position.set(475, 275);
    startScreen.addChild(startScreenPixiText);
    startScreen.addChild(startScreenButodenText);
    //Dragon Ball
    dragonBallStart = new PIXI.Sprite(sheet["DragonBall4.png"]);
    dragonBallStart.position.set(409, 271);
    startScreen.addChild(dragonBallStart);
    //Z Logo
    zLogo = new PIXI.Sprite(sheet["Z_logo.png"]);
    zLogo.position.set(700, 275);
    startScreen.addChild(zLogo);
    //"Created By" text
    createdByText = new PIXI.Text("Game Created By:\nSpencer Keeton", createdByStyle);
    createdByText.position.set(5, 650);
    classSectionText = new PIXI.Text("CIS 367-01 Semester Project", createdByStyle);
    classSectionText.position.set(745, 695);
    dateVersionText = new PIXI.Text("April 20th, 2021   v1.1", createdByStyle);
    dateVersionText.position.set(5, 695);
    startScreen.addChild(createdByText);
    startScreen.addChild(classSectionText);
    startScreen.addChild(dateVersionText);

    //Start screen button
    startScreenButton = new PIXI.Container();
    startScreen.addChild(startScreenButton);

    //Start button border
    startScreenBorder = new PIXI.Graphics();
    startScreenBorder.position.set(398, 382);
    startScreenBorder.beginFill(0xFFFFFF);
    startScreenBorder.drawRect(0, 0, 238, 53);
    startScreenBorder.endFill();
    startScreenButton.addChild(startScreenBorder);
    startScreenBorder.alpha = 1;

    //Start button box
    startScreenBox = new PIXI.Graphics();
    startScreenBox.position.set(403, 387);
    startScreenBox.beginFill(0x999897);
    startScreenBox.drawRect(0, 0, 228, 43);
    startScreenBox.endFill();
    startScreenButton.addChild(startScreenBox);
    startScreenBox.alpha = 1;
    startScreenBox.buttonMode = true;
    startScreenBox.interactive = true;
    startScreenBox.click = startGame;

    //Start screen button text
    startScreenButtonText = new PIXI.Text("Start Game", playAgainStyle);
    startScreenButtonText.position.set(415, 387);
    startScreenButton.addChild(startScreenButtonText);


    /* Game Over Screen Setup */

    //Game over screen
    gameOverScreen = new PIXI.Container();
    app.stage.addChild(gameOverScreen);
    gameOverScreen.visible = false;
    gameOverGameText = new PIXI.Text("-- GAME", gameOverGameStyle);
    gameOverGameText.position.set(290, 270);
    gameOverOverText = new PIXI.Text("OVER --", gameOverOverStyle);
    gameOverOverText.position.set(555, 270);
    gameOverScreen.addChild(gameOverGameText);
    gameOverScreen.addChild(gameOverOverText);
    //Dragon Ball
    dragonBallGO = new PIXI.Sprite(sheet["DragonBall4.png"]);
    dragonBallGO.position.set(484, 267);
    gameOverScreen.addChild(dragonBallGO);
    
    //Win text
    winScreen = new PIXI.Text("You win!", gameOverStyle);
    winScreen.position.set(415, 335);
    gameOverScreen.addChild(winScreen);
    winScreen.visible = false;

    //Perfect win text
    perfectWinScreen = new PIXI.Text("Perfect Win!", gameOverStyle);
    perfectWinScreen.position.set(358, 335);
    gameOverScreen.addChild(perfectWinScreen);
    perfectWinScreen.visible = false;

    //Lose text
    loseScreen = new PIXI.Text("You lose!", gameOverStyle);
    loseScreen.position.set(400, 335);
    gameOverScreen.addChild(loseScreen);
    loseScreen.visible = false;

    //Perfect loss text
    perfectLossScreen = new PIXI.Text("Perfect Loss!", gameOverStyle);
    perfectLossScreen.position.set(343, 335);
    gameOverScreen.addChild(perfectLossScreen);
    perfectLossScreen.visible = false;


    /* Play Again Button Setup */

    //Play Again button
    playAgain = new PIXI.Container();
    gameOverScreen.addChild(playAgain);

    //Play Again button border
    playAgainBorder = new PIXI.Graphics();
    playAgainBorder.position.set(393, 412);
    playAgainBorder.beginFill(0xFFFFFF);
    playAgainBorder.drawRect(0, 0, 238, 53);
    playAgainBorder.endFill();
    playAgain.addChild(playAgainBorder);
    playAgainBorder.alpha = 1;

    //Play Again button box
    playAgainBox = new PIXI.Graphics();
    playAgainBox.position.set(398, 417);
    playAgainBox.beginFill(0x999897);
    playAgainBox.drawRect(0, 0, 228, 43);
    playAgainBox.endFill();
    playAgain.addChild(playAgainBox);
    playAgainBox.alpha = 1;
    playAgainBox.buttonMode = false;
    playAgainBox.interactive = false;

    //Play Again button text
    playAgainText = new PIXI.Text("Play Again?", playAgainStyle);
    playAgainText.position.set(403, 415);
    playAgain.addChild(playAgainText);

    //Run game loop (render game)
    app.ticker.add(gameLoop);
}



/* Game Condition Functions */

//Function to end the game upon player or AI losing all health
function endGame(condition){
    //Turn off the gameplay attributes
    timer.stop();
    
    //Remove excess ki blasts
    for (let i = 0; i < playerKiBlasts.length; i++){
        gameScene.removeChild(playerKiBlasts[i]);
    }
    for (let i = 0; i < enemyKiBlasts.length; i++){
        gameScene.removeChild(enemyKiBlasts[i]);
    }
    playerKiBlasts = [];
    enemyKiBlasts = [];

    //Hide game scene
    gameScene.visible = false;

    //Set the proper game over condition text (Win/Lose)
    //If the player has full health, then "Perfect Win"
    //If the AI has full health, then "Perfect Loss"
    if(condition == WIN && playerHp == 500){
        gameOverScreen.visible = true;
        perfectWinScreen.visible = true;
    }else if(condition == WIN){
        gameOverScreen.visible = true;
        winScreen.visible = true;
    }else if(condition == LOSE && enemyHp == 500){
        gameOverScreen.visible = true;
        perfectLossScreen.visible = true;
    }else if(condition == LOSE){
        gameOverScreen.visible = true;
        loseScreen.visible = true;
    }

    //Hide health bars
    gameScene.removeChild(playerHealthBar);
    gameScene.removeChild(enemyHealthBar);
    gameScene.removeChild(playerHealthBorder);
    gameScene.removeChild(enemyHealthBorder);

    //Stop player and AI movements
    player.vx = 0;
    player.vy = 0;
    enemy.vx = 0;
    enemy.vy = 0;

    //Make play again button interactive
    playAgainBox.buttonMode = true;
    playAgainBox.interactive = true;
    playAgainBox.click = restartGame;
}

//Function to restart the game upon "Play Again?" button click
function restartGame(){
    //Restart button sound effect
    startSound.play({
        volume: 0.05
    });

    //Re-initialize the game
    gameOver = false;

    //Make the gameplay attributes visible again
    gameScene.visible = true;

    //Set game over screen items to not visible
    gameOverScreen.visible = false;
    winScreen.visible = false;
    loseScreen.visible = false;
    perfectWinScreen.visible = false;
    perfectLossScreen.visible = false;
    playAgainBox.buttonMode = false;
    playAgainBox.interactive = false;

    //Reset player and AI health
    playerHp = 500;
    enemyHp = 500;

    //Re-create health bars
    createHealthBar();
    playerHpText.text = "500 / 500 HP";
    enemyHpText.text = "500 / 500 HP";

    //Restart AI ki timer
    timer = PIXI.timerManager.createTimer(800);
    timer.on('start', function(elapsed){});
    timer.on('end', function(elapsed){
    if(elapsed === 800){
        //Fire AI key
        enemyFireKi();

        //Play ki fire sound effect
        kiBlastSound.play({
            volume: 0.05
        });
        this.reset(); //Reset the timer
        this.time = 800;
        this.start(); //And start again
    }else{}
    });
    timer.start();

    //Reset player position
    player.x = 68;
    player.y = app.view.height / 2 - player.height / 2;

    //Reset AI position and movement
    enemy.x = 910;
    //Randomly start the AI higher or lower than player
    if((Math.floor(Math.random() * 101)) % 2 == 0){
        enemy.y = (app.view.height / 2 - enemy.height / 2) - 75;
    }else{
        enemy.y = (app.view.height / 2 - enemy.height / 2) + 75;
    }
    enemy.vy = 2.5;
}

//Function to start the game upon "Start Game" button click
function startGame(){
    //Stop title screen music
    titleMusic.stop();

    //Start button sound effect
    startSound.play({
        volume: 0.05
    });

    //Start game background music
    gameMusic.play({
        loop: true,
        volume: 0.05
    });

    //Timer for AI ki firing
    timer = PIXI.timerManager.createTimer(800);
    timer.on('start', function(elapsed){});
    timer.on('end', function(elapsed){
    if(elapsed === 800){
        //Fire AI ki
        enemyFireKi();

        //Play ki fire sound effect
        kiBlastSound.play({
            volume: 0.05
        });
        this.reset(); //Reset the timer
        this.time = 800;
        this.start(); //And start again
    }else{}
    });
    timer.start();

    //Hide the start screen and show the game
    gameScene.visible = true;
    startScreen.visible = false;

    //Start AI movement
    enemy.vy = 2.5;

    //Disable the start button
    startScreenBox.buttonMode = true;
    startScreenBox.interactive = true;
}



/* Helper Functions */

//Function to update the parallax backgrounds
function updateBg(){
    //Parallax initial speed
    bgX = (bgX - BG_SPEED);

    //Mountain parallax speed
    mountainScroll.tilePosition.x = bgX / 2;
    
    //Cloud parallax speed
    cloudScroll.tilePosition.x = bgX + 0.5;
}

//Function to create a health bar
function createHealthBar(){
    //Create the player health bar border
    playerHealthBorder = new PIXI.Graphics();
    playerHealthBorder.position.set(5, 5);
    playerHealthBorder.beginFill(0x000000);
    playerHealthBorder.drawRect(0, 0, 310, 25);
    playerHealthBorder.endFill();
    gameScene.addChild(playerHealthBorder);
    playerHealthBorder.alpha = 0.5;

    //Create the player health bar
    playerHealthBar = new PIXI.Container();
    playerHealthBar.position.set(10, 10)
    gameScene.addChild(playerHealthBar);

    //Create the black background
    let playerInnerBar = new PIXI.Graphics();
    playerInnerBar.beginFill(0x000000);
    playerInnerBar.drawRect(0, 0, 300, 15);
    playerInnerBar.endFill();
    playerHealthBar.addChild(playerInnerBar);

    //Create the health bar
    let playerOuterBar = new PIXI.Graphics();
    playerOuterBar.beginFill(0xFAED3C);
    playerOuterBar.drawRect(0, 0, 300, 15);
    playerOuterBar.endFill();
    playerHealthBar.addChild(playerOuterBar);
    playerHealthBar.outer = playerOuterBar;

    //Create the AI health bar border
    enemyHealthBorder = new PIXI.Graphics();
    enemyHealthBorder.position.set(709, 5);
    enemyHealthBorder.beginFill(0x000000);
    enemyHealthBorder.drawRect(0, 0, 310, 25);
    enemyHealthBorder.endFill();
    gameScene.addChild(enemyHealthBorder);
    enemyHealthBorder.alpha = 0.5;

    //Create the AI health bar
    enemyHealthBar = new PIXI.Container();
    enemyHealthBar.position.set(714, 10)
    gameScene.addChild(enemyHealthBar);

    //Create the black background
    let enemyInnerBar = new PIXI.Graphics();
    enemyInnerBar.beginFill(0x000000);
    enemyInnerBar.drawRect(0, 0, 300, 15);
    enemyInnerBar.endFill();
    enemyHealthBar.addChild(enemyInnerBar);

    //Create the health bar
    let enemyOuterBar = new PIXI.Graphics();
    enemyOuterBar.beginFill(0xFF3300);
    enemyOuterBar.drawRect(0, 0, 300, 15);
    enemyOuterBar.endFill();
    enemyHealthBar.addChild(enemyOuterBar);
    enemyHealthBar.outer = enemyOuterBar;
}

//Function to manage the health of the player and AI
//Also triggers the end of the game (Win or Lose)
function healthManager(character){
    if(character === PLAYER){
        //Manage player health
        if(playerHp == 0){
            playerHpText.text = "0 / 500 HP";
            gameOver = true;
            endGame(LOSE);
            return;
        }
        playerHp -= 2;
        playerHpText.text = playerHp + " / 500 HP";
        playerHealthBar.outer.width -= 1.2;
        return;
    }else if(character === ENEMY){
        //Manage AI health
        if(enemyHp == 0){
            enemyHpText.text = "0 / 500 HP";
            enemyHealthBar.outer.x = 714;
            gameOver = true;
            endGame(WIN);
            return;
        }
        enemyHp -= 1;
        enemyHpText.text = enemyHp + " / 500 HP";
        enemyHealthBar.outer.width -= 0.6;
        enemyHealthBar.outer.x += 0.6;
        return;
    }
}



/* Key Handlers */

//Key press handler
function keysDown(e){
    keys[e.keyCode] = true;
}

//Key release handler
function keysUp(e){
    if(e.keyCode == "32"){
        keys[e.keyCode] = true;
    }
    keys[e.keyCode] = false;
}



/* Ki Blast Functions */

//Player Ki
//Fire a ki blast from the player
function playerFireKi(e){
    if(gameScene.visible){
        kiTimeCount++;
        if(kiTimeCount == 2){        
            let kiBlast = playerCreateKi();
            playerKiBlasts.push(kiBlast);
            kiTimeCount = 0;
        }else{
            return;
        }
    }
}

//Create a ki blast for the player
function playerCreateKi(){
    //Play ki fire sound effect
    kiBlastSound.play({
        singleInstance: true,
        volume: 0.05
    });
    let sheet2 = app.loader.resources["images/pixiButodenZ.json"].textures;
    let ki = new PIXI.Sprite(sheet2["ki_blue.png"]);
    ki.x = player.x + 89;
    ki.y = player.y + 61;
    ki.speed = KI_SPEED;
    gameScene.addChild(ki);

    return ki;
}

//Update ki blasts for the player
function playerUpdateKi(delta){
    for (let i = 0; i < playerKiBlasts.length; i++){
        playerKiBlasts[i].position.x += playerKiBlasts[i].speed;

        if(playerKiBlasts[i].dead){
            gameScene.removeChild(playerKiBlasts[i]);
            playerKiBlasts[i].dead = false;
            playerKiBlasts.splice(i, 1);
            return;
        }

        if(playerKiBlasts[i].position.x > 1024){
            playerKiBlasts[i].dead = true;
        }else{
            playerKiBlasts[i].dead = false;
        }
    }
}

//Enemy Ki
//Fire a ki blast from the player
function enemyFireKi(){
    let kiBlast = enemyCreateKi();
    enemyKiBlasts.push(kiBlast);
}

//Create a ki blast for the player
function enemyCreateKi(){
    let sheet2 = app.loader.resources["images/pixiButodenZ.json"].textures;
    let ki = new PIXI.Sprite(sheet2["ki_purple.png"]);
    ki.scale.x *= -1;
    ki.x = enemy.x;
    ki.y = enemy.y + 73;
    ki.speed = KI_SPEED;
    gameScene.addChild(ki);

    return ki;
}

//Update ki blasts for the player
function enemyUpdateKi(delta){
    for (let i = 0; i < enemyKiBlasts.length; i++){
        enemyKiBlasts[i].position.x -= enemyKiBlasts[i].speed;

        if(enemyKiBlasts[i].dead){
            gameScene.removeChild(enemyKiBlasts[i]);
            enemyKiBlasts[i].dead = false;
            enemyKiBlasts.splice(i, 1);
            return;
        }

        if(enemyKiBlasts[i].position.x < 0){
            enemyKiBlasts[i].dead = true;
        }else{
            enemyKiBlasts[i].dead = false;
        }
    }
}



/* Collision/Containment Functions */

//Function to contain the sprite within the scene
function contain(sprite, container) {
    let collision = undefined;

    //Left
    if (sprite.x < container.x) {
        sprite.x = container.x;
        collision = "left";
    }

    //Top
    if (sprite.y < container.y) {
        sprite.y = container.y;
        collision = "top";
    }

    //Right
    if (sprite.x + sprite.width > container.width) {
        sprite.x = container.width - sprite.width;
        collision = "right";
    }

    //Bottom
    if (sprite.y + sprite.height > container.height) {
        sprite.y = container.height - sprite.height;
        collision = "bottom";
    }

    //Return the "collision" value
    return collision;
}


//Function to detect entity collisions using rectangles
function rectCollision(r1, r2) {
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    //Determines if there's a collision; initially false
    hit = false;

    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;

    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;

    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;

    //Calculate the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {
        //Check for a collision on the y axis
        if (Math.abs(vy) < combinedHalfHeights) {
            //Collision
            hit = true;
        } else {
            //No y-axis collision
            hit = false;
        }
    } else {
        //No x-axis collision
        hit = false;
    }

    //True if collision; False if no collision
    return hit;
}

//Handler for entity collisions
function collisionHandler(){
    //Ki blast player -> AI
    playerKiBlasts.forEach(blast => {
        if(rectCollision(enemy, blast)){
            //Play random hit sound effect
            rand = Math.floor(Math.random() * 7);
            if(rand == 1){
                hit1Sound.play({
                    singleInstance: true,
                    volume: 0.02
                });
            }else if(rand == 2){
                hit2Sound.play({
                    singleInstance: true,
                    volume: 0.02
                });
            }else if(rand == 3){
                hit3Sound.play({
                    singleInstance: true,
                    volume: 0.02
                });
            }else if(rand == 4){
                hit4Sound.play({
                    singleInstance: true,
                    volume: 0.02
                });
            }else if(rand == 5){
                hit5Sound.play({
                    singleInstance: true,
                    volume: 0.02
                });
            }else if(rand == 6){
                hit6Sound.play({
                    singleInstance: true,
                    volume: 0.02
                });
            }

            enemyHit = true;
        }
    });

    //Ki blast AI -> player
    enemyKiBlasts.forEach(blast => {
        if(rectCollision(player, blast)){
            //Play random hit sound effect
            rand = Math.floor(Math.random() * 7);
            if(rand == 1){
                hit1Sound.play({
                    singleInstance: true,
                    volume: 0.02
                });
            }else if(rand == 2){
                hit2Sound.play({
                    singleInstance: true,
                    volume: 0.02
                });
            }else if(rand == 3){
                hit3Sound.play({
                    singleInstance: true,
                    volume: 0.02
                });
            }else if(rand == 4){
                hit4Sound.play({
                    singleInstance: true,
                    volume: 0.02
                });
            }else if(rand == 5){
                hit5Sound.play({
                    singleInstance: true,
                    volume: 0.02
                });
            }else if(rand == 6){
                hit6Sound.play({
                    singleInstance: true,
                    volume: 0.02
                });
            }

            playerHit = true;
        }
    });
}
