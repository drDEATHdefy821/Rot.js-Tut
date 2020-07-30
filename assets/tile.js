Game.Tile = function(properties) {
  properties = properties || {};
  // Call the Glyph constructor with our properties.
  Game.Glyph.call(this, properties);
  // Set up the properties. We use false by default.
  this._isWalkable = properties['isWalkable'] || false;
};

// Make all tiles inherit all functionality from glyphs
Game.Tile.extend(Game.Glyph);

// Standard getters
Game.Tile.prototype.isWalkable = function() {
  return this._isWalkable;
}

//var stoneArr = ["63, 63, 63", "107, 107, 107", "128, 128, 128"]
//var stoneColor = stoneArr[Math.floor(Math.random() * arr.lenght)];

Game.Tile.nullTile = new Game.Tile({});
Game.Tile.floorTile = new Game.Tile({
  character: '.',
  foreground: 'rgb(53, 53, 53)',
  isWalkable: true
});
Game.Tile.wallTile1 = new Game.Tile({
  character: '#',
  foreground: 'rgb(107, 107, 107)',
  background: 'rgb(63, 63, 63)',
});
Game.Tile.wallTile2 = new Game.Tile({
  character: '#',
  foreground: 'rgb(128, 128, 128)',
  background: 'rgb(107, 107, 107)',
});
Game.Tile.wallTile3 = new Game.Tile({
  character: '#',
  foreground: 'rgb(158, 158, 158)',
  background: 'rgb(128, 128, 128)',
});
