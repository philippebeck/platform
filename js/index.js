/**
 * Initializes a new game of the one-screen platformer.
 * Creates a game object with the dimensions 960x600 and the game state name 'play'.
 * Adds the 'play' state to the game, and starts it with the level 0.
 */
window.onload = function () {
  let game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');

  game.state.add('play', PlayState);
  game.state.start('play', true, false, {level: 0});
};
