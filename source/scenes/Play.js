class Play extends Phaser.Scene {
    constructor() {
        super("play");
    }

    // please work

    preload(){
        this.load.image('starfield', 'assets/starfield.png');
        this.load.image('rocket', 'assets/rocket.png');
        this.load.image('spaceship', 'assets/spaceship.png');
        this.load.spritesheet('explosion', 'assets/explosion.png', {frameWidth: 64, frameHeight: 32, startFrame: 0, endFrame: 9});
    }

    create() {

        keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        this.bg = this.add.tileSprite(0,0, game.config.width, game.config.height, 'starfield').setOrigin(0,0);

        this.p1Rocket = new Rocket(this, game.config.width/2, 431,  'rocket').setOrigin(0.5,0);
        this.p1Rocket.reset();

        this.shipA = new Spaceship(this, 300, 300, 'spaceship');
        this.shipB = new Spaceship(this, 400, 150, 'spaceship');
        this.shipC = new Spaceship(this, 100, 200, 'spaceship');

        this.add.rectangle(0, borderUISize + borderPadding, game.config.width, borderUISize * 2, 0x00FF00).setOrigin(0,0);

        this.add.rectangle(0, 0, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0,0);
        this.add.rectangle(0, game.config.height - borderUISize, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0,0);
        this.add.rectangle(0, 0, game.config.height, borderUISize, 0xFFFFFF).setOrigin(0,0);
        this.add.rectangle(game.config.width - borderUISize, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0,0);
        
        this.p1Score = 0;

        let scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
             },
            fixedWidth: 100
        }
        this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding*2, this.p1Score, scoreConfig);
    
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 9, first: 0}),
            frameRate: 30
        });

        // GAME OVER flag
        this.gameOver = false;

        // 60-second play clock
        scoreConfig.fixedWidth = 0;
        this.clock = this.time.delayedCall(game.settings.gameTimer, () => {
            this.add.text(game.config.width/2, game.config.height/2, 'GAME OVER', scoreConfig).setOrigin(0.5);
            this.add.text(game.config.width/2, game.config.height/2 + 64, 'Press (R) to Restart or LEFT for Menu', scoreConfig).setOrigin(0.5);
            this.gameOver = true
        }, null, this);
    }

    update() {

         // check key input for restart
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyR)) {
            this.scene.restart();
        }

        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.scene.start("menu");
        }

        this.bg.tilePositionX -= 4;
        const movenmentSpeed = 4;
        if(keyLEFT.isDown) {
            this.p1Rocket.x -= movenmentSpeed;
        }
        if(keyRIGHT.isDown) {
            this.p1Rocket.x += movenmentSpeed;
        }
        if(Phaser.Input.Keyboard.JustDown(keyF)){
            this.p1Rocket.firing = true;
            this.sound.play('sfx_rocket');;
        }

        if (!this.gameOver) {               
            this.p1Rocket.update();         // update rocket sprite
            this.shipA.update();           // update spaceships (x3)
            this.shipB.update();
            this.shipC.update();
        } 

        if(this.checkCollision(this.p1Rocket, this.shipA)) {
            console.log('kaboom ship A');
            this.p1Rocket.reset();
            this.shipExplode(this.shipA);
          }
          if (this.checkCollision(this.p1Rocket, this.shipB)) {
            console.log('kaboom ship B');
            this.p1Rocket.reset();
            this.shipExplode(this.shipB);
          }
          if (this.checkCollision(this.p1Rocket, this.shipC)) {
            console.log('kaboom ship C');
            this.p1Rocket.reset();
            this.shipExplode(this.shipC);
          }
    }

    checkCollision(rocket, ship) {
        // simple AABB checking
        if (rocket.x < ship.x + ship.width && 
            rocket.x + rocket.width > ship.x && 
            rocket.y < ship.y + ship.height &&
            rocket.height + rocket.y > ship. y) {
                return true;
        } else {
            return false;
        }
    }

    shipExplode(ship) {
        // temporarily hide ship
        ship.alpha = 0;
        // create explosion sprite at ship's position
        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0);
        boom.anims.play('explode');             // play explode animation
        boom.on('animationcomplete', () => {    // callback after anim completes
          ship.reset();                         // reset ship position
          ship.alpha = 1;                       // make ship visible again
          boom.destroy();                       // remove explosion sprite
        });    
        this.p1Score += ship.pointValue;
        this.scoreLeft.text = this.p1Score;  
        this.sound.play('sfx_explosion');
      }

}