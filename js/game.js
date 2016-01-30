'use strict';

/*================================================================ VAR
*/

var WIDTH = 640;
var HEIGHT = 480;
WIDTH = 736;
HEIGHT = 414;
var GAME_ID = 'game-box';
var Game = {};

var LOADING_SCREEN_COLOR;
var TITLE_COLOR;
var SUBTITLE_COLOR;

// white theme (white bg, font back)
LOADING_SCREEN_COLOR = '#eee';
TITLE_COLOR = '#545454';
SUBTITLE_COLOR = '#65655B';

var GAME_NAME = 'KiKi - The Sacrifice';
var SUBTITLE_TEXT = 'by - JAM 2016';

var PLAYER_SPRITE_NAME = 'square';

var PLAYER_SPRITE_WIDTH;
var PLAYER_SPRITE_HEIGHT;

// forest guy / new guy
PLAYER_SPRITE_WIDTH = 40;
PLAYER_SPRITE_HEIGHT = 40;

var IS_OVER = false;
var IS_DEBUG = false;
var PAUSE_DELAY = 200;

var DEBUG_XPOS;
var DEBUG_YPOS;

var STARTED_DEBUG_XPOS = 400;
var STARTED_DEBUG_YPOS = 8;

var LIFE = 3;
var MAX_LIFE = 3;
var SCORE = 0;
var BEST_SCORE = 0;

var CURRENT_FLOOR = 0;
var FLOOR_Y_POS = [118, 256, 394];
var N_FLOOR = FLOOR_Y_POS.length;

/*================================================================ UTIL
*/

// 0 -> n
function rand(num) {
  return Math.floor(Math.random() * num);
}

// min -> max
// http://stackoverflow.com/questions/4959975/generate-random-value-between-two-numbers-in-javascript
function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*================================================================ BOOT
*/

Game.Boot = function(game) {};
Game.Boot.prototype = {
  preload: function() {
    game.stage.backgroundColor = LOADING_SCREEN_COLOR;
    game.load.image('loading', 'assets/images/loading.png');
    game.load.image('loadingborder', 'assets/images/loading-border.png');
  },
  create: function() {
    game.state.start('Load');
  }
};

/*================================================================ LOAD
*/

Game.Load = function(game) {};
Game.Load.prototype = {
  setPreloadingBg: function() {
    game.stage.backgroundColor = LOADING_SCREEN_COLOR;
  },
  setPreloadingText: function() {
    var titleStyle = { font:'50px Arial', fill: TITLE_COLOR };
    var title = game.add.text(
      WIDTH / 2,
      HEIGHT / 2 - 20,
      GAME_NAME,
      titleStyle);
    title.anchor.setTo(0.5, 1);

    var subTitleTextStyle = { font:'16px Arial', fill: SUBTITLE_COLOR };
    var subTitle = game.add.text(
      WIDTH / 2,
      HEIGHT / 2,
      SUBTITLE_TEXT,
      subTitleTextStyle);
    subTitle.anchor.setTo(0.5, 1);
  },
  setPreloadingImage: function() {
    // set preloading images
    var preloadingBorder = game.add.sprite(WIDTH / 2, HEIGHT / 2 + 30, 'loadingborder');
    preloadingBorder.x -= preloadingBorder.width / 2;
    preloadingBorder.alpha = 0.5;

    var preloading = game.add.sprite(WIDTH / 2, HEIGHT / 2 + 30, 'loading');
    preloading.x -= preloading.width / 2;
    game.load.setPreloadSprite(preloading);
  },
  preload: function() {
    this.setPreloadingBg();
    this.setPreloadingImage();
    this.setPreloadingText();

    // load all asets
    game.load.spritesheet(PLAYER_SPRITE_NAME, 'assets/images/player.png', PLAYER_SPRITE_WIDTH, PLAYER_SPRITE_HEIGHT);

    game.load.image('totem1', 'assets/images/totem1.png');
    game.load.image('totem2', 'assets/images/totem2.png');
    game.load.image('totem3', 'assets/images/totem3.png');

    game.load.image('dieparticle', 'assets/images/die-particle.png');
    game.load.image('warpparticle', 'assets/images/warp-particle.png');
    game.load.image('maskparticle', 'assets/images/mask-particle.png');

    game.load.image('background', 'assets/images/bg.jpg');
    game.load.image('floor', 'assets/images/floor.jpg');
    game.load.image('startbutton', 'assets/images/start-button.png');
    game.load.image('pausebutton', 'assets/images/pause-button.png');
    game.load.image('restartbutton', 'assets/images/restart-button.png');
    game.load.image('overpanel', 'assets/images/overpanel.png');

    game.load.spritesheet('dashmask', 'assets/images/mask-dash.png', 20, 20);
    game.load.spritesheet('digmask', 'assets/images/mask-dig.png', 20, 20);
    game.load.spritesheet('firemask', 'assets/images/mask-fire.png', 20, 20);

    game.load.spritesheet('lifeitem', 'assets/images/item-life.png', 20, 20);

    game.load.audio('hit', 'assets/sounds/hit.wav');
    game.load.audio('jump', 'assets/sounds/jump.wav');
    game.load.audio('music', 'assets/sounds/music.wav');
    game.load.audio('bonus', 'assets/sounds/bonus.wav');
    game.load.audio('item', 'assets/sounds/item.mp3');
  },
  create: function() {
    game.state.start('Menu');
  }
};

