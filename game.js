var Game = function() {
  // Set the width and height of the scene.
  this._width = 1280;
  this._height = 720;

  // Setup the rendering surface.
  this.renderer = new PIXI.CanvasRenderer(this._width, this._height);
  document.body.appendChild(this.renderer.view);

  // Create the main stage to draw on.
  this.stage = new PIXI.Stage();

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
    this.man = new PIXI.Graphics();

    this.man.beginFill(0x008000);
    this.man.moveTo(0, 0);
    this.man.drawRect(0, 0, 26, 26);
    this.man.endFill();

    this.man.beginFill(0x1495d1);
    this.man.drawRect(5, 5, 16, 8);
    this.man.endFill();

    this.man.x = Math.round(this._width / 2);
    this.man.y = Math.round(this._height / 2);

    this.stage.addChild(this.man);

    //event listeners
    Mousetrap.bind('w', function(){
      this.man.rotation = 0;
      this.moveMan('n');
    }.bind(this));

    Mousetrap.bind('s', function(){
      this.man.rotation = 180 * (Math.PI /180);
      this.moveMan('s');
    }.bind(this));

    Mousetrap.bind('d', function(){
      this.man.rotation = 90 * (Math.PI /180);
      this.moveMan('e');
    }.bind(this));

    Mousetrap.bind('a', function(){
      this.man.rotation = 270 * (Math.PI /180);
      this.moveMan('w');
    }.bind(this));

  },

  moveMan: function(dir)  {
    var speed = 20;

    switch(dir) {
      case 'n':
        this.man.y -= speed;
        break;

      case 's':
        this.man.y += speed;
        break;

      case 'e':
        this.man.x += speed;
        break;

      case 'w':
        this.man.x -= speed;
        break;
    }
  },

  /**
   * Fires at the end of the gameloop to reset and redraw the canvas.
   */
  tick: function() {
    // Render the stage for the current frame.
    this.renderer.render(this.stage);

    // Begin the next frame.
    requestAnimationFrame(this.tick.bind(this));
  }
};