'use strict';

/*================================================================ VAR
*/

var WIDTH = 640;
var HEIGHT = 480;
var GAME_ID = 'game-box';
var Game = {};

var LOADING_SCREEN_COLOR = '#333';
var GAME_NAME = 'KiKi - The Sacrifice';

var PLAYER_SPRITE_NAME = 'square';
var SPIKE_SPRITE_NAME = 'spike';

/*================================================================ UTIL
*/

function rand(num) {
  return Math.floor(Math.random() * num);
}

/*================================================================ BOOT
*/

Game.Boot = function(game) {};
Game.Boot.prototype = {
  preload: function() {
    game.stage.backgroundColor = LOADING_SCREEN_COLOR;
    game.load.image('loading', 'assets/images/loading.png');
    game.load.image('loading2', 'assets/images/loading-border.png');
  },
  create: function() {
    game.state.start('Load');
  }
};

/*================================================================ LOAD
*/

Game.Load = function(game) {};
Game.Load.prototype = {
  preload: function() {
    game.stage.backgroundColor = LOADING_SCREEN_COLOR;

    // set preloading images
    var preloadingBorder = game.add.sprite(WIDTH / 2, HEIGHT / 2 + 30, 'loading2');
    preloadingBorder.x -= preloadingBorder.width / 2;
    preloadingBorder.alpha = 0.5;

    var preloading = game.add.sprite(WIDTH / 2, HEIGHT / 2 + 30, 'loading');
    preloading.x -= preloading.width / 2;
    game.load.setPreloadSprite(preloading);
    
    var titleText = GAME_NAME;
    var titleStyle = { font:'50px Arial', fill: '#fff' }; // #545454
    var title = game.add.text(
      WIDTH / 2,
      HEIGHT / 2,
      titleText,
      titleStyle);
    title.anchor.setTo(0.5, 1);

    var subTitleText = 'by - JAM 2016';
    var subTitleTextStyle = { font:'16px Arial', fill:'#E0E0E0' }; //'#65655B'
    var subTitle = game.add.text(
      WIDTH / 2,
      HEIGHT / 2 + 20,
      subTitleText,
      subTitleTextStyle);
    subTitle.anchor.setTo(0.5, 1);

    // load all asets
    game.load.image(PLAYER_SPRITE_NAME, 'assets/images/square.png');
    game.load.image(SPIKE_SPRITE_NAME, 'assets/images/spike.png');
    game.load.image('pixel', 'assets/images/pixel.png');
    game.load.image('background', 'assets/images/background-texture.png');
    game.load.image('floor', 'assets/images/floor.png');

    game.load.image('maskdash', 'assets/images/mask-dash.png');
    game.load.image('maskfire', 'assets/images/mask-fire.png');
    game.load.image('maskdig', 'assets/images/mask-dig.png');

    game.load.audio('hit', 'assets/sounds/hit.wav');
    game.load.audio('jump', 'assets/sounds/jump.wav');
    game.load.audio('music', 'assets/sounds/music.wav');
    game.load.audio('bonus', 'assets/sounds/bonus.wav');

    // test progress bar
    // game.load.image('bgtile', 'assets/test/bgtile.jpg');
    // game.load.image('fappyBird', 'assets/test/fappyBird.png');
    // game.load.image('fappyGround', 'assets/test/fappyGround.png');
    // game.load.image('fappyTitle', 'assets/test/fappyTitle.png');
    // game.load.image('pipe1', 'assets/test/pipe1.png');
    // game.load.image('tilebg', 'assets/test/tilebg.png');
    // game.load.image('vertpipe', 'assets/test/vertpipe.png');
    // game.load.audio('hit', 'assets/test/hit.wav');
    // game.load.audio('next', 'assets/test/next.wav');
    // game.load.audio('music', 'assets/test/music.wav');
  },
  create: function() {
    game.state.start('Play');
  }
};

/*================================================================ PLAY
*/

var DEBUG_XPOS;
var DEBUG_YPOS;

var STARTED_DEBUG_XPOS = 400;
var STARTED_DEBUG_YPOS = 16;

