const LEVEL_COUNT = 2;

let PlayState = {};

//! ********** INIT **********

/**
 * Initializes the play state with the given data.
 * Sets up pixel rounding for rendering and configures input keys for the game.
 * Also adds a callback for the jump action on the 'up' key.
 * Initializes the level, coin pickup count, and key possession status.
 *
 * @param {Object} data - An object containing initialization data.
 * @param {number} data.level - The level number to load.
 */
PlayState.init = function (data) {
  this.game.renderer.renderSession.roundPixels = true;

  this.keys = this.game.input.keyboard.addKeys({
    left: Phaser.KeyCode.LEFT,
    right: Phaser.KeyCode.RIGHT,
    up: Phaser.KeyCode.UP
  });

  this.keys.up.onDown.add(function () {
    let didJump = this.hero.jump();
    if (didJump) this.sfx.jump.play();
  }, this);

  this.coinPickupCount = 0;
  this.hasKey = false;
  this.level = (data.level || 0) % LEVEL_COUNT;
};

//! ********** PRELOAD **********

/**
 * Preloads assets for the play state.
 * Loads in all spritesheet, image, and audio assets needed for the game.
 * Also loads in the level data for levels 0 and 1.
 */
PlayState.preload = function () {
  this.game.load.image('font:numbers', 'images/numbers.png');
  this.game.load.image('background', 'images/background.png');
  this.game.load.image('ground', 'images/ground.png');
  this.game.load.image('grass:8x1', 'images/grass_8x1.png');
  this.game.load.image('grass:6x1', 'images/grass_6x1.png');
  this.game.load.image('grass:4x1', 'images/grass_4x1.png');
  this.game.load.image('grass:2x1', 'images/grass_2x1.png');
  this.game.load.image('grass:1x1', 'images/grass_1x1.png');
  this.game.load.image('invisible-wall', 'images/invisible_wall.png');
  this.game.load.image('icon:coin', 'images/coin_icon.png');
  this.game.load.image('key', 'images/key.png');

  this.game.load.spritesheet('coin', 'images/coin_animated.png', 22, 22);
  this.game.load.spritesheet('spider', 'images/spider.png', 42, 32);
  this.game.load.spritesheet('hero', 'images/hero.png', 36, 42);
  this.game.load.spritesheet('door', 'images/door.png', 42, 66);
  this.game.load.spritesheet('icon:key', 'images/key_icon.png', 34, 30);

  this.game.load.audio('sfx:jump', 'audio/jump.wav');
  this.game.load.audio('sfx:coin', 'audio/coin.wav');
  this.game.load.audio('sfx:stomp', 'audio/stomp.wav');
  this.game.load.audio('sfx:key', 'audio/key.wav');
  this.game.load.audio('sfx:door', 'audio/door.wav');

  this.game.load.json('level:0', 'data/level00.json');
  this.game.load.json('level:1', 'data/level01.json');
};

//! ********** CREATE **********

/**
 * Spawns a platform from the given data.
 * Creates a sprite for the platform at the position and with the image given in the data.
 * Sets up the physics body for the platform.
 * Spawns enemy walls on the left and right sides of the platform.
 *
 * @param {Object} platform - An object containing the position and image of the platform.
 */
PlayState._spawnPlatform = function (platform) {
  let sprite = this.platforms.create(platform.x, platform.y, platform.image);

  this.game.physics.enable(sprite);
  sprite.body.allowGravity = false;
  sprite.body.immovable = true;

  this._spawnEnemyWall(platform.x, platform.y, 'left');
  this._spawnEnemyWall(platform.x + sprite.width, platform.y, 'right');
};

/**
 * Spawns an invisible wall at the given position.
 * Creates a sprite for the wall at the specified x and y coordinates,
 * with the anchor set based on the side parameter. Configures the wall
 * to be immovable and unaffected by gravity.
 *
 * @param {number} x - The x-coordinate to place the wall.
 * @param {number} y - The y-coordinate to place the wall.
 * @param {string} side - The side ('left' or 'right') to set the anchor.
 */
PlayState._spawnEnemyWall = function (x, y, side) {
  let sprite = this.enemyWalls.create(x, y, 'invisible-wall');

  this.game.physics.enable(sprite);
  sprite.anchor.set(side === 'left' ? 1 : 0, 1);

  sprite.body.immovable = true;
  sprite.body.allowGravity = false;
};

/**
 * Spawns the spiders and hero from the given data.
 * Creates a Spider sprite for each object in the data.spiders array,
 * and adds them to the spiders group.
 * Creates a Hero sprite from the data.hero object and adds it to the game.
 *
 * @param {Object} data - An object containing the level data.
 * @param {Array} data.spiders - An array of objects containing the position of each spider.
 * @param {Object} data.hero - An object containing the position of the hero.
 */
