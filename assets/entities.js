// Create our Mixins namespace
Game.Mixins = {};

// Define our Moveable mixin
Game.Mixins.Moveable = {
  name: 'Moveable',
  tryMove: function(x, y, map) {
    var tile = map.getTile(x, y);
    // Check if we can walk on the tile and if so walk onto it
    if (tile.isWalkable()) {
      // Update the entitys position
      this._x = x;
      this._y = y;
      return true;
    }
    return false;
  }
}

// Player template
Game.PlayerTemplate = {
  character: '@',
  foreground: 'white',
  background: 'black',
  mixins: [Game.Mixins.Moveable]
}
