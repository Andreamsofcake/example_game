'use strict';

var Game = function() {
  // Set the width and height of the scene.
  this._width = 1280;
  this._height = 720;

  //BackGround
  // this.bgRenderer = new PIXI.CanvasRenderer(250, 250);
  // document.body.appendChild(this.bgRenderer.view);
  // this.bgStage = new PIXI.Stage();

  // Setup the rendering surface.
  this.renderer = new PIXI.CanvasRenderer(this._width, this._height, [this.transparent=true]);
  document.body.appendChild(this.renderer.view);

  // Create the main stage to draw on.
  this.stage = new PIXI.Stage();

  //Set up physics
  this.world = new p2.World({
    gravity: [0, 0]
  });

  //Speed
  this.speed = 900;
  this.turnSpeed = 3;

  window.addEventListener('keydown', function(event) {
    this.handleKeys(event.keyCode, true);
  }.bind(this), false);
  window.addEventListener('keyup', function(event) {
    this.handleKeys(event.keyCode, false);
  }.bind(this), false);

  this.enemyBodies = [];
  this.enemyGraphics = [];
  this.removeObjs = [];

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

    this.createMan();

    this.createEnemies();

    // Begin the first frame.
    requestAnimationFrame(this.tick.bind(this));
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
      // this.bgStage.addChild(star);
    }
    //calls stars to stage
    // this.bgRenderer.render(this.bgStage);
  },

  /**
   * Draw the boundaries of the space arena.
   */
  setupBoundaries: function() {
    var walls = new PIXI.Graphics();
    walls.beginFill(0x0000FF, 0.5);
    walls.drawRect(0, 0, this._width, 10);
    walls.drawRect(this._width - 10, 10, 10, this._height - 20);
    walls.drawRect(0, this._height - 10, this._width, 10);
    walls.drawRect(0, 10, 10, this._height - 20);
    // Attach the walls to the stage.
    // this.bgStage.addChild(walls);
    // this.bgRenderer.render(this.bgStage);
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
    this.manGraphics.drawRect(0, 0, 45, 45);
    this.manGraphics.endFill();

    this.manGraphics.beginFill(0x1495d1);
    this.manGraphics.drawRect(5, 5, 35, 8);
    this.manGraphics.endFill();

    this.stage.addChild(this.manGraphics);
  },


  createEnemies: function() {
    // Create random interval to generate new enemies.
    this.enemyTimer = setInterval(function() {
      // Create the enemy physics body.
      var x = Math.round(Math.random() * this._width);
      var y = Math.round(Math.random() * this._height);
      var vx = (Math.random() - 0.5) * this.speed;
      var vy = (Math.random() - 0.5) * this.speed;
      var va = (Math.random() - 0.5) * this.speed;
      var enemy = new p2.Body({
        position: [x, y],
        mass: 1,
        damping: 0,
        angularDamping: 0,
        velocity: [vx, vy],
        angularVelocity: va
      });
      var enemyShape = new p2.Circle(20);
      enemyShape.sensor = true;
      enemy.addShape(enemyShape);
      this.world.addBody(enemy);

      // Create the graphics object.
      var enemyGraphics = new PIXI.Graphics();
      enemyGraphics.beginFill(0xffa500);
      enemyGraphics.drawCircle(0, 0, 20);
      enemyGraphics.endFill();
      enemyGraphics.beginFill(0x7F525D);
      enemyGraphics.lineStyle(1, 0x239d0b, 1);
      enemyGraphics.drawCircle(0, 0, 10);
      enemyGraphics.endFill();

      this.stage.addChild(enemyGraphics);

      // Keep track of these enemies.
      this.enemyBodies.push(enemy);
      this.enemyGraphics.push(enemyGraphics);
    }.bind(this), 1000);

    this.world.on('beginContact', function(event) {
      if (event.bodyB.id === this.man.id) {
        this.removeObjs.push(event.bodyA);
      }
    }.bind(this));
  },

   /**
   * Handle key presses and filter them.
   * @param  {Number} code  Key code pressed.
   * @param  {Boolean} state true/false
   */
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

  updatePhysics: function() {
    // Angular velocities
    if (this.keyLeft) {
      this.man.angularVelocity = -1 * this.turnSpeed;
    } else if (this.keyRight) {
      this.man.angularVelocity = this.turnSpeed;
    } else {
      this.man.angularVelocity = 0;
    }
    //add force
    if (this.keyUp) {
      var angle =this.man.angle + Math.PI/2;
      this.man.force[0] -= this.speed * Math.cos(angle);
      this.man.force[1] -= this.speed * Math.sin(angle);
    }

    // Update the position of the graphics based on the
    // physics simulation position.
    this.manGraphics.x = this.man.position[0];
    this.manGraphics.y = this.man.position[1];
    this.manGraphics.rotation = this.man.angle;

    if (this.man.position[0] > this._width) {
      this.man.position[0] = 0;
    } else if (this.man.position[0] < 0) {
      this.man.position[0] = this._width;
    }
    if (this.man.position[1] > this._height) {
      this.man.position[1] = 0;
    } else if (this.man.position[1] < 0) {
      this.man.position[1] = this._height;
    }

    for (var i=0; i<this.enemyBodies.length; i++) {
      this.enemyGraphics[i].x = this.enemyBodies[i].position[0];
      this.enemyGraphics[i].y = this.enemyBodies[i].position[1];
    }

    // Step the physics simulation forward.
    this.world.step(1 / 60);

    for (i=0; i<this.removeObjs.length; i++) {
      this.world.removeBody(this.removeObjs[i]);

      var index = this.enemyBodies.indexOf(this.removeObjs[i]);
      if (index) {
        this.enemyBodies.splice(index, 1);
        this.stage.removeChild(this.enemyGraphics[index]);
        this.enemyGraphics.splice(index, 1);
      }
    }

    this.removeObjs.length = 0;
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