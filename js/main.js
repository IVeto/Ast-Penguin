//Start enchant.js
enchant();

//On document load
window.onload = function() {
  //Starting point
  var game = new Game(320, 440);
  //Preload resources
  game.preload('res/ast.png',
    'res/space_ship.png',
    'res/Ice.png');
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
      var game, label, bg, iceGroup, space_ship;
      //Call superclass constructor
      Scene.apply(this);
      //Access to the game singleton instance
      game = Game.instance;
      //Create child nodes
      label = new Label("Hi, Ocean!");
      bg = new Sprite(320, 440);
      bg.image = game.assets['res/ast.png'];

      //making a the SpaceShip
      spaceShip = new SpaceShip();
      spaceShip.image = game.assets['res/space_ship.png'];
      spaceShip.x = game.width / 2 - spaceShip.width / 8;
      spaceShip.y = 280;
      this.spaceShip = spaceShip;

      // Ice group
      iceGroup = new Group();
      this.iceGroup = iceGroup;

      // Add child nodes
      this.addChild(bg);
      this.addChild(iceGroup);
      this.addChild(label);
      this.addChild(spaceShip);

      this.addEventListener(Event.TOUCH_START, this.handleTouchControl);

      this.addEventListener(Event.ENTER_FRAME, this.update);

      // Instance variables
      this.generateIceTimer = 0;
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
    this.generateIceTimer += evt.elapsed * 0.001;
    if (this.generateIceTimer >= 0.5) {
      var ice;
      this.generateIceTimer -= 0.5;
      ice = new Ice(Math.floor(Math.random() * 3));
      this.iceGroup.addChild(ice);
    }
    // Check collision
    for (var i = this.iceGroup.childNodes.length - 1; i >= 0; i--) {
      var ice;
      ice = this.iceGroup.childNodes[i];
      if (ice.intersect(this.spaceShip)) {
        this.iceGroup.removeChild(ice);
        break;
      }
    }
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
      this.Target=160 - this.width / 2;
      this.frame=0;
      this.addEventListener(Event.ENTER_FRAME, this.updateAnimation);
    },
    updateAnimation: function(evt) {
      this.animationDuration += evt.elapsed * 0.001;
      if (this.animationDuration >= 0.25) {
        this.frame++;
        if(this.frame>7){
          this.frame=0;
        }
        this.animationDuration -= 0.25;
      }
      //smoth lane change animation
      if(this.Target-this.x!=0){
        this.x=this.x+(this.Target-this.x)/10;
      }
    },
    switchToLaneNumber: function(lane) {
      var targetX = 160 - this.width / 2 + (lane - 1) * 90;
      var diff= targetX-this.x;
      //set Target for animation in updateAnimation
      this.Target=targetX;
    }
  });
};


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