PlayState._spawnCharacters = function (data) {
  data.spiders.forEach(function (spider) {
      let sprite = new Spider(this.game, spider.x, spider.y);
      this.spiders.add(sprite);
  }, this);

  this.hero = new Hero(this.game, data.hero.x, data.hero.y);
  this.game.add.existing(this.hero);
};

/**
 * Spawns a coin at the given position.
 * Creates a coin sprite at the position specified in the coin object,
 * enables physics, and sets the anchor to the center. Configures the coin
 * to not be affected by gravity, and adds an animation to rotate the coin.
 *
 * @param {Object} coin - An object containing the position of the coin.
 */
PlayState._spawnCoin = function (coin) {
  let sprite = this.coins.create(coin.x, coin.y, 'coin');

  this.game.physics.enable(sprite);

  sprite.anchor.set(0.5, 0.5);
  sprite.body.allowGravity = false;

  sprite.animations.add('rotate', [0, 1, 2, 1], 6, true);
  sprite.animations.play('rotate');
};

/**
 * Spawns a door at the given position.
 * Creates a door sprite at the position specified, enables physics,
 * and sets the anchor to the center bottom. Configures the door to not
 * be affected by gravity.
 *
 * @param {number} x - The x-coordinate to place the door.
 * @param {number} y - The y-coordinate to place the door.
 */
PlayState._spawnDoor = function (x, y) {
  this.door = this.bgDecoration.create(x, y, 'door');

  this.game.physics.enable(this.door);
  this.door.anchor.setTo(0.5, 1);

  this.door.body.allowGravity = false;
};

/**
 * Spawns a key at the given position.
 * Creates a key sprite at the position specified, enables physics,
 * and sets the anchor to the center. Configures the key to not
 * be affected by gravity. Animates the key to bob up and down.
 *
 * @param {number} x - The x-coordinate to place the key.
 * @param {number} y - The y-coordinate to place the key.
 */
PlayState._spawnKey = function (x, y) {
  this.key = this.bgDecoration.create(x, y, 'key');

  this.game.physics.enable(this.key);

  this.key.anchor.set(0.5, 0.5);
  this.key.body.allowGravity = false;
  this.key.y -= 3;

  this.game.add.tween(this.key)
    .to({y: this.key.y + 6}, 800, Phaser.Easing.Sinusoidal.InOut)
    .yoyo(true)
    .loop()
    .start();
};

/**
 * Loads a level from the given data.
 * Creates groups for the level's background decoration, platforms, coins, spiders, and enemy walls.
 * Sets up gravity for the level.
 * Spawns all platforms, coins, hero, spiders, door, and key in the level based on the data.
 */
PlayState._loadLevel = function (data) {
  const GRAVITY = 1200;

  this.bgDecoration = this.game.add.group();
  this.platforms    = this.game.add.group();
  this.coins        = this.game.add.group();
  this.spiders      = this.game.add.group();
  this.enemyWalls   = this.game.add.group();

  this.enemyWalls.visible = false;
  this.game.physics.arcade.gravity.y = GRAVITY;

  data.platforms.forEach(this._spawnPlatform, this);
  data.coins.forEach(this._spawnCoin, this);

  this._spawnCharacters({hero: data.hero, spiders: data.spiders});
  this._spawnDoor(data.door.x, data.door.y);
  this._spawnKey(data.key.x, data.key.y);
};

/**
 * Creates and configures the HUD (Heads-Up Display) for the game.
 * Initializes the font for displaying the coin count and creates images
 * for the key and coin icons. Positions and adds these elements to a
 * group that represents the HUD, setting its position on the game screen.
 */
PlayState._createHud = function () {
  const NUMBERS_STR = '0123456789X ';
  this.coinFont = this.game.add.retroFont('font:numbers', 20, 26,
      NUMBERS_STR);

  this.keyIcon = this.game.make.image(0, 19, 'icon:key');
  this.keyIcon.anchor.set(0, 0.5);

  let coinIcon = this.game.make.image(this.keyIcon.width + 7, 0, 'icon:coin');
  let coinScoreImg = this.game.make.image(coinIcon.x + coinIcon.width,
      coinIcon.height / 2, this.coinFont);
  coinScoreImg.anchor.set(0, 0.5);

  this.hud = this.game.add.group();
  this.hud.add(coinIcon);
  this.hud.add(coinScoreImg);
  this.hud.add(this.keyIcon);
  this.hud.position.set(10, 10);
};

