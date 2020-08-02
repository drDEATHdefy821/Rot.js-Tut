Game.Screen = {};

// Define our initial start screen
Game.Screen.startScreen = {
    enter: function() { console.log("Entered start screen."); },
    exit: function() { console.log("Exited start screen."); },
    render: function(display) {
        // Render our prompt to the screen
        display.drawText(1,1, "%c{yellow}Dracsmore Depths");
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
    _gameEnded: false,
    _subScreen: null,
    enter: function() {
      // Create a map based on our size parameters
      var width = 100;
      var height = 100;
      var depth = 6;
      // Create our map from the tiles and player
      var tiles = new Game.Builder(width, height, depth).getTiles();
      this._player = new Game.Entity(Game.PlayerTemplate);
      this._map = new Game.Map(tiles, this._player);
      //this._map = new Game.Map(tiles, this._player);
      // Start the maps engine
      this._map.getEngine().start();
    },
    exit: function() { console.log("Exited play screen."); },
    render: function(display) {
      // Render subscreen if there is one
        if (this._subScreen) {
          this._subScreen.render(display);
          return;
        }
        var screenWidth = Game.getScreenWidth();
        var screenHeight = Game.getScreenHeight();
        // Make sure the x-axis doesnt go to the left of the left bound
        var topLeftX = Math.max(0, this._player.getX() - (screenWidth / 2));
        // Make sure we still have enough space to fit an entire game screen
        topLeftX = Math.min(topLeftX, this._map.getWidth() - screenWidth);
        // Make sure the y-axis doesnt go above the top bounds
        var topLeftY = Math.max(0, this._player.getY() - (screenHeight / 2));
        // Make sure we still have enough space to fit an entire game screen
        topLeftY = Math.min(topLeftY, this._map.getHeight() - screenHeight);
        // This object will keep track of all visible cells
        var visibleCells = {};
        // Store this._map and player's z to prevent loosing it in callbacks
        var map = this._map;
        var currentDepth = this._player.getZ();
        //Find all visibleCells and update the object
        map.getFov(currentDepth).compute(
          this._player.getX(), this._player.getY(),
          this._player.getSightRadius(),
          function(x, y, radius, visibility) {
            visibleCells[x + ',' + y] = true;
            // Mark cells as explored.
            map.setExplored(x, y, currentDepth, true);
          });
        // Render the explored map cells
        for (var x = topLeftX; x < topLeftX + screenWidth; x++) {
          for (var y = topLeftY; y < topLeftY + screenHeight; y++) {
            if (map.isExplored(x, y, currentDepth)) {
              // Fetch the glyph for the tile and render it to the screen
              // at the offset position.
              var glyph = this._map.getTile(x, y, currentDepth);
              var foreground = glyph.getForeground();
              // If we are at a cell that is in the field of vision, we need
              // to check if there are items or entities.
              if (visibleCells[x + ',' + y]) {
                // Check for items first, since we want to draw entities
                // over items.
                var items = map.getItemsAt(x, y, currentDepth);
                // If we have items, we want to render the top most item
                if (items) {
                  glyph = items[items.length - 1];
                }
                // Check if we have an entity at the position
                if (map.getEntityAt(x, y, currentDepth)) {
                  glyph = map.getEntityAt(x, y, currentDepth);
                }
                // Update the foreground color in case our glyph changed
                foreground = glyph.getForeground();
            }
            display.draw(
              x - topLeftX,
              y - topLeftY,
              glyph.getChar(),
              foreground,
              glyph.getBackground());
            }
          }
        }

        // Get the messages in the player's queue and render them
        var messages = this._player.getMessages();
        var messageY = 0;
        for (var i = 0; i < messages.length; i++) {
          // Draw each message, adding the number of lines
          messageY += display.drawText(
            0,
            messageY,
            '%c{white}%b{black}' + messages[i]
          );
        }
        // Render player HP
        var stats = '%c{white}%b{black}';
        stats += vsprintf('Hp: %d/%d ',
                          [this._player.getHp(), this._player.getMaxHp()]);
        display.drawText(0, screenHeight, stats);
    },
    handleInput: function(inputType, inputData) {
        if (this._gameEnded) {
          if (inputType === 'keydown' && inputData.keyCode === ROT.KEYS.VK_RETURN) {
              Game.switchScreen(Game.Screen.loseScreen);
        }
        // Return to make sure the user still cant play
        return;
        }
        // Handle subscreen input if there is one
        if (this._subScreen) {
          this._subScreen.handleInput(inputType, inputData);
          return;
        }
        if (inputType === 'keydown') {
            //If enter is pressed, go to the Win screen
            //If escape is pressed, go to Lose screen
            if (inputData.keyCode === ROT.KEYS.VK_RETURN) {
                Game.switchScreen(Game.Screen.winScreen);
            } else if (inputData.keyCode === ROT.KEYS.VK_ESCAPE) {
                Game.switchScreen(Game.Screen.loseScreen);
            } else {
              // movement
              if (inputData.keyCode === ROT.KEYS.VK_A) {
                this.move(-1, 0, 0);
              } else if (inputData.keyCode === ROT.KEYS.VK_D) {
                this.move(1, 0, 0);
              } else if (inputData.keyCode === ROT.KEYS.VK_W) {
                this.move(0, -1, 0);
              } else if (inputData.keyCode === ROT.KEYS.VK_S) {
                this.move(0, 1, 0);
              } else if (inputData.keyCode === ROT.KEYS.VK_I) {
                if (this._player.getItems().filter(function(x){return x;}).length === 0) {
                  // If the player has no items, send a message and dont take a turn
                  Game.sendMessage(this._player, "You are not carrying anything!");
                  Game.refresh();
                } else {
                  // Show the inventory
                  Game.Screen.inventoryScreen.setup(this._player, this._player.getItems());
                  this.setSubscreen(Game.Screen.inventoryScreen);
                }
                return;
              } else if (inputData.keyCode === ROT.KEYS.VK_P) {
                  if (this._player.getItems().filter(function(x){return x;}).length === 0) {
                    // If the player has no items, send a message and dont take a turn
                    Game.sendMessage(this._player, "You have nothing to drop!");
                    Game.refresh();
                } else {
                  // Show the drop screen
                  Game.Screen.dropScreen.setup(this._player, this._player.getItems());
                  this.setSubscreen(Game.Screen.dropScreen);
                }
                return;
              } else if (inputData.keyCode === ROT.KEYS.VK_COMMA) {
                var items = this._map.getItemsAt(this._player.getX(), this._player.getY(), this._player.getZ());
                // if there are no items, show a message
                if (!items) {
                  Game.sendMessage(this._player, "There is nothing here to pick up.");
                } else if (items.length === 1) {
                  // If only one item, try to pick it up
                  var item = items[0];
                  if (this._player.pickupItems([0])) {
                    Game.sendMessage(this._player, "You pick up %s.", [item.describeA()]);
                  } else {
                    Game.sendMessage(this._player, "Your inventory is full! Nothing was picked up.");
                  }
              } else {
                // Show the pickup screen if there are any items
                Game.Screen.pickupScreen.setup(this._player, items);
                this.setSubscreen(Game.Screen.pickupScreen);
                return;
              }
            } else {
                // Not a valid key
                return;
              }
              // Unlock the Engine
              this._map.getEngine().unlock();
            }
          } else if (inputType === 'keypress') {
            var keyChar = String.fromCharCode(inputData.charCode);
            if (keyChar === '>') {
              this.move(0, 0, 1);
            } else if (keyChar === '<') {
              this.move(0, 0, -1);
            } else {
              // Not a valid key
              return;
            }
            // Unlock the engine
            this._map.getEngine().unlock();
          }
        },
    move: function(dX, dY, dZ) {
      var newX = this._player.getX() + dX;
      var newY = this._player.getY() + dY;
      var newZ = this._player.getZ() + dZ;
      //try to move to the new cell
      this._player.tryMove(newX, newY, newZ, this._map);
    },
    setGameEnded: function(gameEnded) {
      this._gameEnded = gameEnded;
    },
    setSubscreen: function(subScreen) {
      this._subScreen = subScreen;
      // Refresh screen on changing the subscreen
      Game.refresh();
    }
};

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
};

