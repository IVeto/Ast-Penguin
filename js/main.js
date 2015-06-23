// 1 - Start enchant.js
enchant();

// 2 - On document load
window.onload = function() {
  // 3 - Starting point
  var game = new Game(320, 440);
  // 4 - Preload resources
  game.preload('res/ast.png',
    'res/penguinSheet.png',
    'res/Ice.png');
  // 5 - Game settings
  game.fps = 60;
  game.scale = 1;
  game.onload = function() {
      console.log("Hi, Ocean!");
      var scene = new SceneGame();
      game.pushScene(scene);
    }
    // 7 - Start
  game.start();
  // SceneGame
  var SceneGame = Class.create(Scene, {
    // The main gameplay scene.
    initialize: function() {
      var game, label, bg, penguin, iceGroup;

      // 1 - Call superclass constructor
      Scene.apply(this);
      // 2 - Access to the game singleton instance
      game = Game.instance;
      // 3 - Create child nodes
      label = new Label("Hi, Ocean!");
      bg = new Sprite(320, 440);
      bg.image = game.assets['res/ast.png'];

      //penguin = new Sprite(30,43);
      penguin = new Penguin();
      penguin.image = game.assets['res/penguinSheet.png'];
      penguin.x = game.width / 2 - penguin.width / 2;
      penguin.y = 280;
      this.penguin = penguin;

      // Ice group
      iceGroup = new Group();
      this.iceGroup = iceGroup;

      // 4 - Add child nodes
      this.addChild(bg);
      this.addChild(iceGroup);
      this.addChild(label);
      this.addChild(penguin);

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
      this.penguin.switchToLaneNumber(lane);
    },
    update: function(evt) {
      // Check if it's time to create a new set of obstacles
      this.generateIceTimer += evt.elapsed * 0.001;
      if (this.generateIceTimer >= 0.5) {
        var ice;
        this.generateIceTimer -= 0.5;
        ice = new Ice(Math.floor(Math.random() * 3));
        //this.addChild(ice);
        this.iceGroup.addChild(ice);
      }
      // Check collision
      for (var i = this.iceGroup.childNodes.length - 1; i >= 0; i--) {
        var ice;
        ice = this.iceGroup.childNodes[i];
        if (ice.intersect(this.penguin)) {
          this.iceGroup.removeChild(ice);
          break;
        }
      }

    }
  });
  var Penguin = Class.create(Sprite, {
    // The player character.
    initialize: function() {
      // 1 - Call superclass constructor
      Sprite.apply(this, [30, 43]);
      this.image = Game.instance.assets['res/penguinSheet.png'];
      // 2 - Animate
      this.animationDuration = 0;
      //Target position; starting on lane 2
      this.Target=160 - this.width / 2;
      this.addEventListener(Event.ENTER_FRAME, this.updateAnimation);
    },
    updateAnimation: function(evt) {
      this.animationDuration += evt.elapsed * 0.001;
      if (this.animationDuration >= 0.25) {
        this.frame = (this.frame + 1) % 2;
        this.animationDuration -= 0.25;
      }
      if(this.Target-this.x!=0){
        this.x=this.x+(this.Target-this.x)/10;
      }
    },
    switchToLaneNumber: function(lane) {
      var targetX = 160 - this.width / 2 + (lane - 1) * 90;
      var diff= targetX-this.x;
      //this.x=targetX;
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