/**
 * Sets up the game state for the play state.
 * Configures the sound effects, sets up the background image, loads the level data,
 * and creates the HUD.
 */
PlayState.create = function () {
  this.sfx = {
    jump: this.game.add.audio('sfx:jump'),
    coin: this.game.add.audio('sfx:coin'),
    stomp: this.game.add.audio('sfx:stomp'),
    key: this.game.add.audio('sfx:key'),
    door: this.game.add.audio('sfx:door')
  };

  this.game.add.image(0, 0, 'background');

  this._loadLevel(this.game.cache.getJSON(`level:${this.level}`));
  this._createHud();
};

//! ********** UPDATE **********

/**
 * Handles the collision between the hero and a coin.
 * Plays the coin sound effect, removes the coin from the game, and increments
 * the coin pickup count.
 *
 * @param {Phaser.Sprite} hero - The hero sprite.
 * @param {Phaser.Sprite} coin - The coin sprite.
 */
PlayState._onHeroVsCoin = function (hero, coin) {
  this.sfx.coin.play();

  coin.kill();
  this.coinPickupCount++;
};

/**
 * Handles the collision between the hero and an enemy.
 * If the hero is falling when colliding with the enemy, the hero will bounce,
 * the enemy will die, and a stomp sound effect will play.
 * If the hero is not falling, a stomp sound effect will play, and the game
 * state will restart at the current level.
 *
 * @param {Phaser.Sprite} hero - The hero sprite.
 * @param {Phaser.Sprite} enemy - The enemy sprite.
 */
PlayState._onHeroVsEnemy = function (hero, enemy) {
  if (hero.body.velocity.y > 0) {
    hero.bounce();
    enemy.die();
    this.sfx.stomp.play();

  } else {
    this.sfx.stomp.play();
    this.game.state.restart(true, false, {level: this.level});
  }
};

/**
 * Handles the collision between the hero and a key.
 * Plays the key sound effect, removes the key from the game, and sets the key
 * possession status to true.
 *
 * @param {Phaser.Sprite} hero - The hero sprite.
 * @param {Phaser.Sprite} key - The key sprite.
 */
PlayState._onHeroVsKey = function (hero, key) {
  this.sfx.key.play();

  key.kill();
  this.hasKey = true;
};

/**
 * Handles the collision between the hero and a door.
 * Plays the door sound effect and restarts the game state at the next level.
 *
 * @param {Phaser.Sprite} hero - The hero sprite.
 * @param {Phaser.Sprite} door - The door sprite.
 */
PlayState._onHeroVsDoor = function (hero, door) {
  this.sfx.door.play();
  this.game.state.restart(true, false, { level: this.level + 1 });
};

/**
 * Handles collision and overlap detection between various game objects.
 * This function is called repeatedly within the update loop of the game.
 * It checks for collisions between the hero and platforms, spiders and platforms,
 * and spiders and enemy walls. Overlap detection is also used to check for
 * collision between the hero and coins, spiders, keys, and doors.
 */
PlayState._handleCollisions = function () {
  this.game.physics.arcade.collide(this.spiders, this.platforms);
  this.game.physics.arcade.collide(this.spiders, this.enemyWalls);
  this.game.physics.arcade.collide(this.hero, this.platforms);

  this.game.physics.arcade.overlap(
    this.hero, 
    this.coins, 
    this._onHeroVsCoin, 
    null,
    this
  );

  this.game.physics.arcade.overlap(
    this.hero, 
    this.spiders, 
    this._onHeroVsEnemy, 
    null, 
    this
  );

  this.game.physics.arcade.overlap(
    this.hero, 
    this.key, 
    this._onHeroVsKey, 
    null, 
    this
  );

  this.game.physics.arcade.overlap(
    this.hero,
    this.door,
    this._onHeroVsDoor,
    function (hero, door) { 
      return this.hasKey && hero.body.touching.down
    },
    this
  );
};

/**
 * Handles player input for hero movement.
 * Checks the state of the left and right keys and moves the hero
 * accordingly. If neither key is pressed, the hero stops moving.
 */
PlayState._handleInput = function () {
  if (this.keys.left.isDown) this.hero.move(-1);
  else if (this.keys.right.isDown) this.hero.move(1);
  else this.hero.move(0);
};

/**
 * Updates the play state for each game frame.
 * Handles collisions and player input, and updates the HUD elements,
 * such as the coin count and key icon state, based on the current
 * game status.
 */
PlayState.update = function () {
  this._handleCollisions();
  this._handleInput();

  this.coinFont.text = `x${this.coinPickupCount}`;
  this.keyIcon.frame = this.hasKey ? 1 : 0;
};