Game.Screen.ItemListScreen = function(template) {
  // Set up based on the template
  this._caption = template['caption'];
  this._okFunction = template['ok'];
  // whether the user can select items at all
  this._canSelectItem = template['canSelect'];
  // Wheater the user can select mulitple items.
  this._canSelectMultipleItems = template['canSelectMultipleItems'];
};

Game.Screen.ItemListScreen.prototype.setup = function(player, items) {
  this._player = player;
  // Should be called before switching to the screen.
  this._items = items;
  // Clean set of selected indices
  this._selectedIndices = {};
};

Game.Screen.ItemListScreen.prototype.render = function(display) {
  var letters = 'abcdefghijklmnopqrstuvwxyz';
  // render the caption in the top row
  display.drawText(0, 0, this._caption);
  var row = 0;
  for (var i = 0; i < this._items.length; i++) {
    // If we have an item, we want to render it.
    if (this._items[i]) {
      // Get the letter matching the items index
      var letters = letters.substring(i, i + 1);
      // If we have selected an item, show a +, else show a dash between
      // the letter and the items name.
      var selectionState = (this._canSelectItem && this._canSelectMultipleItems
                            && this._selectedIndices[i]) ? '+' : '-';
      // Render at the correct row and add 2
      display.drawText(0, 2 + row, letter + ' ' + selectionState + ' ' +
                        this._items[i].describe());
      row++;
    }
  }
};

