Game.Screen = {};

// Define our initial start screen
Game.Screen.startScreen = {
    enter: function() { console.log("Entered start screen."); },
    exit: function() { console.log("Exited start screen."); },
    render: function(display) {
        // Render our prompt to the screen
        display.drawText(1,1, "%c{yellow}Javascript Rouguelike");
        display.drawText(1,2, "Press [Enter] to start!");
    },
    handleInput: function(inputType, inputData) {
        // When [Enter] is pressed, go to play screen
        if (inputType === 'keydown') {
            if (inputData.keyCode === ROT.KEYS.VK_RETURN) {
                Game.switchScreen(Game.Screen.playScreen);
            }
        }
    }
}

// Define our play screen
Game.Screen.playScreen = {
    enter: function() {
      var map = [];
      for (var x = 0; x < 80; x++) {
        // Create the nested array for the y values
        map.push([]);
        // Add all the tiles
        for (var y = 0; y < 24; y++) {
          map[x].push(Game.Tile.nullTile);
        }
      }
      // Setup the map generator
      var generator = new ROT.Map.Cellular(80, 24);
      generator.randomize(0.5);
      var totalIterations = 3;
      // Iteratively smoothen the Map
      for (var i = 0; i < totalIterations - 1; i++) {
        generator.create();
      }
      // Smoothen it one last time and then update our map
      generator.create(function(x,y,v) {
        if ( v === 1) {
          map[x][y] = Game.Tile.floorTile;
          console.log("Creating floorTile")
        } else {
          map[x][y] = Game.Tile.wallTile;
          console.log("Creating wallTile")
        }
      });
      // Create our map from the tiles
      this._map = new Game.Map(map);
      }

    },
    exit: function() { console.log("Exited play screen."); },
    render: function(display) {
        // Iterate through all map cells
        console.log("Starting to render map")
        for (var x = 0; x < this._map.getWidth(); x++) {
          console.log("Iterated through x cells");
          for (var y = 0; y < this._map.getHeight(); y++) {
            console.log("Iterated through y cells");
            var glyph = this._map.getTile(x, y).getGlyph();
            display.draw(x, y,
              glyph.getChar(),
              glyph.getForeground(),
              glyph.getBackground());

          }
        }
    },
    handleInput: function(inputType, inputData) {
        if (inputType === 'keydown') {
            //If enter is pressed, go to the Win screen
            //If escape is pressed, go to Lose screen
            if (inputData.keyCode === ROT.KEYS.VK_RETURN) {
                Game.switchScreen(Game.Screen.winScreen);
            } else if (inputData.keyCode === ROT.KEYS.VK_ESCAPE) {
                Game.switchScreen(Game.Screen.loseScreen);
            }
        }
    }
}

// Define our winning screen
Game.Screen.winScreen = {
    enter: function() { console.log("Entered win screen."); },
    exit: function() { console.log("Exited win screen."); },
    render: function(display) {
        // Render our prompt to the screen
        for (var i = 0; i < 22; i++) {
            // Generate random background colors
            var r = Math.round(Math.random() * 255);
            var g = Math.round(Math.random() * 255);
            var b = Math.round(Math.random() * 255);
            var background = ROT.Color.toRGB([r, g, b]);
            display.drawText(2, i + 1, "%b{" + background + "}You win!");
        }
    },
    handleInput: function(inputType, inputData) {
        // Nothing to do here
    }
}

// Define our winning screen
Game.Screen.loseScreen = {
    enter: function() { console.log("Entered lose screen."); },
    exit: function() { console.log("Exited lose screen."); },
    render: function(display) {
        // Render our prompt to the screen
        for (var i = 0; i < 22; i++) {
            display.drawText(2, i + 1, "%b{red}You lose! :(");
        }
    },
    handleInput: function(inputType, inputData) {
        // Nothing to do here
    }
}
