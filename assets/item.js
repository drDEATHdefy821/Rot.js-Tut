Game.Item = function(properties) {
  properties = properties || {};
  // Call the glyph's constructor with our set of properties
  Game.Glyph.call(this, properties);
  // Instantiate and properties from the passed object
  this._name = properties['name'] || '';
};

Game.Item.extend(Game.Glyph);

Game.Item.prototype.describe = function() {
  return this._name;
};

Game.Item.prototype.describeA = function(capitalize) {
  // Optional parameter to capitalize the a/an.
  var prefixes = capitalize ? ['A', 'An'] : ['a', 'an'];
  var string = this.describe();
  var firstLetter = string.charAt(0).toLowerCase();
  // If word starts by a vowel, use an, else use a. Not that this is not perfect
  var prefix = 'aeiou'.indexOf(firstLetter) >= 0 ? 1 : 0;
  console.log(prefixes, string, firstLetter, prefix);
  return prefixes[prefix] + ' ' + string;
};