Game.Play = function(game) {};
Game.Play.prototype = {
  echoDebug: function(txt, val) {
    game.debug.text(txt + ': ' + val, DEBUG_XPOS, DEBUG_YPOS += 20);
  },
  resize: function() {
    console.log('resize');
  },
  shutdown: function() {
    console.log('shutdown');
  },
  create: function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.gravity.y = 900;

    this.xSpeed = 4; // pixels / frame
    this.jumpWidth = 120; // pixels
    this.jumpHeight = 40; // pixels
    this.jumpRotation = 180; // degrees (rotation when jump)
    this.jumpTime = 0; // jump delay (time passed since the player started jumping)
    this.isJumping = false;

    this.degToRad = 0.0174532925; // degree to radian

    this.theSpike;
    this.spikesGroup;
    this.spikesAmount = 4; // n of spikes

    this.floorYPos = [92, 276, 460 ]; // y pos of each floor
    this.nFloor = this.floorYPos.length;
    this.currentFloor = 0; // floor idx
    this.floorHeight = 20;

    this.levelStart = 0; // x position where the level starts
    this.levelEnd = WIDTH; // x position where the level ends, in pixels

    this.currentMask = '';

    this.dashMask;
    this.dashMaskGroup;
    this.dashMaskAmount = 2;

    this.fireMask;
    this.fireMaskGroup;
    this.fireMaskAmount = 2;

    this.digMask;
    this.digMaskGroup;
    this.digMaskAmount = 2;

    this.hitSound = game.add.audio('hit');
    this.jumpSound = game.add.audio('jump');
    this.bonusSound = game.add.audio('bonus');

    // test
    // 
    // this.floorYPos = [92, 184, 276, 368, 460 ];
    // this.spikesAmount = 10;
    // this.nFloor = this.floorYPos.length;

    // bg
    game.background = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'background');
    game.background.autoScroll(-60, 0);

    // player
    var startedPlayerXPos = this.levelStart;
    var startedPlayerYPos = this.floorYPos[this.currentFloor] - game.cache.getImage(PLAYER_SPRITE_NAME).height / 2;
    this.thePlayer = game.add.sprite(startedPlayerXPos, startedPlayerYPos, PLAYER_SPRITE_NAME);
    this.thePlayer.anchor.setTo(0.5, 0.5);
    this.thePlayer.allowGravity = true;
    
    // floor
    this.drawFloor();
    
    var i;

    // spikes (set randomly)
    this.spikesGroup = game.add.group();
    for (i = 0; i < this.spikesAmount; i += 1) {
      var floorIdx = this.randomFloor();
      var spikeXPos = Math.floor(Math.random() * 400) + 120;
      var spikeYPos = this.floorYPos[floorIdx] - game.cache.getImage(SPIKE_SPRITE_NAME).height / 2;

      this.theSpike = game.add.sprite(spikeXPos, spikeYPos, SPIKE_SPRITE_NAME);
      this.theSpike.anchor.setTo(0.5, 0.5);
      this.spikesGroup.add(this.theSpike);
    }

    // mask dash (set randomly)
    this.dashMaskGroup = game.add.group();
    for (i = 0; i < this.dashMaskAmount; i += 1) {
      var floorIdx = this.randomFloor();
      var maskDashXPos = Math.floor(Math.random() * 400) + 120;
      var maskDashYPos = this.floorYPos[floorIdx] - 2 * game.cache.getImage('maskdash').height;

      this.dashMask = game.add.sprite(maskDashXPos, maskDashYPos, 'maskdash');
      this.dashMask.anchor.setTo(0.5, 0.5);
      this.dashMaskGroup.add(this.dashMask);

      game.physics.arcade.enable(this.dashMask);
      this.dashMask.body.allowGravity = false;
    }

    // mask fire (set randomly)
    this.fireMaskGroup = game.add.group();
    for (i = 0; i < this.fireMaskAmount; i += 1) {
      // var floorIdx = this.randomFloor();
      // var spikeXPos = Math.floor(Math.random() * 400) + 120;
      // var spikeYPos = this.floorYPos[floorIdx] - game.cache.getImage(SPIKE_SPRITE_NAME).height / 2;

      // this.theSpike = game.add.sprite(spikeXPos, spikeYPos, SPIKE_SPRITE_NAME);
      // this.theSpike.anchor.setTo(0.5, 0.5);
      // this.spikesGroup.add(this.theSpike);
    }

    // mask dig (set randomly)
    this.digMaskGroup = game.add.group();
    for (i = 0; i < this.digMaskAmount; i += 1) {
      // var floorIdx = this.randomFloor();
      // var spikeXPos = Math.floor(Math.random() * 400) + 120;
      // var spikeYPos = this.floorYPos[floorIdx] - game.cache.getImage(SPIKE_SPRITE_NAME).height / 2;

      // this.theSpike = game.add.sprite(spikeXPos, spikeYPos, SPIKE_SPRITE_NAME);
      // this.theSpike.anchor.setTo(0.5, 0.5);
      // this.spikesGroup.add(this.theSpike);
    }

    // enable body
    game.physics.arcade.enable([
      this.thePlayer,
      this.spikesGroup,
      // this.dashMaskGroup,
      // this.fireMaskGroup,
      // this.digMaskGroup
    ]);

    // input
    game.input.onDown.add(this.jump, this);

    // emitter
    var nEmitter = 30;
    this.emitter = game.add.emitter(0, 0, nEmitter);
    this.emitter.makeParticles('pixel');
    this.emitter.gravity = 0;
    this.emitter.minParticleSpeed.setTo(-200, -200);
    this.emitter.maxParticleSpeed.setTo(200, 200);

    // bg sound
    game.add.audio('music').play('', 0, 0.1, true);
  },
  render: function() {
    game.debug.spriteInfo(this.thePlayer, 8, 16);
    game.debug.bodyInfo(this.thePlayer, 8, 106);
    game.debug.body(this.thePlayer);

    DEBUG_XPOS = STARTED_DEBUG_XPOS;
    DEBUG_YPOS = STARTED_DEBUG_YPOS;

    this.echoDebug('Mask', this.currentMask);
    this.echoDebug('Floor', this.currentFloor);
  },
  drawFloor: function() {
    /*
    var floor = game.add.graphics(0, 0);
    floor.lineStyle(this.floorHeight, 0x440044, 1);

    var i = 0;
    var n = this.floorYPos.length;
    for (i; i < n; i += 1) {
      floor.moveTo(this.levelStart, this.floorYPos[i] + this.floorHeight / 2); // start pos
      floor.lineTo(this.levelEnd, this.floorYPos[i] + this.floorHeight / 2); // end pos
    }
    */

    // set platforms
    this.platforms = game.add.group();
    this.platforms.enableBody = true;
    var i = 0;
    var n = this.floorYPos.length;
    var mNumber = 60;
    for (i; i < n; i += 1) {
      var floor = this.platforms.create(0 - mNumber, this.floorYPos[i], 'floor');
      floor.scale.setTo(2, 1);
      floor.body.immovable = true;
      floor.body.allowGravity = false;
    }
    
  },
  randomFloor: function() {
    return Math.floor(Math.random() * this.floorYPos.length);
  },
  jump: function() {
    if (!this.isJumping && this.thePlayer.y === this.getStartedPlayerYPos()) {
      this.jumpSound.play('', 0, 0.1);
      this.jumpTime = 0;
      this.isJumping = true;

    } else {
      if (this.currentMask == 'dash') {
        var mod = this.currentFloor % 2;
        var step = 120;
        var xStep = (this.currentFloor % 2 == 0) ? step : -step;
        var newXPos = this.thePlayer.x + xStep;
        var newYPos = this.thePlayer.y;
        // var newYPos = this.getStartedPlayerYPos();

        var currentPos = { x: this.thePlayer.x, y: this.thePlayer.y };
        var targetedPos = { x: newXPos, y: newYPos }

        var moveTime = 120;

        this.playerTween = game.add.tween(this.thePlayer)
          .to(currentPos, moveTime, Phaser.Easing.Linear.None)
          .to(targetedPos, moveTime, Phaser.Easing.Linear.None).start();

        this.resetCurrentMask();
      }
    }
  },
  resetCurrentMask: function() {
    this.currentMask = '';
  },
  isMovingToNextFloor: function() {
    var mod = this.currentFloor % 2;
    var isEvenToOddFloor = (mod === 0 && this.thePlayer.x > this.levelEnd);
    var isOddToEvenFloor = (mod === 1 && this.thePlayer.x < this.levelStart);

    return isEvenToOddFloor || isOddToEvenFloor;
  },
  goToNextLevel: function() {
    // TODO
    // 
    // add new level
    this.currentFloor = 0;
  },
  fadeAllEmitter: function() {
    // var msg = 'emitter - ';
    // msg += 'countLiving: ' + this.emitter.countLiving() + ', ';
    // msg += 'countDead: ' + this.emitter.countDead();
    // console.log(msg);

    this.emitter.forEachAlive(function(particle) {
      particle.alpha = game.math.clamp(particle.lifespan / 100, 0, 1);
    }, this);
  },
  goToFirstFloor: function() {
    // unused
    
    this.currentFloor = 0;
  },
  resetCurrentLevel: function() {
    // unused
    
    this.currentFloor = 0;
  },
  playerHit: function(player, mask) {
    this.hitSound.play('', 0, 0.2);
    
    this.emitter.x = this.thePlayer.x + this.thePlayer.width / 2;
    this.emitter.y = this.thePlayer.y + this.thePlayer.height / 2;
    this.emitter.start(true, 300, null, 8);

    this.resetPlayerStat();
  },
  getDashMask: function(player, mask) {
    this.bonusSound.play('', 0, 0.1);
    mask.kill();
    this.currentMask = 'dash';
  },
  getStartedPlayerYPos: function() {
    return this.floorYPos[this.currentFloor] - game.cache.getImage(PLAYER_SPRITE_NAME).height / 2;
  },
  resetPlayerStat: function() {
    var mod = this.currentFloor % 2;
    this.isJumping = false;
    this.thePlayer.rotation = 0;
    this.thePlayer.x = this.levelEnd * mod + this.levelStart * (1 - mod);
    this.thePlayer.y = this.getStartedPlayerYPos();
  },
  update: function() {
    game.physics.arcade.collide(this.platforms, this.thePlayer);
    game.physics.arcade.collide(this.platforms, this.spikesGroup);

    var mod = this.currentFloor % 2; // odd / even floor

    this.thePlayer.x += this.xSpeed * (1 - 2 * mod);

    // up to next floor
    if (this.isMovingToNextFloor()) {

      if (this.playerTween) {
        this.playerTween.stop();
        delete this.playerTween;
      }

      this.currentFloor++;

      // finish the last floor
      if (this.currentFloor > this.nFloor - 1) {
        this.goToNextLevel();
      }

      this.resetPlayerStat();
    }
    
    // if jumping
    if (this.isJumping) {
      var jumpFrames = this.jumpWidth / this.xSpeed;
      var degreesPerFrame = this.jumpRotation / jumpFrames * (1 - 2 * mod);
      var radiansPerFrame = (180 / jumpFrames) * this.degToRad;
      
      this.jumpTime += 1;
      this.thePlayer.angle += degreesPerFrame;

      this.thePlayer.y = this.getStartedPlayerYPos();
      this.thePlayer.y -= this.jumpHeight * Math.sin(radiansPerFrame * this.jumpTime);

      // jumped enough...
      if (this.jumpTime == jumpFrames) {
        this.isJumping = false;
        this.thePlayer.y = this.getStartedPlayerYPos();
      }
    }

    this.fadeAllEmitter();

    game.physics.arcade.overlap(this.thePlayer, this.spikesGroup, this.playerHit, null, this);
    game.physics.arcade.overlap(this.thePlayer, this.dashMaskGroup, this.getDashMask, null, this);
  }
};

/*================================================================ GAME
*/

var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'game-box');
game.state.add('Boot', Game.Boot);
game.state.add('Load', Game.Load);
// game.state.add('Menu', Game.Menu);
game.state.add('Play', Game.Play);
// game.state.add('End', Game.End);

game.state.start('Boot');
