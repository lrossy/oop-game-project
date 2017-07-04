// This sectin contains some game constants. It is not super interesting
var GAME_WIDTH = 375;
var GAME_HEIGHT = 500;

var ENEMY_WIDTH = 75;
var ENEMY_HEIGHT = 156;
var MAX_ENEMIES = 3;

var PLAYER_WIDTH = 75;
var PLAYER_HEIGHT = 54;
var PLAYER_LIVES = 3;

var LASER_HEIGHT  = 75;
var LASER_WIDTH = 75;

// These two constants keep us from using "magic numbers" in our code
var LEFT_ARROW_CODE = 37;
var RIGHT_ARROW_CODE = 39;
var UP_ARROW_CODE = 38;
var DOWN_ARROW_CODE = 40;
var SPACE_BAR_CODE = 32;
var KEYCODE_ENTER = 13;

// These two constants allow us to DRY
var MOVE_LEFT = 'left';
var MOVE_RIGHT = 'right';
var MOVE_UP    = 'up';
var MOVE_DOWN = 'down';

var MAX_LASERS = 3;

// Preload game images
var images = {};
['enemy.png', 'stars.png', 'player.png', 'laser.png'].forEach(imgName => {
    var img = document.createElement('img');
    img.src = 'images/' + imgName;
    images[imgName] = img;
});


class Entity {
    render(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y);
    }
    update(timeDiff, direction) {
        if (direction === 'down')  {
            this.y = this.y + timeDiff * this.speed;
        }
        else {
            this.y = this.y - timeDiff * this.speed;
        }
    }

}


// This section is where you will be doing most of your coding
class Enemy extends Entity {
    constructor(xPos) {
        super();
        this.x = xPos;
        this.y = -ENEMY_HEIGHT;
        this.sprite = images['enemy.png'];

        // Each enemy should have a different speed
        this.speed = Math.random() / 2 + 0.25;
    }
}

class Laser extends Entity {
    constructor(xPos, yPos) {
        super();
        this.x = xPos;
        this.y = yPos;
        this.sprite = images['laser.png'];

        console.log('laser', xPos, yPos)
        this.height = LASER_HEIGHT;
        this.width = LASER_WIDTH;
        this.speed = 0.5;
    }
}

class Player extends Entity{
    constructor() {
        super();
        this.lives = PLAYER_LIVES;
        this.x = 2 * PLAYER_WIDTH;
        this.y = GAME_HEIGHT - PLAYER_HEIGHT - 10;
        this.sprite = images['player.png'];
    }

    // This method is called by the game engine when left/right arrows are pressed
    move(direction) {
        if (direction === MOVE_LEFT && this.x > 0) {
            this.x = this.x - PLAYER_WIDTH;
        }

        else if (direction === MOVE_RIGHT && this.x < GAME_WIDTH - PLAYER_WIDTH) {
            this.x = this.x + PLAYER_WIDTH;
        }
        else if (direction === MOVE_UP &&  this.y > PLAYER_HEIGHT) {
            this.y = this.y - PLAYER_HEIGHT;
        }
        else if (direction === MOVE_DOWN && this.y < GAME_HEIGHT  - (PLAYER_HEIGHT + 10)) {

            this.y = this.y + PLAYER_HEIGHT;
        }
        // alert('this.x: ' +this.x);
    }
    lostLife(){
        if(this.lives > 0){
            this.lives--;
        }
    }
    shoot() {
        if (!this.lasers) {
            this.lasers = [];
        }

        //while (canShoot) {
        if (this.lasers.length < MAX_LASERS) {
            var laser = new Laser(this.x, this.y-PLAYER_HEIGHT);
            this.lasers.push(laser);
        }
        //}
    }
}

/*
This section is a tiny game engine.
This engine will use your Enemy and Player classes to create the behavior of the game.
The engine will try to draw your game at 60 frames per second using the requestAnimationFrame function
*/
class Engine {
    constructor(element) {
        // Setup the player
        this.player = new Player();

        // Setup enemies, making sure there are always three
        this.setupEnemies();

        // Setup the <canvas> element where we will be drawing
        var canvas = document.createElement('canvas');
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
        element.appendChild(canvas);

        this.ctx = canvas.getContext('2d');

        // Since gameLoop will be called out of context, bind it once here.
        this.gameLoop = this.gameLoop.bind(this);
    }

    new() {
        //reset things
        this.player.lostLife();
        this.enemies = [];
        this.player.x = 2 * PLAYER_WIDTH;
        this.player.y = GAME_HEIGHT - PLAYER_HEIGHT - 10;
        this.score = 0;
        this.lastFrame = Date.now();

        this.gameLoop();
    }
    /*
     The game allows for 5 horizontal slots where an enemy can be present.
     At any point in time there can be at most MAX_ENEMIES enemies otherwise the game would be impossible
     */
    setupEnemies() {
        if (!this.enemies) {
            this.enemies = [];
        }

        while (this.enemies.filter(e => !!e).length < MAX_ENEMIES) {
            this.addEnemy();
        }
    }

    // This method finds a random spot where there is no enemy, and puts one in there
    addEnemy() {
        var enemySpots = GAME_WIDTH / ENEMY_WIDTH;

        var enemySpot;
        var test = undefined;

        // if(!enemySpot && this.enemies[enemySpot]){
        //     alert(JSON.stringify(this.enemies[enemySpot]));
        // }
        // Keep looping until we find a free enemy spot at random

        while (enemySpot===undefined || this.enemies[enemySpot] ) {
            // alert(JSON.stringify(this.enemies[enemySpot]));

            enemySpot = Math.floor(Math.random() * enemySpots);
            // alert(enemySpot);

        }
        // alert(typeof this.enemies[enemySpot])
        this.enemies[enemySpot] = new Enemy(enemySpot * ENEMY_WIDTH);
        //alert(JSON.stringify(this.enemies));

    }

