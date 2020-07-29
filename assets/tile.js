Game.Tile = function(glyph) {
  this._glyph = glyph;
};

Game.Tile.prototype.getGlyph = function() {
  return this._glyph;
};

//var stoneArr = ["63, 63, 63", "107, 107, 107", "128, 128, 128"]
//var stoneColor = stoneArr[Math.floor(Math.random() * arr.lenght)];

Game.Tile.nullTile = new Game.Tile(new Game.Glyph());
Game.Tile.floorTile = new Game.Tile(new Game.Glyph('.', 'rgb(53, 53, 53)', ));
Game.Tile.wallTile1 = new Game.Tile(new Game.Glyph('#', 'rgb(107, 107, 107)', 'rgb(63, 63, 63)'));
Game.Tile.wallTile2 = new Game.Tile(new Game.Glyph('#', 'rgb(128, 128, 128)', 'rgb(107, 107, 107)'));
Game.Tile.wallTile3 = new Game.Tile(new Game.Glyph('#', 'rgb(158, 158, 158)', 'rgb(128, 128, 128)'));
