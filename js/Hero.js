class Hero extends Phaser.Sprite {

  /**
   * Constructs a new Hero sprite.
   * Initializes the hero's position, physics properties, and animations.
   *
   * @param {Phaser.Game} game - The game instance to which this sprite belongs.
   * @param {number} x - The x-coordinate of the hero's initial position.
   * @param {number} y - The y-coordinate of the hero's initial position.
   */
  constructor(game, x, y) {
    super(game, x, y, 'hero');

    this.game.physics.enable(this);
    this.anchor.set(0.5, 0.5);
    this.body.collideWorldBounds = true;

    this.animations.add('stop', [0]);
    this.animations.add('run', [1, 2], 8, true);
    this.animations.add('jump', [3]);
    this.animations.add('fall', [4]);
  }

  /**
   * Moves the hero left or right by setting its x velocity to a certain value.
   * The direction parameter should be either 1 or -1.
   * Additionally, the hero's sprite is flipped horizontally to make it appear
   * as if it is facing the correct direction.
   *
   * @param {number} direction - The direction of the hero's movement.
   */
  move(direction) {
    const SPEED = 200;

    this.body.velocity.x = direction * SPEED;

    if (this.body.velocity.x < 0) this.scale.x = -1;
    else if (this.body.velocity.x > 0) this.scale.x = 1;
  }

  /**
   * Jumps the hero vertically by setting its y velocity to a certain value.
   * The jump will only occur if the hero is currently touching the ground.
   *
   * @returns {boolean} True if the hero jumped, false otherwise.
   */
  jump() {
    const JUMP_SPEED = 600;

    let canJump = this.body.touching.down;
    if (canJump) this.body.velocity.y = -JUMP_SPEED;

    return canJump;
  }

  /**
   * Makes the hero bounce upward by setting its y velocity to a certain value.
   */
  bounce() {
    const BOUNCE_SPEED = 200;

    this.body.velocity.y = -BOUNCE_SPEED;
  }

  /**
   * Updates the hero's animation.
   * Checks which animation to play and plays it. The animation to play is
   * determined by the hero's current state (e.g. walking, jumping, falling).
   */
  update() {
    let animationName = this._getAnimationName();

    if (this.animations.name !== animationName) {
      this.animations.play(animationName);
    }
  }

  /**
   * Gets the name of the animation to play based on the hero's current state.
   * The animation name is determined by the hero's current velocity and
   * whether or not it is touching the ground.
   *
   * @returns {String} The name of the animation to play.
   */
  _getAnimationName() {
    let name = 'stop';

    if (this.body.velocity.y < 0) {
      name = 'jump';

    } else if (this.body.velocity.y >= 0 && !this.body.touching.down) {
      name = 'fall';

    } else if (this.body.velocity.x !== 0 && this.body.touching.down) {
      name = 'run';
    }

    return name;
  }
}
