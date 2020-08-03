// Make items inherit all the functionality from glyphs
Game.ItemRepository = new Game.Repository('items', Game.Item);

Game.ItemRepository.define('apple', {
  name: 'apple',
  character: '%',
  foreground: 'red',
  foodValue: 50,
  mixins: [Game.ItemMixins.Edible]
});

Game.ItemRepository.define('melon', {
  name: 'melon',
  character: '%',
  foreground: 'Green',
  foodValue: 35,
  consumptions: 4,
  mixins: [Game.ItemMixins.Edible]
});

Game.ItemRepository.define('rock', {
  name: 'rock',
  character: '*',
  foreground: 'rgb(127, 127, 127)'
});

Game.ItemRepository.define('corpse', {
  name: 'corpse',
  character: '%',
  foodValue: 75,
  consumptions: 1,
  mixins: [Game.ItemMixins.Edible]
}, {
  disableRandomCreation: true
});