    // This method kicks off the game
    start() {
        this.score = 0;
        this.lastFrame = Date.now();

        this.player = new Player();
        this.enemies = [];
        var that = this;
        // Listen for keyboard left/right and update the player
        document.addEventListener('keydown', e => {
            if (e.keyCode === KEYCODE_ENTER && this.player.lives < 1){
                this.start()
           }

            if (e.keyCode === LEFT_ARROW_CODE) {
                this.player.move(MOVE_LEFT);
            }
            else if (e.keyCode === RIGHT_ARROW_CODE) {
                this.player.move(MOVE_RIGHT);
            }
            else if (e.keyCode === UP_ARROW_CODE) {
                this.player.move(MOVE_UP);
            }
            else if (e.keyCode === DOWN_ARROW_CODE) {
                this.player.move(MOVE_DOWN);
            }
            else if (e.keyCode === SPACE_BAR_CODE) {
                this.player.shoot();
            }
        });

        this.gameLoop();
    }

    /*
    This is the core of the game engine. The `gameLoop` function gets called ~60 times per second
    During each execution of the function, we will update the positions of all game entities
    It's also at this point that we will check for any collisions between the game entities
    Collisions will often indicate either a player death or an enemy kill

    In order to allow the game objects to self-determine their behaviors, gameLoop will call the `update` method of each entity
    To account for the fact that we don't always have 60 frames per second, gameLoop will send a time delta argument to `update`
    You should use this parameter to scale your update appropriately
     */
    gameLoop() {
        // Check how long it's been since last frame
        var currentFrame = Date.now();
        var timeDiff = currentFrame - this.lastFrame;

        // Increase the score!
        this.score += timeDiff;

        // Call update on all enemies
        this.enemies.forEach(enemy => enemy.update(timeDiff, 'down'));

        // Draw everything!
        this.ctx.drawImage(images['stars.png'], 0, 0); // draw the star bg
        this.enemies.forEach(enemy => enemy.render(this.ctx)); // draw the enemies

        if(this.player.lasers){

            this.player.lasers.forEach( (laser, laserIdx) => {
                laser.update(timeDiff, 'up');
                laser.render(this.ctx);
                if (laser.y <= 0) {
                    this.player.lasers.splice(laserIdx, 1);
                }
            })

        }

        this.player.render(this.ctx); // draw the player

        // Check if any enemies should die
        this.enemies.forEach((enemy, enemyIdx) => {
            if (enemy.y > GAME_HEIGHT) {
                delete this.enemies[enemyIdx];
            }
        });


        this.setupEnemies();
        this.ctx.fillText(this.player.lives + ' Lives', 275, 30);

        this.isEnemyDead();
        // Check if player is dead
        if (this.isPlayerDead()) {
            // If they are dead, then it's game over!
            this.ctx.font = 'bold 30px Impact';
            this.ctx.fillStyle = '#ffffff';

            if(this.player.lives > 0){
                this.ctx.fillText('Starting a new match ...', 5, 150);

                setTimeout(()=>{
                    gameEngine.new();
                },2000);
            }
            else{
                this.ctx.fillText(this.score + ' GAME OVER', 5, 30);
                this.ctx.fillText('Press ENTER to start again', 5, 150);

            }

        }
        else {
            // If player is not dead, then draw the score
            this.ctx.font = 'bold 30px Impact';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(this.score, 5, 30);

            // Set the time marker and redraw
            this.lastFrame = Date.now();
            requestAnimationFrame(this.gameLoop);
        }
    }

    isPlayerDead() {
        // TODO: fix this function!
        // foreach enemy, if there x is the same as the player, then check if the y is a collision or not.
        var collision = false;
        this.enemies.forEach((enemy, enemyIdx) => {

            if(enemy.x === this.player.x){
                if(this.collision(enemy, this.player)) {
                    collision = true;
                    // alert('You crashed!: ' + (enemy.y+ENEMY_HEIGHT) + 'enemy.y:' + enemy.y +  'this.player.y: ' + this.player.y +  'this.player.y: ' + (this.player.y +PLAYER_HEIGHT))
                }
            }
        });

        return collision;
    }

    isEnemyDead() {
        // foreach laser, if there x is the same as the enemy, then check if the y is a collision or not.
        var collision = false;
        this.enemies.forEach((enemy, enemyIdx) => {
            // console.log('Checking enemy ', enemyIdx);

            if(this.player.lasers) {
                this.player.lasers.forEach((laser, laserIdx) => {
                    //check if laser is colliding with enemy
                    // console.log('this.player.lasers.y', laser.y);
                    // console.log('enemy.y', enemy.y);
                    // console.log('enemy.y+ENEMY_HEIGHT', enemy.y+ENEMY_HEIGHT);
                    if(enemy.x === laser.x) {
                        if(this.collision(enemy, laser)) {
                            collision = true;
                            delete this.enemies[enemyIdx];
                            this.player.lasers.splice(laserIdx, 1);
                            this.score += 1000;
                        }
                    }
                });
            }

        });

        return collision;
    }
    collision(obj1, obj2){
        var collision = false;
        if(this.between(obj2.y,  obj1.y, obj1.y+ENEMY_HEIGHT) || this.between(obj2.y,  obj1.y, obj1.y+ENEMY_HEIGHT)) {
            collision = true;
        }
        return collision;
    }
    between(x, min, max){
        return x >= min && x <= max;
    }
}







// This section will start the game
var gameEngine = new Engine(document.getElementById('app'));
gameEngine.start();