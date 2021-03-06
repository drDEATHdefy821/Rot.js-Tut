Game.Builder = function(width, height, depth) {
  this._width = width;
  this._height = height;
  this._depth = depth;
  this._tiles = new Array(depth);
  this._regions = new Array(depth);

  // Instantiate the arrays to be multi-dimensions
  for (var z = 0; z < depth; z++) {
    // Create a new cave at each level
    this._tiles[z] = this._generateLevel();
    // Setup the regions array for each depth
    this._regions[z] = new Array(width);
    for (var x = 0; x < width; x++) {
      this._regions[z][x] = new Array(height);
      // Fill with zeros
      for (var y = 0; y < height; y++) {
        this._regions[z][x][y] = 0;
      }
    }
  }
  for (var z = 0; z < this._depth; z++) {
    this._setupRegions(z);
  }
  this._connectAllRegions();
};

Game.Builder.prototype.getTiles = function () {
  return this._tiles;
};
Game.Builder.prototype.getDepth = function () {
  return this._depth;
};
Game.Builder.prototype.getWidth = function () {
  return this._width;
};
Game.Builder.prototype.getHeight = function () {
  return this._height;
};

Game.Builder.prototype._generateLevel = function() {
  // Create the empty map
  var map = new Array(this._width);
  for (var w = 0; w < this._width; w++) {
    map[w] = new Array(this._height);
  }
  // Set up the cave generator
  var generator = new ROT.Map.Cellular(
    this._width, this._height, { connected: true}
  );
  generator.randomize(0.525);
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
  return map;
};

Game.Builder.prototype._canFillRegion = function(x, y, z) {
  // Make sure the tile is within bounds
  if (x < 0 || y < 0 || z < 0 || x >= this._width || y >= this._screenHeight
      || z >= this._depth) {
        return false;
      }
  // Make sure the tile does not already have a region
  if (this._regions[z][x][y] != 0) {
    return false;
  }
  // Make sure the tile is isWalkable
  return this._tiles[z][x][y].isWalkable();
};

Game.Builder.prototype._fillRegion = function(region, x, y, z) {
  var tilesFilled = 1;
  var tiles = [{x:x, y:y}];
  var tile;
  var neighbours;
  // Update the region of the original tile
  this._regions[z][x][y] = region;
  // Keep looping while we still have tiles to process
  while (tiles.length > 0) {
    tile = tiles.pop();
    // Get the neighbours of the tile
    neighbours = Game.getNeighbourPositions(tile.x, tile.y);
    // Iterate through each neighbour, checking if we can use it to Fill
    // and if so updating the region and adding it to our processing list.
    while (neighbours.length > 0) {
      tile = neighbours.pop();
      if (this._canFillRegion(tile.x, tile.y, z)) {
          this._regions[z][tile.x][tile.y] = region;
          tiles.push(tile);
          tilesFilled++;
      }
    }
  }
  return tilesFilled;
};
// This removes all tiles at a given depth level with a region number
// It fills the tiles with a wall tile
Game.Builder.prototype._removeRegion = function(region, z) {
  var randWallTile =
  [Game.Tile.wallTile1, Game.Tile.wallTile2, Game.Tile.wallTile3];
  for (var x = 0; x < this._width; x++) {
    for (var y = 0; y < this._height; y++) {
      if (this._regions[z][x][y] == region) {
        // Clear the region and set the tile to a wall tile
        this._regions[z][x][y] = 0;
        this._tiles[z][x][y] =
          randWallTile[Math.floor(Math.random() * randWallTile.length)];
      }
    }
  }
};

// This sets up the regions for a given depth level
Game.Builder.prototype._setupRegions = function(z) {
  var region = 1;
  var tilesFilled;
  // Iterate through all tiles searching for a tile that can be used
  // as the starting point for a flood fill.
  for (var x = 0; x < this._width; x++) {
    for (var y = 0; y < this._height; y++) {
      if (this._canFillRegion(x, y, z)) {
        // Try to fill
        tilesFilled = this._fillRegion(region, x, y, z);
        // If it was too small, simply remove it
        if (tilesFilled <= 20) {
          this._removeRegion(region, z);
        } else {
          region++;
        }
      }
    }
  }
};

Object.defineProperty(Array.prototype, 'shuffle', {
    value: function() {
        for (let i = this.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
        return this;
    }
});

// This fetches a list of points that overlap between one region at a given
// depth level and a region at a level beneath it.
Game.Builder.prototype._findRegionOverlaps = function(z, r1, r2) {
  var matches = [];
  // Iterate through all tiles, checking if they respect the region constraints
  // and are floor tiles. We check that they are floor to make sure we dont
  // try to put two stairs on the same tile.
  for (var x = 0; x < this._width; x++) {
    for (var y = 0; y < this._height; y++) {
      if (this._tiles[z][x][y] == Game.Tile.floorTile &&
          this._tiles[z+1][x][y] == Game.Tile.floorTile &&
          this._regions[z][x][y] == r1 &&
          this._regions[z+1][x][y] == r2) {
            matches.push({x: x, y: y});
      }
    }
  }
  // We shuffle the list of matches to prevent bias
  matches.shuffle();
  return matches;
};

// This tries to connect two regions by calculating where they overlap and
// adding stairs
Game.Builder.prototype._connectRegions = function(z, r1, r2) {
  var overlap = this._findRegionOverlaps(z, r1, r2);
  // Make sure there was overlap
  if (overlap.length == 0) {
    return false;
  }
  // Select the first tile from the overlap and change it to stairs
  var point = overlap[0];
  this._tiles[z][point.x][point.y] = Game.Tile.stairsDownTile;
  this._tiles[z+1][point.x][point.y] = Game.Tile.stairsUpTile;
  return true;
};

// This tries to connect all regions for each depth level, starting from the top
Game.Builder.prototype._connectAllRegions = function() {
  for (var z = 0; z < this._depth - 1; z++) {
    // Iterate through each tile, and if we havent tried to connect the regions
    // of that tile on both depth levels then we try. We store connected
    // properties as strings for quick lookups.
    var connected = {};
    var key;
    for (var x = 0; x < this._width; x++) {
      for (var y = 0; y < this._height; y++) {
        key = this._regions[z][x][y] + ',' + this._regions[z+1][x][y];
        if (this._tiles[z][x][y] == Game.Tile.floorTile &&
            this._tiles[z+1][x][y] == Game.Tile.floorTile &&
            !connected[key]) {
            // Since both tiles are floors and we haven't already connected
            // the two regions, try now.
            this._connectRegions(z, this._regions[z][x][y],
                                  this._regions[z+1][x][y]);
            connected[key] = true;
        }
      }
    }
  }
}
