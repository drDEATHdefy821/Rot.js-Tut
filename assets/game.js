Function.prototype.extend = function(parent) {
	this.prototype = Object.create(parent.prototype);
	this.prototype.constructor = this;
	return this;
}

var Game = {
    _display: null,
    _currentScreen: null,
    _screenWidth: 80,
    _screenHeight: 40,
    init: function() {
        //Any necessary initialization will go here.
        this._display = new ROT.Display({
          width: this._screenWidth,
					height: this._screenHeight + 1
        });
        this._display.setOptions({
          fontSize: 20,
          fontStyle: 'bold',
          //fontFamily: '',
          forceSquareRatio: true
        });
        // Create a helper function for binding to an event
        // and making it send it to the screen
        var game = this; // So that we dont lose this
        var bindEventToScreen = function(event) {
            window.addEventListener(event, function(e) {
                // When an event is recieved,
                // Send it to the screen if there is one
                if (game._currentScreen !== null) {
                    // Send the event type and data to the screen
                    game._currentScreen.handleInput(event, e);
                }
            });
        }
        // Bind keyboard input events
        bindEventToScreen('keydown');
        //bindEventToScreen('keyup');
        //bindEventToScreen('keypress');
    },

    getDisplay: function() {
        return this._display;
    },
    getScreenWidth: function() {
      return this._screenWidth;
    },
    getScreenHeight: function() {
      return this._screenHeight;
    },

    refresh: function() {
      // Clear the screenWidth
      this._display.clear();
      // Render the screen
      this._currentScreen.render(this._display);
    },

    switchScreen: function(screen) {
        // If we had a screen before, notify it that we exited
        if (this._currentScreen !== null) {
            this._currentScreen.exit();
    }
        // Clear the display
        this.getDisplay().clear();
        // Update our current screen, notify it we entered and then render it.
        this._currentScreen = screen;
        if (!this._currentScreen !== null) {
            this._currentScreen.enter();
            this.refresh();
        }
    }
}

window.onload = function() {
    // Initialize the game
    Game.init();
    // Add the container to our HTML page
    document.body.appendChild(Game.getDisplay().getContainer());
    // Load the start screen
    Game.switchScreen(Game.Screen.startScreen);
}
