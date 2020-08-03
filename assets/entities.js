// Player template
Game.PlayerTemplate = {
  character: '@',
  foreground: 'white',
  background: 'black',
  maxHp: 40,
  attackValue: 10,
  sightRadius: 6,
  inventorySlots: 22,
  mixins: [Game.EntityMixins.PlayerActor,
          Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
          Game.EntityMixins.InventoryHolder, Game.EntityMixins.FoodConsumer,
          Game.EntityMixins.Sight, Game.EntityMixins.MessageRecipient]
};

// Create our central entity repository
Game.EntityRepository = new Game.Repository('entities', Game.Entity);

Game.EntityRepository.define('fungus', {
  name: 'fungus',
  character: 'F',
  foreground: 'rgb(7, 99, 32)',
  maxHp: 10,
  mixins: [Game.EntityMixins.FungusActor, Game.EntityMixins.Destructible]
});

Game.EntityRepository.define('bat', {
  name: 'bat',
  character: 'B',
  foreground: 'brown',
  maxHp: 5,
  attackValue: 2,
  mixins: [Game.EntityMixins.WanderActor, Game.EntityMixins.CorpseDropper,
          Game.EntityMixins.Attacker, Game.EntityMixins.Destructible]
});

Game.EntityRepository.define('newt', {
  name: 'newt',
  character: ':',
  foreground: 'green',
  maxHp: 3,
  attackValue: 2,
  mixins: [Game.EntityMixins.WanderActor, Game.EntityMixins.Attacker,
          Game.EntityMixins.Destructible, Game.EntityMixins.CorpseDropper]
});
