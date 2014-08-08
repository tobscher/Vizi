/**
 * @fileoverview Main interface to the graphics and rendering subsystem
 * 
 * @author Tony Parisi
 */
goog.require('Vizi.Layer');
goog.require('Vizi.Graphics');
goog.provide('Vizi.GraphicsThreeJS');

Vizi.GraphicsThreeJS = function()
{
	Vizi.Graphics.call(this);

  Object.defineProperties(this, {
    camera: {
      get: function() {
        return this.mainLayer.camera;
      },
      set: function(v) {
        this.mainLayer.camera = v;
      }
    },
    scene: {
      get: function() {
        return this.mainLayer.scene;
      },
      set: function(v) {
        this.mainLayer.scene = v;
      }
    }
  });
}

goog.inherits(Vizi.GraphicsThreeJS, Vizi.Graphics);

Vizi.GraphicsThreeJS.prototype.initialize = function(param)
{
	param = param || {};

	// call all the setup functions
	this.initOptions(param);
	this.initPageElements(param);
	this.initScene();
	this.initRenderer(param);
	this.initMouse();
	this.initKeyboard();
	this.addDomHandlers();
}

Vizi.GraphicsThreeJS.prototype.focus = function()
{
	if (this.renderer && this.renderer.domElement)
	{
		this.renderer.domElement.focus();
	}
}

Vizi.GraphicsThreeJS.prototype.initOptions = function(param)
{
	this.displayStats = (param && param.displayStats) ? 
			param.displayStats : Vizi.GraphicsThreeJS.default_display_stats;
}

Vizi.GraphicsThreeJS.prototype.initPageElements = function(param)
{
    if (param.container)
    {
    	this.container = param.container;
    }
   	else
   	{
		this.container = document.createElement( 'div' );
	    document.body.appendChild( this.container );
   	}

    this.saved_cursor = this.container.style.cursor;
    
    if (this.displayStats)
    {
    	if (window.Stats)
    	{
	        var stats = new Stats();
	        stats.domElement.style.position = 'absolute';
	        stats.domElement.style.top = '0px';
	        stats.domElement.style.left = '0px';
	        stats.domElement.style.height = '40px';
	        this.container.appendChild( stats.domElement );
	        this.stats = stats;
    	}
    	else
    	{
    		Vizi.System.warn("No Stats module found. Make sure to include stats.min.js");
    	}
    }
}

Vizi.GraphicsThreeJS.prototype.initScene = function()
{
  var scene = new THREE.Scene();

  // Background
  var backgroundCamera = new THREE.PerspectiveCamera( 45,
      this.container.offsetWidth / this.container.offsetHeight, 0.01, 10000 );
  this.backgroundLayer = this.addLayer("backgroundLayer", backgroundCamera, {
    scene: scene,
    clearColor: {color:0, alpha:0},
    // autoClearColor: true,
    position: new THREE.Vector3(0,0,10)
  });

  // Main
  var camera = new THREE.PerspectiveCamera( 45,
    		this.container.offsetWidth / this.container.offsetHeight, 1, 10000 );
  this.mainLayer = this.addLayer("main", camera, {
    scene: scene,
    position: Vizi.Camera.DEFAULT_POSITION,
    clearColor: {color:0, alpha:1},
    // autoClearColor: false,
    // clear: true
  });
};

Vizi.GraphicsThreeJS.prototype.addLayer = function(name, camera, options) {
  options = options || {};
  if (options.scene !== undefined) {
    var scene = options.scene;
  } else {
    var scene = new THREE.Scene();
  }

  var layer = new Vizi.Layer(name, camera, scene, options);

  // Position
  if (options.position !== undefined) {
    camera.position.copy(options.position);
  }

  // Up
  if (options.up !== undefined) {
    camera.up = options.up;
  }

  // LookAt
  if (options.lookAt !== undefined) {
    camera.lookAt(options.lookAt);
  }

  // Clear Color
  if (options.clearColor !== undefined) {
    layer.clearColor = options.clearColor;
  }

  if (options.autoClearColor !== undefined) {
    layer.autoClearColor = options.autoClearColor;
  }

  if (options.viewport !== undefined) {
    layer.viewport = options.viewport;
  }

  if (options.clear !== undefined) {
    layer.clear = options.clear;
  }

  scene.add(camera);

  return layer;
};

