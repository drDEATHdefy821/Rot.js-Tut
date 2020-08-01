// Make items inherit all the functionality from glyphs
Game.Item.extend(Game.Glyph);

Game.ItemRepository = new Game.Repository('items', Game.Item);

Game.ItemRepository.define('apple', {
  name: 'apple',
  character: '%',
  foreground: 'red'
});

Game.ItemRepository.define('rock', {
  name: 'rock',
  character: '*',
  foreground: 'rgb(127, 127, 127)'
});
