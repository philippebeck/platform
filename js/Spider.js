class Spider extends Phaser.Sprite {

  /**
   * Constructs a new Spider sprite.
   * Initializes the spider's position, physics properties, and animations.
   *
   * @param {Phaser.Game} game - The game instance to which this sprite belongs.
   * @param {number} x - The x-coordinate of the spider's initial position.
   * @param {number} y - The y-coordinate of the spider's initial position.
   */
  constructor(game, x, y) {
    super(game, x, y, 'spider');

    this.game.physics.enable(this);
    this.anchor.set(0.5);

    this.body.collideWorldBounds = true;
    this.body.velocity.x = Spider.SPEED;

    this.animations.add('crawl', [0, 1, 2], 8, true); 
    this.animations.add('die', [0, 4, 0, 4, 0, 4, 3, 3, 3, 3, 3, 3], 12);
    this.animations.play('crawl');
  }

  /**
   * The speed of the spider's movement, in pixels per second.
   * @type {number}
   */
  static get SPEED() {
    return 100;
  }

  /**
   * Updates the spider's position and velocity.
   * Changes the spider's velocity to move left or right if it hits the edge of the screen.
   */
  update() {
    if (this.body.touching.right || this.body.blocked.right) {
      this.body.velocity.x = -Spider.SPEED; 
    }

    else if (this.body.touching.left || this.body.blocked.left) {
      this.body.velocity.x = Spider.SPEED; 
    }
  }

  /**
   * Plays the spider's death animation and disables its physics body.
   * When the animation is complete, the spider sprite is removed from the game.
   */
  die() {
    this.body.enable = false;

    this.animations.play('die').onComplete.addOnce(function () {
      this.kill();
    }, this);
  }
}