Vizi.GraphicsThreeJS.prototype.initRenderer = function(param)
{
	var antialias = (param.antialias !== undefined) ? param.antialias : true;
	var alpha = (param.alpha !== undefined) ? param.alpha : true;
	//var devicePixelRatio = (param.devicePixelRatio !== undefined) ? param.devicePixelRatio : 1;
	
    var renderer = // Vizi.Config.USE_WEBGL ?
    	new THREE.WebGLRenderer( { antialias: antialias, 
    		alpha: alpha,
    		/*devicePixelRatio : devicePixelRatio */ } ); // :
    	// new THREE.CanvasRenderer;
    	
    renderer.sortObjects = false;
    renderer.setSize( this.container.offsetWidth, this.container.offsetHeight );
    renderer.autoClear = false;

    if (param && param.backgroundColor)
    {
    	renderer.domElement.style.backgroundColor = param.backgroundColor;
    	renderer.domElement.setAttribute('z-index', -1);
    }
    
    this.container.appendChild( renderer.domElement );

    var projector = new THREE.Projector();

    this.renderer = renderer;
    this.projector = projector;

    this.lastFrameTime = 0;
    
    if (param.riftRender) {
    	  this.riftCam = new THREE.OculusRiftEffect(this.renderer);	
    }
};

Vizi.GraphicsThreeJS.prototype.initMouse = function()
{
	var dom = this.renderer.domElement;
	
	var that = this;
	dom.addEventListener( 'mousemove', 
			function(e) { that.onDocumentMouseMove(e); }, false );
	dom.addEventListener( 'mousedown', 
			function(e) { that.onDocumentMouseDown(e); }, false );
	dom.addEventListener( 'mouseup', 
			function(e) { that.onDocumentMouseUp(e); }, false ); 
	dom.addEventListener( 'mouseleave',
			function(e) { that.onDocumentMouseLeave(e); }, false );
 	dom.addEventListener( 'click', 
			function(e) { that.onDocumentMouseClick(e); }, false );
	dom.addEventListener( 'dblclick', 
			function(e) { that.onDocumentMouseDoubleClick(e); }, false );

	dom.addEventListener( 'mousewheel', 
			function(e) { that.onDocumentMouseScroll(e); }, false );
	dom.addEventListener( 'DOMMouseScroll', 
			function(e) { that.onDocumentMouseScroll(e); }, false );
	
	dom.addEventListener( 'touchstart', 
			function(e) { that.onDocumentTouchStart(e); }, false );
	dom.addEventListener( 'touchmove', 
			function(e) { that.onDocumentTouchMove(e); }, false );
	dom.addEventListener( 'touchend', 
			function(e) { that.onDocumentTouchEnd(e); }, false );
}

Vizi.GraphicsThreeJS.prototype.initKeyboard = function()
{
	var dom = this.renderer.domElement;
	
	var that = this;
	dom.addEventListener( 'keydown', 
			function(e) { that.onKeyDown(e); }, false );
	dom.addEventListener( 'keyup', 
			function(e) { that.onKeyUp(e); }, false );
	dom.addEventListener( 'keypress', 
			function(e) { that.onKeyPress(e); }, false );

	// so it can take focus
	dom.setAttribute("tabindex", 1);
    
}

Vizi.GraphicsThreeJS.prototype.addDomHandlers = function()
{
	var that = this;
	window.addEventListener( 'resize', function(event) { that.onWindowResize(event); }, false );
}

