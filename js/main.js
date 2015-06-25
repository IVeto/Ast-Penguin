//Start enchant.js
enchant();

//On document load
window.onload = function() {
  //Starting point
  var game = new Game(320, 440);
  //Preload resources
  game.preload('res/ast.png',
    'res/space_ship.png',
    'res/Ice.png',
    'res/Astroid.png',
    'res/explosion.png');
  //Game settings
  game.fps = 60;
  game.scale = 1;
  game.onload = function() {
      console.log("Hi, Space!");
      var scene = new SceneGame();
      game.pushScene(scene);
    }
    //Start
  game.start();
  // SceneGame
  var SceneGame = Class.create(Scene, {
    // The main gameplay scene.
    initialize: function() {
      var game, scoreLabel,livesLabel, bg, iceGroup, astroidGroup,explosionGroup,
       space_ship;
      //Call superclass constructor
      Scene.apply(this);
      //Access to the game singleton instance
      game = Game.instance;
      //Create child nodes
      bg = new Sprite(320, 440);
      bg.image = game.assets['res/ast.png'];

      //Make score label
      scoreLabel = new Label('SCORE<br>0');
      scoreLabel.x = 10;
      scoreLabel.y = 40;
      scoreLabel.color = 'white';
      scoreLabel.font = '16px strong';
      scoreLabel.textAlign = 'right';
      scoreLabel._style.textShadow = "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
      this.scoreLabel = scoreLabel;

      //Make lives label
      livesLabel = new Label('LIVES<br>0');
      livesLabel.x = 10;
      livesLabel.y = 40;
      livesLabel.color = 'white';
      livesLabel.font = '16px strong';
      livesLabel.textAlign = 'left';
      livesLabel._style.textShadow = "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
      this.livesLabel = livesLabel;

      //making a the SpaceShip
      spaceShip = new SpaceShip();
      spaceShip.image = game.assets['res/space_ship.png'];
      spaceShip.x = game.width / 2 - spaceShip.width / 8;
      spaceShip.y = 280;
      this.spaceShip = spaceShip;

      // Ice group
      iceGroup = new Group();
      this.iceGroup = iceGroup;

      // Astroid group
      astroidGroup = new Group();
      this.astroidGroup = astroidGroup;

      // explosion group
      explosionGroup = new Group();
      this.explosionGroup = explosionGroup;

      // Add child nodes
      this.addChild(bg);
      this.addChild(iceGroup);
      this.addChild(astroidGroup);
      this.addChild(explosionGroup);
      this.addChild(scoreLabel);
      this.addChild(livesLabel);
      this.addChild(spaceShip);

      this.addEventListener(Event.TOUCH_START, this.handleTouchControl);

      this.addEventListener(Event.ENTER_FRAME, this.update);

      // Instance variables
      this.generateTimer = 0;
      this.score = 0;
      this.lives =5;

      //set labels
      this.setScore(0);
      this.setLives(5);
    },
    handleTouchControl: function(evt) {
      var laneWidth, lane;
      laneWidth = 320 / 3;
      lane = Math.floor(evt.x / laneWidth);
      lane = Math.max(Math.min(2, lane), 0);
      this.spaceShip.switchToLaneNumber(lane);
    },
    update: function(evt) {
      // Check if it's time to create a new set of obstacles
      this.generateTimer += evt.elapsed * 0.001;
      if (this.generateTimer >= 0.7) {
        if (Math.floor(Math.random() * 2) < 1) {
          var ice;
          this.generateTimer -= 0.7;
          ice = new Ice(Math.floor(Math.random() * 3));
          this.iceGroup.addChild(ice);
        } else {
          var astroid;
          this.generateTimer -= 0.7;
          astroid = new Astroid(Math.floor(Math.random() * 3));
          this.astroidGroup.addChild(astroid);
        }

      }
      // Check collision with ice
      for (var i = this.iceGroup.childNodes.length - 1; i >= 0; i--) {
        var ice;
        ice = this.iceGroup.childNodes[i];
        if (ice.intersect(this.spaceShip)) {
          this.iceGroup.removeChild(ice);
          this.setScore(this.score + 1)
          break;
        }
      }
      // Check collision with astroids
      for (var i = this.astroidGroup.childNodes.length - 1; i >= 0; i--) {
        var astroid;
        astroid = this.astroidGroup.childNodes[i];
        if (astroid.intersect(this.spaceShip)) {
          explosion = new Explosion(astroid.x - 110,astroid.y - 110);
          this.explosionGroup.addChild(explosion);
          this.astroidGroup.removeChild(astroid);
          // Game over
          if(this.lives>1){
            this.setLives(this.lives-1);
          }
          else{
            game.replaceScene(new SceneGameOver(this.score));
            break;
          }
        }
      }
    },
    //function to set score to a value
    setScore: function(value) {
      this.score = value;
      this.scoreLabel.text = 'SCORE<br>' + this.score;
    },
    //function to set lives to a value
    setLives: function(value) {
      this.lives = value;
      this.livesLabel.text = 'LIVES<br>' + this.lives;
    }
  });

  var SpaceShip = Class.create(Sprite, {
    // The player character.
    initialize: function() {
      // Call superclass constructor
      Sprite.apply(this, [60, 60]);
      this.image = Game.instance.assets['res/space_ship.png'];
      // Animate
      this.animationDuration = 0;
      //Target position; starting on lane 2
      this.Target = 160 - this.width / 2;
      this.frame = 0;
      this.addEventListener(Event.ENTER_FRAME, this.updateAnimation);
    },
    updateAnimation: function(evt) {
      this.animationDuration += evt.elapsed * 0.001;
      if (this.animationDuration >= 0.25) {
        this.frame++;
        if (this.frame > 7) {
          this.frame = 0;
        }
        this.animationDuration -= 0.25;
      }
      //smoth lane change animation
      if (this.Target - this.x != 0) {
        this.x = this.x + (this.Target - this.x) / 10;
      }
    },
    switchToLaneNumber: function(lane) {
      var targetX = 160 - this.width / 2 + (lane - 1) * 90;
      var diff = targetX - this.x;
      //set Target for animation in updateAnimation
      this.Target = targetX;
    }
  });
//};


// Ice Boulder
var Ice = Class.create(Sprite, {
  // The obstacle that the penguin must avoid
  initialize: function(lane) {
    // Call superclass constructor
    Sprite.apply(this, [48, 49]);
    this.image = Game.instance.assets['res/Ice.png'];
    this.rotationSpeed = 0;
    this.setLane(lane);
    this.addEventListener(Event.ENTER_FRAME, this.update);
  },
  setLane: function(lane) {
    var game, distance;
    game = Game.instance;
    distance = 90;

    this.rotationSpeed = Math.random() * 100 - 50;

    this.x = game.width / 2 - this.width / 2 + (lane - 1) * distance;
    this.y = -this.height;
    this.rotation = Math.floor(Math.random() * 360);
  },
  update: function(evt) {
    var ySpeed, game;

    game = Game.instance;
    ySpeed = 200;

    this.y += ySpeed * evt.elapsed * 0.001;
    this.rotation += this.rotationSpeed * evt.elapsed * 0.001;
    if (this.y > game.height) {
      this.parentNode.removeChild(this);
    }
  }
});

// Astroid
var Astroid = Class.create(Sprite, {
  // The obstacle that the penguin must avoid
  initialize: function(lane) {
    // Call superclass constructor
    Sprite.apply(this, [49, 49]);
    this.image = Game.instance.assets['res/Astroid.png'];
    this.rotationSpeed = 0;
    this.setLane(lane);
    this.addEventListener(Event.ENTER_FRAME, this.update);
  },
  setLane: function(lane) {
    var game, distance;
    game = Game.instance;
    distance = 90;

    this.rotationSpeed = Math.random() * 100 - 50;

    this.x = game.width / 2 - this.width / 2 + (lane - 1) * distance;
    this.y = -this.height;
    this.rotation = Math.floor(Math.random() * 360);
  },
  update: function(evt) {
    var ySpeed, game;

    game = Game.instance;
    ySpeed = 200;

    this.y += ySpeed * evt.elapsed * 0.001;
    this.rotation += this.rotationSpeed * evt.elapsed * 0.001;
    if (this.y > game.height) {
      this.parentNode.removeChild(this);
    }
  }
});
// Explosion
var Explosion = Class.create(Sprite, {
  // The obstacle that the penguin must avoid
  initialize: function(x,y) {
    // Call superclass constructor
    Sprite.apply(this, [256, 256]);
    this.image = Game.instance.assets['res/explosion.png'];
    this.rotationSpeed = 0;
    this.animationDuration = 0;
    this.frame = 0;
    this.setPosition(x,y);
    this.addEventListener(Event.ENTER_FRAME, this.update);
  },
  setPosition: function(x,y) {
    this.rotationSpeed = Math.random() * 100 - 50;
    this.x = x;
    this.y = y;
    this.rotation = Math.floor(Math.random() * 360);
  },
  update: function(evt) {
    var ySpeed, game;

    game = Game.instance;
    ySpeed = 200;

    this.y += ySpeed * evt.elapsed * 0.001;
    this.rotation += this.rotationSpeed * evt.elapsed * 0.001;
    if (this.y > game.height) {
      this.parentNode.removeChild(this);
    }

    this.animationDuration += evt.elapsed * 0.001;
    if (this.animationDuration >= 0.04) {
      this.frame++;
      if (this.frame > 16) {
        this.parentNode.removeChild(this);
      }
      this.animationDuration -= 0.04;
    }
  }
});


// SceneGameOver
var SceneGameOver = Class.create(Scene, {
  initialize: function(score) {
    var gameOverLabel, scoreLabel;
    Scene.apply(this);
    this.backgroundColor = 'black';
    // Game Over label
    gameOverLabel = new Label("GAME OVER<br><br>Tap to Restart");
    gameOverLabel.x = 8;
    gameOverLabel.y = 150;
    gameOverLabel.color = 'white';
    gameOverLabel.font = '32px strong';
    gameOverLabel.textAlign = 'center';
    // Score label
    scoreLabel = new Label('SCORE<br>' + score);
    scoreLabel.x = 9;
    scoreLabel.y = 32;
    scoreLabel.color = 'white';
    scoreLabel.font = '16px strong';
    scoreLabel.textAlign = 'center';
    // Add labels
    this.addChild(gameOverLabel);
    this.addChild(scoreLabel);
    // Listen for taps
    this.addEventListener(Event.TOUCH_START, this.touchToRestart);
  },
  touchToRestart: function(evt) {
    //var game = Game.instance;
    var scene = new SceneGame();
    game.pushScene(scene);
    //game.replaceScene(new SceneGame());
  }
});

};
