var Game = function() {
  // Set the width and height of the scene.
  this._width = 1280;
  this._height = 720;

  // Setup the rendering surface.
  this.renderer = new PIXI.CanvasRenderer(this._width, this._height);
  document.body.appendChild(this.renderer.view);

  // Create the main stage to draw on.
  this.stage = new PIXI.Stage();

  //Set up physics
  this.world = new p2.World({
    gravity: [0, 0]
  });

  //Speed
  this.speed = 100;
  this.turnSpeed = 2;

  window.addEventListener('keydown', function(event) {
    this.handleKeys(event.keyCode, true);
  }.bind(this), false);
  window.addEventListener('keyup', function(event) {
    this.handleKeys(event.keyCode, false);
  }.bind(this), false);

  // Start running the game.
  this.build();
};


Game.prototype = {
  /**
   * Build the scene and begin animating.
   */
  build: function() {
    // Draw the star-field in the background.
    this.drawStars();

    // Setup the boundaries of the game's arena.
    this.setupBoundaries();

    // Begin the first frame.
    requestAnimationFrame(this.tick.bind(this));

    this.createMan();
  },

  /**
   * Draw the field of stars behind all of the action.
   */
  drawStars: function() {
    // Draw randomly positioned stars.
    for (var i=0; i<1500; i++) {
      // Generate random parameters for the stars.
      var x = Math.round(Math.random() * this._width);
      var y = Math.round(Math.random() * this._height);
      var rad = Math.ceil(Math.random() * 2);
      var alpha = Math.min(Math.random() + 0.25, 1);

      // Draw the star.
      var star  = new PIXI.Graphics();
      star.beginFill(0xFFFFFF, alpha);
      star.drawCircle(x, y, rad);
      star.endFill();

      // Attach the star to the stage.
      this.stage.addChild(star);
    }
  },

  handleKeys: function(code, state) {
    switch (code) {
      case 65: // A
        this.keyLeft = state;
        break;

      case 68: // D
        this.keyRight = state;
        break;

      case 87: // W
        this.keyUp = state;
        break;
    }
  },

  /**
   * Draw the boundaries of the space arena.
   */
  setupBoundaries: function() {
    var walls = new PIXI.Graphics();
    walls.beginFill(0xFFFFFF, 0.5);
    walls.drawRect(0, 0, this._width, 10);
    walls.drawRect(this._width - 10, 10, 10, this._height - 20);
    walls.drawRect(0, this._height - 10, this._width, 10);
    walls.drawRect(0, 10, 10, this._height - 20);
    
    // Attach the walls to the stage.
    this.stage.addChild(walls);    
  },

  createMan: function() {

    this.man = new p2.Body({
      mass: 1,
      angularVelocity: 0,
      damping: 0,
      angularDamping: 0,
      position: [Math.round(this._width / 2), Math.round(this._height / 2)]
    });
    this.manShape = new p2.Rectangle(52, 69);
    this.man.addShape(this.manShape);
    this.world.addBody(this.man);

    this.manGraphics = new PIXI.Graphics();

    this.manGraphics.beginFill(0x008000);
    this.manGraphics.moveTo(0, 0);
    this.manGraphics.drawRect(0, 0, 26, 26);
    this.manGraphics.endFill();

    this.manGraphics.beginFill(0x1495d1);
    this.manGraphics.drawRect(5, 5, 16, 8);
    this.manGraphics.endFill();

    this.stage.addChild(this.manGraphics);
  },

  updatePhysics: function() {
    // Update the position of the graphics based on the
    // physics simulation position.
    this.manGraphics.x = this.man.position[0];
    this.manGraphics.y = this.man.position[1];
    this.manGraphics.rotation = this.man.angle;

    // Step the physics simulation forward.
    this.world.step(1 / 60);
  },

  /**
   * Fires at the end of the gameloop to reset and redraw the canvas.
   */
  tick: function() {
    this.updatePhysics();

    // Render the stage for the current frame.
    this.renderer.render(this.stage);

    // Begin the next frame.
    requestAnimationFrame(this.tick.bind(this));
  }
};