Vizi.GraphicsThreeJS.prototype.objectFromMouse = function(event) {
  for (var i = Vizi.Layer.instances.length - 1; i >= 0; i--) {
    var layer = Vizi.Layer.instances[i];

    var width = layer.width || this.container.offsetWidth;
    var height = layer.height || this.container.offsetHeight;

    var eltx = event.elementX,
      elty = event.elementY;

    if (layer.viewport) {
      eltx -= layer.x;
      elty -= (this.container.offsetHeight - layer.height - layer.y);
    }

    // translate client coords into vp x,y
    var vpx = ( eltx / width ) * 2 - 1;
    var vpy = - ( elty / height ) * 2 + 1;
    var vector = new THREE.Vector3( vpx, vpy, 0.5 );

    if (layer.camera instanceof THREE.PerspectiveCamera) {
      this.projector.unprojectVector( vector, layer.camera );
      var pos = new THREE.Vector3;
      pos = pos.applyMatrix4(layer.camera.matrixWorld);
      var ray = new THREE.Raycaster( pos, vector.sub( pos ).normalize() );
    } else {
      // Orthographic
      var ray = this.projector.pickingRay(vector, layer.camera);
    }

    var intersects = ray.intersectObjects( layer.scene.children, true );

    if ( intersects.length > 0 ) {
      var j = 0;
      while(j < intersects.length && (!intersects[j].object.visible ||
          intersects[j].object.ignorePick))
      {
        j++;
      }

      var intersected = intersects[j];

      return (this.findObjectFromIntersected(intersected.object, intersected.point, intersected.face));
    }
  }

  return { object : null, point : null, normal : null };
}

Vizi.GraphicsThreeJS.prototype.objectFromRay = function(hierarchy, origin, direction, near, far)
{
    var raycaster = new THREE.Raycaster(origin, direction, near, far);

    var objects = null;
    if (hierarchy) {
    	objects = hierarchy.transform.object.children; 
    }
    else {
    	objects = this.scene.children;
    }
    
	var intersects = raycaster.intersectObjects( objects, true );
	
    if ( intersects.length > 0 ) {
    	var i = 0;
    	while(i < intersects.length && (!intersects[i].object.visible || 
    			intersects[i].object.ignoreCollision))
    	{
    		i++;
    	}
    	
    	var intersected = intersects[i];
    	
    	if (i >= intersects.length)
    	{
        	return { object : null, point : null, normal : null };
    	}
    	
    	return (this.findObjectFromIntersected(intersected.object, intersected.point, intersected.face));        	    	                             
    }
    else
    {
    	return { object : null, point : null, normal : null };
    }
}


Vizi.GraphicsThreeJS.prototype.findObjectFromIntersected = function(object, point, face)
{
	if (object.data)
	{
		// The intersect point comes in as world units
		var hitPointWorld = point.clone();
		// Get the model space units for our event
		var modelMat = new THREE.Matrix4;
		modelMat.getInverse(object.matrixWorld);
		point.applyMatrix4(modelMat);
		// Use the intersected face's normal if it's there
		var normal = face ? face.normal : null
		return { object: object.data, point: point, hitPointWorld : hitPointWorld, face: face, normal: normal };
	}
	else if (object.parent)
	{
		return this.findObjectFromIntersected(object.parent, point, face);
	}
	else
	{
		return { object : null, point : null, face : null, normal : null };
	}
}

Vizi.GraphicsThreeJS.prototype.nodeFromMouse = function(event)
{
	// Blerg, this is to support code outside the SB components & picker framework
	// Returns a raw Three.js node
	
	// translate client coords into vp x,y
	var eltx = event.elementX, elty = event.elementY;
	
    var vpx = ( eltx / this.container.offsetWidth ) * 2 - 1;
    var vpy = - ( elty / this.container.offsetHeight ) * 2 + 1;
    
    var vector = new THREE.Vector3( vpx, vpy, 0.5 );

    this.projector.unprojectVector( vector, this.camera );
	
    var pos = new THREE.Vector3;
    pos = pos.applyMatrix4(this.camera.matrixWorld);

    var raycaster = new THREE.Raycaster( pos, vector.sub( pos ).normalize() );

	var intersects = raycaster.intersectObjects( this.scene.children, true );
	
    if ( intersects.length > 0 ) {
    	var i = 0;
    	while(!intersects[i].object.visible)
    	{
    		i++;
    	}
    	
    	var intersected = intersects[i];
    	if (intersected)
    	{
    		return { node : intersected.object, 
    				 point : intersected.point, 
    				 normal : intersected.face.normal
    				}
    	}
    	else
    		return null;
    }
    else
    {
    	return null;
    }
}

