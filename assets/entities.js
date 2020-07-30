// Create our Mixins namespace
Game.Mixins = {};

// Define our Moveable mixin
Game.Mixins.Moveable = {
  name: 'Moveable',
  tryMove: function(x, y, map) {
    var tile = map.getTile(x, y);
    var target = map.getEntityAt(x, y);
    // If an entity was present at the tile, then we cant move there
    if (target) {
      return false;
    // Check if we can walk on the tile and if so walk onto it
    } else if (tile.isWalkable()) {
      // Update the entitys position
      this._x = x;
      this._y = y;
      return true;
    }
    return false;
  }
}

Game.Mixins.PlayerActor = {
  name: 'PlayerActor',
  groupName: 'Actor',
  act: function() {
    // Re-render the screen
    Game.refresh();
    // Lock the engine and wait asynchronously for the player to press a key
    this.getMap().getEngine().lock();
  }
}

Game.Mixins.FungusActor = {
  name: 'FungusActor',
  groupName: 'Actor',
  act: function() { }
}

// Player template
Game.PlayerTemplate = {
  character: '@',
  foreground: 'white',
  background: 'black',
  mixins: [Game.Mixins.Moveable, Game.Mixins.PlayerActor]
}

Game.FungusTemplate = {
  character: 'F',
  foreground: 'rgb(7, 99, 32)',
  mixins: [Game.Mixins.FungusActor]
}
