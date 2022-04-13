class Spaceship extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y, texture){
        super(scene, x, y, texture);
        scene.add.existing(this);
        this.pointValue = 10;
    }

    update() {
        this.x -= game.settings.spaceshipSpeed;
        if (this.x < 0) {
            this.x = game.config.width;
        }
    }

reset() {
    this.x = game.config.width;
}

}