/**
 * @author Tony Parisi
 */
goog.provide('Vizi.Mouse');

Vizi.Mouse = function()
{
	// N.B.: freak out if somebody tries to make 2
	// throw (...)

	this.state = 
	{ x : Vizi.Mouse.NO_POSITION, y: Vizi.Mouse.NO_POSITION,

	buttons : { left : false, middle : false, right : false },
	scroll : 0,
  insideContainer: false
	};

	Vizi.Mouse.instance = this;
};

Vizi.Mouse.prototype.onMouseMove = function(event)
{
    this.state.x = event.elementX;
    this.state.y = event.elementY;	            
    this.state.insideContainer = true;
}

Vizi.Mouse.prototype.onMouseDown = function(event)
{
    this.state.x = event.elementX;
    this.state.y = event.elementY;	            
    this.state.buttons.left = true;
    this.state.insideContainer = true;
}

Vizi.Mouse.prototype.onMouseUp = function(event)
{
    this.state.x = event.elementX;
    this.state.y = event.elementY;	            
    this.state.buttons.left = false;	            
    this.state.insideContainer = true;
}

Vizi.Mouse.prototype.onMouseLeave = function(event)
{
    this.state.insideContainer = false;
}

Vizi.Mouse.prototype.onMouseClick = function(event)
{
    this.state.x = event.elementX;
    this.state.y = event.elementY;	            
    this.state.buttons.left = false;	            
    this.state.insideContainer = true;
}

Vizi.Mouse.prototype.onMouseDoubleClick = function(event)
{
    this.state.x = event.elementX;
    this.state.y = event.elementY;	            
    this.state.buttons.left = false;	            
    this.state.insideContainer = true;
}

Vizi.Mouse.prototype.onMouseScroll = function(event, delta)
{
    this.state.scroll = 0; // PUNT!
}


Vizi.Mouse.prototype.getState = function()
{
	return this.state;
}

Vizi.Mouse.instance = null;
Vizi.Mouse.NO_POSITION = Number.MIN_VALUE;