Vizi.GraphicsThreeJS.prototype.getObjectIntersection = function(x, y, object)
{
	// Translate client coords into viewport x,y
	var vpx = ( x / this.renderer.domElement.offsetWidth ) * 2 - 1;
	var vpy = - ( y / this.renderer.domElement.offsetHeight ) * 2 + 1;
	
    var vector = new THREE.Vector3( vpx, vpy, 0.5 );

    this.projector.unprojectVector( vector, this.camera );
	
    var pos = new THREE.Vector3;
    pos = pos.applyMatrix4(this.camera.matrixWorld);
	
    var raycaster = new THREE.Raycaster( pos, vector.sub( pos ).normalize() );

	var intersects = raycaster.intersectObject( object, true );
	if (intersects.length)
	{
		var intersection = intersects[0];
		var modelMat = new THREE.Matrix4;
		modelMat.getInverse(intersection.object.matrixWorld);
		intersection.point.applyMatrix4(modelMat);
		return intersection;
	}
	else
		return null;
		
}

Vizi.GraphicsThreeJS.prototype.calcElementOffset = function(offset) {

	offset.left = this.renderer.domElement.offsetLeft;
	offset.top = this.renderer.domElement.offsetTop;
	
	var parent = this.renderer.domElement.offsetParent;
	while(parent) {
		offset.left += parent.offsetLeft;
		offset.top += parent.offsetTop;
		parent = parent.offsetParent;
	}
}

Vizi.GraphicsThreeJS.prototype.onDocumentMouseMove = function(event)
{
    event.preventDefault();
    
	var offset = {};
	this.calcElementOffset(offset);
	
	var eltx = event.pageX - offset.left;
	var elty = event.pageY - offset.top;
	
	var evt = { type : event.type, pageX : event.pageX, pageY : event.pageY, 
	    	elementX : eltx, elementY : elty, button:event.button, altKey:event.altKey,
	    	ctrlKey:event.ctrlKey, shiftKey:event.shiftKey };
	
    Vizi.Mouse.instance.onMouseMove(evt);
    
    if (Vizi.PickManager)
    {
    	Vizi.PickManager.handleMouseMove(evt);
    }
    
    Vizi.Application.handleMouseMove(evt);
}

Vizi.GraphicsThreeJS.prototype.onDocumentMouseLeave = function(event) {
  event.preventDefault();

  var offset = {};
  this.calcElementOffset(offset);

  var eltx = event.pageX - offset.left;
  var elty = event.pageY - offset.top;

  var evt = { type : event.type, pageX : event.pageX, pageY : event.pageY, 
    elementX : eltx, elementY : elty, button:event.button, altKey:event.altKey,
    ctrlKey:event.ctrlKey, shiftKey:event.shiftKey };

  Vizi.Mouse.instance.onMouseLeave(evt);

  Vizi.Application.handleMouseLeave(evt);
};

Vizi.GraphicsThreeJS.prototype.onDocumentMouseDown = function(event)
{
    event.preventDefault();
    
	var offset = {};
	this.calcElementOffset(offset);
	
	var eltx = event.pageX - offset.left;
	var elty = event.pageY - offset.top;
		
	var evt = { type : event.type, pageX : event.pageX, pageY : event.pageY, 
	    	elementX : eltx, elementY : elty, button:event.button, altKey:event.altKey,
	    	ctrlKey:event.ctrlKey, shiftKey:event.shiftKey  };
	
    Vizi.Mouse.instance.onMouseDown(evt);
    
    if (Vizi.PickManager)
    {
    	Vizi.PickManager.handleMouseDown(evt);
    }
    
    Vizi.Application.handleMouseDown(evt);
}

Vizi.GraphicsThreeJS.prototype.onDocumentMouseUp = function(event)
{
    event.preventDefault();

	var offset = {};
	this.calcElementOffset(offset);
	
	var eltx = event.pageX - offset.left;
	var elty = event.pageY - offset.top;
	
	var evt = { type : event.type, pageX : event.pageX, pageY : event.pageY, 
	    	elementX : eltx, elementY : elty, button:event.button, altKey:event.altKey,
	    	ctrlKey:event.ctrlKey, shiftKey:event.shiftKey  };
    
    Vizi.Mouse.instance.onMouseUp(evt);
    
    if (Vizi.PickManager)
    {
    	Vizi.PickManager.handleMouseUp(evt);
    }	            

    Vizi.Application.handleMouseUp(evt);
}

