goog.provide("Vizi.Layer");

Vizi.Layer = function(name, camera, scene, options) {
  options = options || {};

  this.name = name;
  this.camera = camera;
  this.scene = scene;
  this.options = options;

  if (options.viewport !== undefined) {
    this.viewport = options.viewport;
    this.width = options.viewport.width;
    this.height = options.viewport.height;
    this.x = options.viewport.x;
    this.y = options.viewport.y;
  }

  Vizi.Layer.instances.push(this);
};

Vizi.Layer.instances = [];
