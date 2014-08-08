goog.provide("Vizi.Layer");

Vizi.Layer = function(name, camera, scene, options) {
  options = options || {};

  this.name = name;
  this.camera = camera;
  this.scene = scene;
  this.options = options;

  if (options.viewport !== undefined) {
    this.setViewport(options.viewport.x, options.viewport.y, options.viewport.width, options.viewport.height);
  }

  Vizi.Layer.instances.push(this);
};

Vizi.Layer.prototype.onWindowResize = function(width, height) {
  this.setAspectRatio(width, height);
  this.updateMatrix();
};

Vizi.Layer.prototype.setAspectRatio = function(width, height) {
  this.camera.aspect = width / height;
};

Vizi.Layer.prototype.updateMatrix = function() {
  this.camera.updateProjectionMatrix();
};

Vizi.Layer.prototype.setViewport = function(x, y, width, height) {
  this.viewport = {
    x: x,
    y: y,
    width: width,
    height: height
  };

  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
};

Vizi.Layer.instances = [];