Vizi.GraphicsThreeJS.prototype.onDocumentMouseClick = function(event)
{
    event.preventDefault();

	var offset = {};
	this.calcElementOffset(offset);
	
	var eltx = event.pageX - offset.left;
	var elty = event.pageY - offset.top;
	
	var evt = { type : event.type, pageX : event.pageX, pageY : event.pageY, 
	    	elementX : eltx, elementY : elty, button:event.button, altKey:event.altKey,
	    	ctrlKey:event.ctrlKey, shiftKey:event.shiftKey  };
    
    Vizi.Mouse.instance.onMouseClick(evt);
    
    if (Vizi.PickManager)
    {
    	Vizi.PickManager.handleMouseClick(evt);
    }	            

    Vizi.Application.handleMouseClick(evt);
}

Vizi.GraphicsThreeJS.prototype.onDocumentMouseDoubleClick = function(event)
{
    event.preventDefault();

	var offset = {};
	this.calcElementOffset(offset);
	
	var eltx = event.pageX - offset.left;
	var elty = event.pageY - offset.top;
	
	var eltx = event.pageX - offset.left;
	var elty = event.pageY - offset.top;
	
	var evt = { type : event.type, pageX : event.pageX, pageY : event.pageY, 
	    	elementX : eltx, elementY : elty, button:event.button, altKey:event.altKey,
	    	ctrlKey:event.ctrlKey, shiftKey:event.shiftKey  };
    
    Vizi.Mouse.instance.onMouseDoubleClick(evt);
    
    if (Vizi.PickManager)
    {
    	Vizi.PickManager.handleMouseDoubleClick(evt);
    }	            

    Vizi.Application.handleMouseDoubleClick(evt);
}

Vizi.GraphicsThreeJS.prototype.onDocumentMouseScroll = function(event)
{
    event.preventDefault();

	var delta = 0;

	if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

		delta = event.wheelDelta;

	} else if ( event.detail ) { // Firefox

		delta = - event.detail;

	}

	var evt = { type : "mousescroll", delta : delta };
    
    Vizi.Mouse.instance.onMouseScroll(evt);

    if (Vizi.PickManager)
    {
    	Vizi.PickManager.handleMouseScroll(evt);
    }
    
    Vizi.Application.handleMouseScroll(evt);
}

// Touch events
Vizi.GraphicsThreeJS.prototype.translateTouch = function(touch, offset) {

	var eltx = touch.pageX - offset.left;
	var elty = touch.pageY - offset.top;

	return {
	    'screenX': touch.screenX,
	    'screenY': touch.screenY,
	    'clientX': touch.clientX,
	    'clientY': touch.clientY,
	    'pageX': touch.pageX,
	    'pageY': touch.pageY,
	    'elementX': eltx,
	    'elementY': elty,
	}
}

Vizi.GraphicsThreeJS.prototype.onDocumentTouchStart = function(event)
{
    event.preventDefault();
    
	var offset = {};
	this.calcElementOffset(offset);

	var touches = [];
	var i, len = event.touches.length;
	for (i = 0; i < len; i++) {
		touches.push(this.translateTouch(event.touches[i], offset));
	}

	var evt = { type : event.type, touches : touches };
	
    if (Vizi.PickManager)
    {
    	Vizi.PickManager.handleTouchStart(evt);
    }
    
    Vizi.Application.handleTouchStart(evt);
}

Vizi.GraphicsThreeJS.prototype.onDocumentTouchMove = function(event)
{
    event.preventDefault();
    
	var offset = {};
	this.calcElementOffset(offset);
	
	var touches = [];
	var i, len = event.touches.length;
	for (i = 0; i < len; i++) {
		touches.push(this.translateTouch(event.touches[i], offset));
	}

	var changedTouches = [];
	var i, len = event.changedTouches.length;
	for (i = 0; i < len; i++) {
		changedTouches.push(this.translateTouch(event.changedTouches[i], offset));
	}

	var evt = { type : event.type, touches : touches, changedTouches : changedTouches };
		    
    if (Vizi.PickManager)
    {
    	Vizi.PickManager.handleTouchMove(evt);
    }
    
    Vizi.Application.handleTouchMove(evt);
}

