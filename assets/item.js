Game.Item = function(properties) {
  properties = properties || {};
  // Call the glyph's constructor with our set of properties
  Game.DynamicGlyph.call(this, properties);
};

Game.Item.extend(Game.DynamicGlyph);
