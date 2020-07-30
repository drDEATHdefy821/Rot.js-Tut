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
    _map: null,
    _player: null,
    enter: function() {
      var map = [];
      // Create a map based on our size parameters
      var mapWidth = 200;
      var mapHeight = 200;
      for (var x = 0; x < mapWidth; x++) {
        // Create the nested array for the y values
        map.push([]);
        // Add all the tiles
        for (var y = 0; y < mapHeight; y++) {
          map[x].push(Game.Tile.nullTile);
        }
      }
      // Setup the map generator
      var generator = new ROT.Map.Cellular(
        mapWidth, mapHeight, { connected: true}
      );
      generator.randomize(0.55);
      var totalIterations = 3;
      // Iteratively smoothen the Map
      for (var i = 0; i < totalIterations - 1; i++) {
        generator.create();
      }
      // Smoothen it one last time and then update our map
      generator.create();

      var randWallTile =
      [Game.Tile.wallTile1, Game.Tile.wallTile2, Game.Tile.wallTile3];
      //var wallTileX =
      //randWallTile[Math.floor(Math.random() * randWallTile.length)];

      generator.connect(function(x,y,v) {
        if ( v === 1) {
          map[x][y] = Game.Tile.floorTile;
        } else {
          map[x][y] = randWallTile[Math.floor(Math.random() * randWallTile.length)];
        }
      }, 1);
      // Create our map from the tiles
      this._map = new Game.Map(map);
      // Create our player and set position
      this._player = new Game.Entity(Game.PlayerTemplate);
      var position = this._map.getRandomFloorPosition();
      this._player.setX(position.x);
      this._player.setY(position.y);
      console.log(generator);
    },
    exit: function() { console.log("Exited play screen."); },
    render: function(display) {
        var screenWidth = Game.getScreenWidth();
        var screenHeight = Game.getScreenHeight();
        // Make sure the x-axis doesnt go to the left of the left bound
        var topLeftX = Math.max(0, this._player.getX() - (screenWidth / 2));
        // Make sure we still have enough space to fit an entire game screen
        topLeftX = Math.min(topLeftX, this._map.getWidth() - screenWidth);
        // Make sure the y-axis doesnt go above the top bounds
        var topLeftY = Math.max(0, this._player.getY - (screenHeight / 2));
        // Make sure we still have enough space to fit an entire game screen
        topLeftY = Math.min(topLeftY, this._map.getHeight() - screenHeight);
        // Iterate through all visible map cells
        for (var x = topLeftX; x < topLeftX + screenWidth; x++) {
          for (var y = topLeftY; y < topLeftY + screenHeight; y++) {
            // Fetch the glyph for the tile and render it to the screen
            // at the offset position.
            var tile = this._map.getTile(x, y);
            display.draw(
              x - topLeftX,
              y - topLeftY,
              tile.getChar(),
              tile.getForeground(),
              tile.getBackground())
          }
        }
        // Render the player
        display.draw(
          this._player.getX() - topLeftX,
          this._player.getY() - topLeftY,
          this._player.getChar(),
          this._player.getForeground(),
          this._player.getBackground()
        );
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
            // movement
            if (inputData.keyCode === ROT.KEYS.VK_A) {
              this.move(-1, 0);
            } else if (inputData.keyCode === ROT.KEYS.VK_D) {
              this.move(1, 0);
            } else if (inputData.keyCode === ROT.KEYS.VK_W) {
              this.move(0, -1);
            } else if (inputData.keyCode === ROT.KEYS.VK_S) {
              this.move(0, 1);
            }
        }
    },
    move: function(dX, dY) {
      var newX = this._player.getX() + dX;
      var newY = this._player.getY() + dY;
      //try to move to the new cell
      this._player.tryMove(newX, newY, this._map);
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