Game.Screen.ItemListScreen.prototype.executeOkFunction = function() {
  // Gather the selected items.
  var selectedItems = {};
  for (var key in this._selectedIndices) {
    selectedItems[key] = this._items[key];
  }
  // Switch back to the play screen
  Game.Screen.playScreen.setSubscreen(undefined);
  // Call the OK function and end the players turn if it returns true
  if (this._okFunction(selectedItems)) {
    this._player.getMap().getEngine().unlock();
  }
};

Game.Screen.ItemListScreen.prototype.handleInput = function(inputType, inputData) {
  if (inputType === 'keydown') {
    // If the user hits escape, hits enter and cant select an item, or hits
    // enter without and items selected, simply cancel out
    if (inputData.keyCode == ROT.KEYS.VK_ESCAPE ||
      (inputData.keycode === ROT.KEYS.VK_RETURN &&
      (!this._canSelectItem || Object.keys(this._selectedIndices).length === 0))) {
        Game.Screen.playScreen.setSubscreen(undefined);
        // Handle pressing return when items are selected
      } else if (inputData.keyCode === ROT.KEYS.VK_RETURN) {
        this.executeOkFunction();
      // Handle pressing a letter if we can select
    } else if (this._canSelectItem && inputData.keyCode >= ROT.KEYS.VK_A &&
              inputData.keyCode <= ROT.KEYS.VK_Z) {
        // Check if it maps to a valid item by subtracting 'a' from the character
        // to know what letter of the alphabet we used.
        var index = inputData.keyCode - ROT.KEYS.VK_A;
        if (this._items[index]) {
          // If multiple selection is allowed, toggle the selection status, else
          // select item and exit the screen.
          if (this._canSelectMultipleItems) {
            if (this._selectedIndices[index]) {
              delete this._selectedIndices[index];
            } else {
              this._selectedIndices[index] = true;
            }
            // Redraw screen
            Game.refresh();
          } else {
            this._selectedIndices[index] = true;
            this.executeOkFunction();
          }
        }
      }
    }
  };

Game.Screen.inventoryScreen = new Game.Screen.ItemListScreen({
  caption: 'Inventory',
  canSelect: false
});

Game.Screen.pickupScreen = new Game.Screen.ItemListScreen({
  caption: 'Choose the items you wish to pickup',
  canSelect: true,
  canSelectMultipleItems: true,
  ok: function(selectedItems) {
    // Try to pick up all items, messaging the player if they couldnt all be
    // picked up.
    if (!this._player.pickupItems(Object.keys(selectedItems))) {
      Game.sendMessage(this._player,
        "Your inventory is full! not all items were picked up.");
    }
    return true;
  }
});

Game.Screen.dropScreen = new Game.Screen.ItemListScreen({
  caption: 'Choose the item you wish to drop',
  canSelect: true,
  canSelectMultipleItems: false,
  ok: function(selectedItems) {
    // Drop the selected item
    this._player.dropItem(Object.keys(selectedItems)[0]);
    return true;
  }
});