Vizi.GraphicsThreeJS.prototype.onDocumentTouchEnd = function(event)
{
    event.preventDefault();

	var offset = {};
	this.calcElementOffset(offset);
	
	var touches = [];
	var i, len = event.touches.length;
	for (i = 0; i < len; i++) {
		touches.push(this.translateTouch(event.touches[i], offset));
	}

	var changedTouches = [];
	var i, len = event.changedTouches.length;
	for (i = 0; i < len; i++) {
		changedTouches.push(this.translateTouch(event.changedTouches[i], offset));
	}

	var evt = { type : event.type, touches : touches, changedTouches : changedTouches };
    
    if (Vizi.PickManager)
    {
    	Vizi.PickManager.handleTouchEnd(evt);
    }	            

    Vizi.Application.handleTouchEnd(evt);
}


Vizi.GraphicsThreeJS.prototype.onKeyDown = function(event)
{
	// N.B.: Chrome doesn't deliver keyPress if we don't bubble... keep an eye on this
	event.preventDefault();

    Vizi.Keyboard.instance.onKeyDown(event);
    
	Vizi.Application.handleKeyDown(event);
}

Vizi.GraphicsThreeJS.prototype.onKeyUp = function(event)
{
	// N.B.: Chrome doesn't deliver keyPress if we don't bubble... keep an eye on this
	event.preventDefault();

    Vizi.Keyboard.instance.onKeyUp(event);
    
	Vizi.Application.handleKeyUp(event);
}
	        
Vizi.GraphicsThreeJS.prototype.onKeyPress = function(event)
{
	// N.B.: Chrome doesn't deliver keyPress if we don't bubble... keep an eye on this
	event.preventDefault();

    Vizi.Keyboard.instance.onKeyPress(event);
    
	Vizi.Application.handleKeyPress(event);
}

Vizi.GraphicsThreeJS.prototype.onWindowResize = function(e)
{
  this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);

  for (var i = 0; i < Vizi.Layer.instances.length; i++) {
    var layer = Vizi.Layer.instances[i];
    layer.onWindowResize(this.container.offsetWidth, this.container.offsetHeight);
  }
}

Vizi.GraphicsThreeJS.prototype.setCursor = function(cursor)
{
	if (!cursor)
		cursor = this.saved_cursor;
	
	this.container.style.cursor = cursor;
}


Vizi.GraphicsThreeJS.prototype.update = function()
{
	// N.B.: start with hack, let's see how it goes...
	if (this.riftCam) {
	    this.riftCam.render(
	        	[ this.backgroundLayer.scene, this.scene ],
	        	[this.backgroundLayer.camera, this.camera]);

	    return;
	}
	
  for (i = 0; i < Vizi.Layer.instances.length; i++) {
    var layer = Vizi.Layer.instances[i];

    if (layer.clearColor) {
      this.renderer.setClearColor(layer.clearColor.color, layer.clearColor.alpha);
    }

    if (layer.autoClearColor !== undefined) {
      this.renderer.autoClearColor = layer.autoClearColor;
    }

    if (layer.viewport) {
      this.renderer.setViewport(layer.viewport.x, layer.viewport.y, layer.viewport.width, layer.viewport.height);
      this.renderer.setScissor(layer.viewport.x, layer.viewport.y, layer.viewport.width, layer.viewport.height);
    } else {
      this.renderer.setViewport(0, 0, this.container.clientWidth, this.container.clientHeight);
      this.renderer.setScissor(0, 0, this.container.clientWidth, this.container.clientHeight);
    }

    this.renderer.enableScissorTest(true);

    if (layer.clear) {
      this.renderer.clear();
    }

    this.renderer.render(layer.scene, layer.camera);
  }

    var frameTime = Date.now();
    var deltat = (frameTime - this.lastFrameTime) / 1000;
    this.frameRate = 1 / deltat;

    this.lastFrameTime = frameTime;
    	
    if (this.stats)
    {
    	this.stats.update();
    }
};

Vizi.GraphicsThreeJS.prototype.enableShadows = function(enable)
{
	this.renderer.shadowMapEnabled = enable;
	this.renderer.shadowMapSoft = enable;
	this.renderer.shadowMapCullFrontFaces = false;
}

Vizi.GraphicsThreeJS.default_display_stats = false;
