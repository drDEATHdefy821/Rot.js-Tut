Game.Item = function(properties) {
  properties = properties || {};
  // Call the glyph's constructor with out set of properties
  Game.Glyph.call(this, properties);
  // Instantiate and properties from the passed object
  this._name = properties['name'] || '';
};

Game.Item.extend(Game.Glyph);