/*================================================================ MENU
*/

Game.Menu = function(game) {};
Game.Menu.prototype = {
  setPreloadingBg: function() {
    game.stage.backgroundColor = LOADING_SCREEN_COLOR;
  },
  setPreloadingText: function() {
    var titleStyle = { font: '50px Arial', fill: TITLE_COLOR };
    var title = game.add.text(
      WIDTH / 2,
      HEIGHT / 2 - 20,
      GAME_NAME,
      titleStyle);
    title.anchor.setTo(0.5, 1);

    var subTitleTextStyle = { font: '16px Arial', fill: SUBTITLE_COLOR };
    var subTitle = game.add.text(
      WIDTH / 2,
      HEIGHT / 2,
      SUBTITLE_TEXT,
      subTitleTextStyle);
    subTitle.anchor.setTo(0.5, 1);
  },
  setStartButton: function() {
    this.startButton = game.add.button(WIDTH / 2, 280, 'startbutton', this.startClick, this);
    this.startButton.anchor.setTo(0.5, 0.5);
  },
  create: function() {
    this.setPreloadingBg();
    this.setPreloadingText();
    this.setStartButton();
  },
  startClick: function() {
    game.state.start('Play');
  }
};

/*================================================================ PLAY
*/

Game.Play = function(game) {};
Game.Play.prototype = {
  echoDebug: function(txt, val) {
    game.debug.text(txt + ': ' + val, DEBUG_XPOS, DEBUG_YPOS += 20);
  },
  drawMask: function(maskNameGroup, maskSpriteName, n) {
    for (var i = 0; i < n; i += 1) {
      var floorIdx = this.randomFloor();
      var maskXPos = Math.floor(Math.random() * 400) + 120;
      var maskYPos = FLOOR_Y_POS[floorIdx] - 2 * game.cache.getImage(maskSpriteName).height;

      var mask = game.add.sprite(maskXPos, maskYPos, maskSpriteName);
      var spin = mask.animations.add('spin');
      mask.animations.play('spin', 14, true);

      mask.anchor.setTo(0.5, 0.5);
      maskNameGroup.add(mask);

      game.physics.arcade.enable(mask);
      mask.body.allowGravity = false;
    }
  },
  drawItem: function(itemNameGroup, itemSpriteName, n) {
    // quite duplicate with drawMask()
    for (var i = 0; i < n; i += 1) {
      var floorIdx = this.randomFloor();
      var xPos = Math.floor(Math.random() * 400) + 120;
      var yPos = FLOOR_Y_POS[floorIdx] - 2 * game.cache.getImage(itemSpriteName).height;

      var item = game.add.sprite(xPos, yPos, itemSpriteName);
      var spin = item.animations.add('spin');
      item.animations.play('spin', 6, true);

      item.anchor.setTo(0.5, 0.5);
      itemNameGroup.add(item);

      game.physics.arcade.enable(item);
      item.body.allowGravity = false;
    }
  },
  pauseGame: function() {
    if (!IS_OVER) {
      game.paused = true;
      
      var pauseText = 'GAME PAUSED';
      var pauseStyle = { font: '50px Arial', fill: '#fff' };

      var pauseLabel = this.add.text(
        WIDTH / 2,
        HEIGHT / 2,
        pauseText,
        pauseStyle);
      pauseLabel.anchor.setTo(0.5, 1);

      this.input.onDown.add(function() {
        pauseLabel.destroy();
        game.paused = false;
      }, this);
    }
  },
  restartGame: function() {
    this.newGame();
  },
  updateScore: function(num) {
    SCORE = num;
    var text = 'SCORE: ' + SCORE;
    this.scoreLabel.setText(text);
  },
  updateBestScore: function(num) {
    BEST_SCORE = num;
    var text = 'BEST: ' + BEST_SCORE;
    this.bestScoreLabel.setText(text);
  },
  updateLife: function(num) {
    if (num > MAX_LIFE) {
      num = MAX_LIFE;

    } else if (num == 0) {
      num = 0;
    }

    LIFE = num;
    var text = 'LIFE: ' + LIFE;
    this.lifeLabel.setText(text);
  },
  updateMask: function(str) {
    this.currentMask = str;
    var text = 'MASK: ' + this.currentMask;
    this.maskLabel.setText(text);
  },
  setPlayer: function() {
    // player
    this.xSpeed = 200;
    var startedPlayerXPos = 0;
    var startedPlayerYPos = FLOOR_Y_POS[CURRENT_FLOOR] - game.cache.getImage(PLAYER_SPRITE_NAME).height / 2;

    this.thePlayer = game.add.sprite(PLAYER_SPRITE_WIDTH, startedPlayerYPos, PLAYER_SPRITE_NAME);
    this.thePlayer.scale.setTo(0.5, 0.5);

    var run = this.thePlayer.animations.add('run');
    this.thePlayer.animations.play('run', PLAYER_SPRITE_WIDTH, true);

    this.thePlayer.anchor.setTo(0.5, 0.5);
    game.physics.arcade.enable(this.thePlayer);
    this.thePlayer.allowGravity = true;
    this.thePlayer.body.velocity.x = this.xSpeed
  },
  setPauseButton: function() {
    var xPos = WIDTH - 40;
    var yPos = 40;

    this.pauseButton = game.add.button(xPos, yPos, 'pausebutton', this.pauseGame, this);
    this.pauseButton.anchor.setTo(0.5, 0.5);
  },
  setRestartButton: function() {
    var xPos = WIDTH - 100;
    var yPos = 40;

    this.restartButton = game.add.button(xPos, yPos, 'restartbutton', this.restartGame, this);
    this.restartButton.anchor.setTo(0.5, 0.5);
  },
  setScoreLabel: function() {
    var scoreText = 'SCORE: ' + SCORE;
    var scoreStyle = { font: '16px Arial', fill: '#fff' };
    this.scoreLabel = this.add.text(16, 16, scoreText, scoreStyle);
    this.scoreLabel.anchor.setTo(0, 0);
  },
  setBestScoreLabel: function() {
    var bestScoreText = 'BEST: ' + SCORE;
    var bestScoreStyle = { font: '16px Arial', fill: '#fff' };
    this.bestScoreLabel = this.add.text(16, 32 + 4, bestScoreText, bestScoreStyle);
    this.bestScoreLabel.anchor.setTo(0, 0);
  },
  setLifeLabel: function() {
    var lifeText = 'LIFE: ' + LIFE;
    var lifeStyle = { font: '16px Arial', fill: '#fff' };
    this.lifeLabel = this.add.text(16, 48 + 8, lifeText, lifeStyle);
    this.lifeLabel.anchor.setTo(0, 0);
  },
  clearGameOverLabel: function() {
    this.gameOverLabel.setText('');
  },
  setMaskLabel: function() {
    var maskText = 'MASK: ' + this.currentMask;
    var maskStyle = { font: '16px Arial', fill: '#fff' };
    this.maskLabel = this.add.text(16, 64 + 12, maskText, maskStyle);
    this.maskLabel.anchor.setTo(0, 0);
  },
  setDashMask: function() {
    this.dashMaskGroup;
    this.dashMaskAmount = 5;
    this.dashMaskGroup = game.add.group();
    this.generateDashMask();
  },
  killAllDashMasks: function() {
    this.dashMaskGroup.forEach(function(mask) {
      mask.kill();
    });
  },
  generateDashMask: function() {
    this.drawMask(this.dashMaskGroup, 'dashmask', this.dashMaskAmount);
    game.physics.arcade.enable(this.dashMaskGroup);
  },
  regenerateDashMask: function() {
    this.killAllDashMasks();
    this.generateDashMask();
  },
  setFireMask: function() {
    this.fireMaskGroup;
    this.fireMaskAmount = 0;
    this.fireMaskGroup = game.add.group();
    this.generateFireMask();
  },
  killAllFireMasks: function() {
    this.fireMaskGroup.forEach(function(mask) {
      mask.kill();
    });
  },
  generateFireMask: function() {
    this.drawMask(this.fireMaskGroup, 'firemask', this.fireMaskAmount);
    game.physics.arcade.enable(this.fireMaskGroup);
  },
  regenerateFireMask: function() {
    this.killAllFireMasks();
    this.generateFireMask();
  },
  setDigMask: function() {
    this.digMaskGroup;
    this.digMaskAmount = 5;
    this.digMaskGroup = game.add.group();
    this.generateDigMask();
  },
  killAllDigMasks: function() {
    this.digMaskGroup.forEach(function(mask) {
      mask.kill();
    });
  },
  generateDigMask: function() {
    this.drawMask(this.digMaskGroup, 'digmask', this.digMaskAmount);
    game.physics.arcade.enable(this.digMaskGroup);
  },
  regenerateDigMask: function() {
    this.killAllDigMasks();
    this.generateDigMask();
  },
  regenerateAllMasks: function() {
    this.regenerateDashMask();
    this.regenerateFireMask();
    this.regenerateDigMask();
  },
  setLifeItem: function() {
    this.lifeItemGroup;
    this.lifeItemAmount = 1;
    this.lifeItemGroup = game.add.group();
    this.generateLifeItem();
  },
  killAllLifeItems: function() {
    this.lifeItemGroup.forEach(function(item) {
      item.kill();
    });
  },
  generateLifeItem: function() {
    this.drawItem(this.lifeItemGroup, 'lifeitem', this.lifeItemAmount);
    game.physics.arcade.enable(this.lifeItemGroup);
  },
  regenerateLifeItem: function() {
    this.killAllLifeItems();
    this.generateLifeItem();
  },
  setTotem: function() {
    this.totemGroup;
    this.totemAmount = 8;
    this.totemGroup = game.add.group();
    this.generateTotem();
  },
  killAllTotems: function() {
    this.totemGroup.forEach(function(totem) {
      totem.kill();
    });
  },
  generateTotem: function() {
    for (var i = 0; i < this.totemAmount; i += 1) {
      var floorIdx = this.randomFloor();
      var xPos = Math.floor(Math.random() * 400) + 120;
      var yPos;
      var mNumber = 16;
      yPos = FLOOR_Y_POS[floorIdx] - mNumber;

      var totemIdx = randBetween(1, 3);
      var theTotem = game.add.sprite(xPos, yPos, 'totem' + totemIdx);
      theTotem.anchor.setTo(0.5, 0.5);
      this.totemGroup.add(theTotem);
    }

    game.physics.arcade.enable(this.totemGroup);
  },
  regenerateTotem: function() {
    this.killAllTotems();
    this.generateTotem();
  },
  setPlugin: function() {
    game.plugins.screenShake = this.game.plugins.add(Phaser.Plugin.ScreenShake);
  },
  setPhysics: function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.gravity.y = 900;
  },
  setFloor: function() {
    CURRENT_FLOOR = 0; // floor idx
    
    this.platforms = game.add.group();
    this.platforms.enableBody = true;
    var i = 0;
    var n = FLOOR_Y_POS.length;
    for (i; i < n; i += 1) {
      var floor = this.platforms.create(0, FLOOR_Y_POS[i], 'floor');
      floor.scale.setTo(1, 1);
      floor.body.immovable = true;
      floor.body.allowGravity = false;
    }  
  },
  setBg: function() {
    game.background = game.add.tileSprite(0, 0, game.world.width, game.world.height, 'background');
  },
  setInput: function() {
    // left-click
    game.input.onDown.add(this.jump, this)
  },
  setDieEmitter: function() {
    var nDieEmitter = 30;
    this.dieEmitter = game.add.emitter(0, 0, nDieEmitter);
    this.dieEmitter.makeParticles('dieparticle');
    this.dieEmitter.gravity = 0;
    this.dieEmitter.minParticleSpeed.setTo(-200, -200);
    this.dieEmitter.maxParticleSpeed.setTo(200, 200);
  },
  setWarpEmitter: function() {
    var nWarpEmitter = 30;
    this.warpEmitter = game.add.emitter(0, 0, nWarpEmitter);
    this.warpEmitter.makeParticles('warpparticle');
    this.warpEmitter.gravity = 0;
    this.warpEmitter.minParticleSpeed.setTo(-100, -100);
    this.warpEmitter.maxParticleSpeed.setTo(100, 100);
  },
  setMaskEmitter: function() {
    var nMaskEmitter = 30;
    this.maskEmitter = game.add.emitter(0, 0, nMaskEmitter);
    this.maskEmitter.makeParticles('maskparticle');
    this.maskEmitter.gravity = 0;
    this.maskEmitter.minParticleSpeed.setTo(-40, -40);
    this.maskEmitter.maxParticleSpeed.setTo(40, 40);
  },
  setSound: function() {
    this.hitSound = game.add.audio('hit');
    this.jumpSound = game.add.audio('jump');
    this.bonusSound = game.add.audio('bonus');
    this.itemSound = game.add.audio('item');

    game.add.audio('music').play('', 0, 0.1, true);
  },
  create: function() {
    this.setPlugin();
    this.setPhysics();

    this.setBg();
    
    this.setPlayer();

    this.setFloor();
    this.setTotem();

    this.setDashMask();
    this.setFireMask();
    this.setDigMask();

    this.setLifeItem();
      
    this.setPauseButton();
    this.setRestartButton();
    this.setInput();

    this.setDieEmitter();
    this.setWarpEmitter();
    this.setMaskEmitter();
    
    this.setSound();

    this.setScoreLabel();
    this.setBestScoreLabel();
    this.setLifeLabel();
    this.currentMask = '';
    this.setMaskLabel();

    // hidden
    this.setGameOverPanel();
  },
  render: function() {
    if (IS_DEBUG) {
      game.debug.spriteInfo(this.thePlayer, 8, 16);
      game.debug.bodyInfo(this.thePlayer, 8, 106);
      game.debug.body(this.thePlayer);

      DEBUG_XPOS = STARTED_DEBUG_XPOS;
      DEBUG_YPOS = STARTED_DEBUG_YPOS;
    }
  },
  randomFloor: function() {
    return Math.floor(Math.random() * FLOOR_Y_POS.length);
  },
  isEvenFloor: function() {
    return (CURRENT_FLOOR % 2)  == 0;
  },
  useDashSkill: function() {
    var dashStep = 120;
    var xStep = (this.isEvenFloor()) ? dashStep : -dashStep;
    var moveTime = 120;

    var oldPos = {
      x: this.thePlayer.x,
      y: this.thePlayer.y
    };

    var newPos = {
      x: this.thePlayer.x + xStep,
      y: this.thePlayer.y
    }

    this.playerTween = game.add.tween(this.thePlayer)
      .to(oldPos, moveTime, Phaser.Easing.Linear.None)
      .to(newPos, moveTime, Phaser.Easing.Linear.None).start();

    this.fadeMaskEmitter();
    this.resetCurrentMask();
  },
  useFireSkill: function() {
    // unused
    this.fadeMaskEmitter();
    this.resetCurrentMask();
  },
  useDigSkill: function() {
    var moveTime = 120;
    this.updateScore(SCORE + 1);

    if (CURRENT_FLOOR === N_FLOOR - 1) {
      this.regenerateTotem();
      this.regenerateLifeItem();
      this.warpToFirstFloor();

    } else {
      this.playWarpEmitter();
      this.wrapToNextFloor();
    }

    this.fadeMaskEmitter();
    this.resetCurrentMask();
  },
  isInButtonsArea: function(x, y) {
    // hacky
    // restart or pause button
    var mNumber = 140;
    var result = false;

    if ((x > WIDTH - mNumber && x < WIDTH) &&
      (y > 0 && y < mNumber)) {
      result = true;
    }

    return result;
  },
  isInPauseButtonArea: function(x, y) {
    // hacky
    var mNumber = 80;
    var result = false;
    if ((x > WIDTH - mNumber && x < WIDTH) &&
      (y > 0 && y < mNumber)) {
      result = true;
    }

    return result;
  },
  jump: function(mouse) {
    if (!this.isInButtonsArea(mouse.game.input.x, mouse.game.input.y)) {
      if (!IS_OVER) {
        // jump
        if (this.thePlayer.body.touching.down) {
          this.jumpSound.play('', 0, 0.1);
          this.thePlayer.body.velocity.y = -300;

        // use skill
        } else {
          switch (this.currentMask) {
            case 'dash':
              this.useDashSkill();
              break;
            case 'fire':
              this.useFireSkill();
              break;
            case 'dig':
              this.useDigSkill();
              break;
          }
        }
      }
    }
  },
  resetCurrentMask: function() {
    this.updateMask('');
  },
  isGoingToNextFloor: function() {
    var result = false;
    if (this.isEvenFloor() && (this.thePlayer.x > WIDTH)) {
      result = true;

    } else if (!this.isEvenFloor() && (this.thePlayer.x < 0)) {
      result = true;
    }

    return result;
  },
  fadeDieEmitter: function() {
    this.dieEmitter.forEachAlive(function(particle) {
      particle.alpha = game.math.clamp(particle.lifespan / 100, 0, 1);
    }, this);
  },
  fadeWarpEmitter: function() {
    this.warpEmitter.forEachAlive(function(particle) {
      particle.alpha = game.math.clamp(particle.lifespan / 100, 0, 1);
    }, this);  
  },
  fadeMaskEmitter: function() {
    this.maskEmitter.forEachAlive(function(particle) {
      particle.alpha = game.math.clamp(particle.lifespan / 100, 0, 1);
    }, this);  
  },
  fadeAllEmitters: function() {
    this.fadeDieEmitter();
    this.fadeWarpEmitter();
    this.fadeMaskEmitter();
  },
  playDieEmitter: function() {
    this.dieEmitter.x = this.thePlayer.x + this.thePlayer.width / 2;
    this.dieEmitter.y = this.thePlayer.y + this.thePlayer.height / 2;
    this.dieEmitter.start(true, 300, null, 8);
  },
  playMaskEmitter: function() {
    this.maskEmitter.x = this.thePlayer.x;
    this.maskEmitter.y = this.thePlayer.y;
    this.maskEmitter.start(true, 100, null, 6);
  },
  playWarpEmitter: function() {
    this.warpEmitter.x = this.thePlayer.x;
    this.warpEmitter.y = this.thePlayer.y;
    this.warpEmitter.start(true, 200, null, 6);
  },
  getDashMask: function(player, mask) {
    this.bonusSound.play('', 0, 0.1);
    mask.kill();
    this.updateMask('dash');
  },
  getFireMask: function(player, mask) {
    this.bonusSound.play('', 0, 0.1);
    mask.kill();
    this.updateMask('fire');
  },
  getDigMask: function(player, mask) {
    this.bonusSound.play('', 0, 0.1);
    mask.kill();
    this.updateMask('dig');
  },
  getLifeItem: function(player, item) {
    this.itemSound.play('', 0, 0.1);
    item.kill();
    this.updateLife(LIFE + 1);
  },
  setGameOverPanel: function() {
    var mNumber = 240;
    var startedX = WIDTH / 2;
    var startedY = HEIGHT + mNumber;

    // set
    this.gameOverPanel = game.add.sprite(startedX, startedY, 'overpanel');
    this.gameOverPanel.anchor.setTo(0.5, 0.5);
    this.gameOverPanelTween = game.add.tween(this.gameOverPanel);

    var gameOverText = 'SCORE: ' + SCORE;
    var gameOverStyle = {
      font: '50px Arial',
      fill: '#545454',
      wordWrap: true,
      wordWrapWidth: this.gameOverPanel.width,
      align: 'center'
    };
    this.gameOverLabel = this.add.text(startedX, startedY, gameOverText, gameOverStyle);
    this.gameOverLabel.anchor.setTo(0.5, 0.5);
    this.gameOverLabelTween = game.add.tween(this.gameOverLabel);

    this.startButton = game.add.button(startedX, startedY, 'startbutton', this.newGame, this);
    this.startButton.anchor.setTo(0.5, 0.5);
    this.startButtonTween = game.add.tween(this.startButton);
  },
  updateGameOverLabel: function() {
    // hacky
    var text = 'SCORE: ' + SCORE;
    this.gameOverLabel.setText(text);
  },
  fadeInGameOverPanel: function() {
    this.gameOverPanelTween.to({ y: HEIGHT / 2, alpha: 1 }, 1000, Phaser.Easing.Bounce.Out).start();
    this.gameOverLabelTween.to({ y: HEIGHT / 2 - 30, alpha: 1 }, 1000, Phaser.Easing.Bounce.Out).start();
    this.startButtonTween.to({ y: HEIGHT / 2 + 80, alpha: 1 }, 1000, Phaser.Easing.Bounce.Out).start();
  },
  fadeOutGameOverPanel: function() {
    var mNumber = 240;
    var yPos = HEIGHT + mNumber;

    this.gameOverLabel.kill();
    this.gameOverPanel.kill();
    this.startButton.kill();
  },
  gameOver: function() {
    IS_OVER = true;
    this.thePlayer.kill(); // hacky (force kill)

    if (SCORE > BEST_SCORE) {
      this.updateBestScore(SCORE);
    }
    
    this.updateGameOverLabel(); // hacky
    this.fadeInGameOverPanel();
  },
  goToFloor: function() {
    var xSpeed;
    var xPos;
    var yPos = this.getStartedPlayerYPos();
    var scaleX
    if (this.isEvenFloor()) {
      xSpeed = this.xSpeed;
      xPos = 0;
      scaleX = 0.5;
    } else {
      xSpeed = -this.xSpeed;
      xPos = WIDTH;
      scaleX = -0.5;
    }
    
    this.thePlayer.kill();
    this.thePlayer = game.add.sprite(xPos, yPos, PLAYER_SPRITE_NAME);
    this.thePlayer.anchor.setTo(0.5, 0.5);
    this.thePlayer.scale.setTo(scaleX, 0.5);

    var run = this.thePlayer.animations.add('run');
    this.thePlayer.animations.play('run', PLAYER_SPRITE_WIDTH, true);

    game.physics.arcade.enable(this.thePlayer);
    this.thePlayer.allowGravity = true;
    this.thePlayer.body.velocity.x = xSpeed;
  },
  goToCurrentFloor: function() {
    this.goToFloor();
  },
  goToNextFloor: function() {
    CURRENT_FLOOR++;
    if (CURRENT_FLOOR === N_FLOOR) {
      CURRENT_FLOOR = 0;

      // regenerate item / mask
      // when moving from last floor to the first floor
      this.regenerateTotem();
      this.regenerateLifeItem();
    }

    this.goToFloor();
  },
  goToFirstFloor: function() {
    CURRENT_FLOOR = 0;
    this.goToFloor();
  },
  warpToFloor: function() {
    var xSpeed;
    var xPos = this.thePlayer.x;
    var yPos = this.getStartedPlayerYPos() - 80;
    var scaleX
    if (this.isEvenFloor()) {
      xSpeed = this.xSpeed;
      scaleX = 0.5;
    } else {
      xSpeed = -this.xSpeed;
      scaleX = -0.5;
    }
    
    this.thePlayer.kill();
    this.thePlayer = game.add.sprite(xPos, yPos, PLAYER_SPRITE_NAME);
    this.thePlayer.anchor.setTo(0.5, 0.5);
    this.thePlayer.scale.setTo(scaleX, 0.5);

    var run = this.thePlayer.animations.add('run');
    this.thePlayer.animations.play('run', PLAYER_SPRITE_WIDTH, true);

    game.physics.arcade.enable(this.thePlayer);
    this.thePlayer.allowGravity = true;
    this.thePlayer.body.velocity.x = xSpeed;
  },
  wrapToNextFloor: function() {
    CURRENT_FLOOR++;
    this.warpToFloor();
  },
  warpToFirstFloor: function() {
    CURRENT_FLOOR = 0;
    this.warpToFloor();
  },
  hitTotem: function(player, totem) {
    this.hitSound.play('', 0, 0.2);
    game.plugins.screenShake.shake(10);
    this.playDieEmitter();
    player.kill();
    this.updateLife(LIFE - 1);

    if (LIFE <= 0) {
      this.gameOver();

    } else {
      this.goToCurrentFloor();
    }
  },
  newGame: function() {
    this.fadeOutGameOverPanel();

    IS_OVER = false;
    this.clearGameOverLabel();
    this.thePlayer.kill(); // duplicate kill
    this.fadeAllEmitters();
    this.resetCurrentMask();
    this.updateLife(3);
    this.updateScore(0);

    this.regenerateAllMasks();
    this.regenerateTotem();
    this.regenerateLifeItem();

    this.goToFirstFloor();

    // hacky
    // set game over panel and hide it
    // and we will display it later (when game over)
    this.setGameOverPanel();
  },
  getStartedPlayerYPos: function() {
    return FLOOR_Y_POS[CURRENT_FLOOR] - PLAYER_SPRITE_HEIGHT / 2;
  },
  update: function() {
    game.physics.arcade.collide(this.platforms, this.thePlayer);
    game.physics.arcade.collide(this.platforms, this.totemGroup);

    if (!IS_OVER) {  

      if (this.currentMask) {
        this.playMaskEmitter();
      }

      // up to next floor
      if (this.isGoingToNextFloor()) {
        // dash
        if (this.playerTween) {
          this.playerTween.pause();
          this.playerTween.stop();
        }

        this.updateScore(SCORE + 1);
        this.goToNextFloor();
      }

      this.fadeAllEmitters();

      var countLivingMask = 0;
      countLivingMask += this.dashMaskGroup.countLiving();
      countLivingMask += this.digMaskGroup.countLiving();
      if (countLivingMask == 0) {
        this.regenerateAllMasks();
      }

      game.physics.arcade.overlap(this.thePlayer, this.totemGroup, this.hitTotem, null, this);

      game.physics.arcade.overlap(this.thePlayer, this.dashMaskGroup, this.getDashMask, null, this);
      game.physics.arcade.overlap(this.thePlayer, this.fireMaskGroup, this.getFireMask, null, this);
      game.physics.arcade.overlap(this.thePlayer, this.digMaskGroup, this.getDigMask, null, this);

      game.physics.arcade.overlap(this.thePlayer, this.lifeItemGroup, this.getLifeItem, null, this);
    }
  }
};

/*================================================================ GAME
*/

var game = new Phaser.Game(WIDTH, HEIGHT, Phaser.AUTO, 'game-box');
game.state.add('Boot', Game.Boot);
game.state.add('Load', Game.Load);
game.state.add('Menu', Game.Menu);
game.state.add('Play', Game.Play);
game.state.add('Over', Game.Over);

game.state.start('Boot');
