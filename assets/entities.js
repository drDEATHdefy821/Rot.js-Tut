// Create our Mixins namespace
Game.Mixins = {};

// Define our Moveable mixin
Game.Mixins.Moveable = {
  name: 'Moveable',
  tryMove: function(x, y, map) {
    var tile = map.getTile(x, y);
    var target = map.getEntityAt(x, y);
    // If an entity was present at the tile, then we cant move there
    if (target) {
      // If we are an attacker, try to attack the target
      if (this.hasMixin('Attacker')) {
          this.attack(target);
          return true;
      } else {
          // If not nothing we can do, but we cant move to the tile
          return false;
      }
    // Check if we can walk on the tile and if so walk onto it
    } else if (tile.isWalkable()) {
      // Update the entitys position
      this._x = x;
      this._y = y;
      return true;
    }
    return false;
  }
}

Game.Mixins.PlayerActor = {
  name: 'PlayerActor',
  groupName: 'Actor',
  act: function() {
    // Re-render the screen
    Game.refresh();
    // Lock the engine and wait asynchronously for the player to press a key
    this.getMap().getEngine().lock();
  }
}

Game.Mixins.FungusActor = {
  name: 'FungusActor',
  groupName: 'Actor',
  init: function() {
    this._growthsRemaining = 5;
  },
  act: function() {
    // Check if we are going to grow this turn
    if (this._growthsRemaining > 0) {
      if (Math.random() <= 0.01) {
        // Generate the coords of a random adjacent square by generating
        // an ofset between [-1, 0, 1] for both the x and y directions.
        // To do this, we generate a number from 0 - 2 and then subtract 1
        var xOffset = Math.floor(Math.random() * 3) - 1;
        var yOffset = Math.floor(Math.random() * 3) - 1;
        // Make sure we arnt trying to spawn on the same tile as us
        if (xOffset != 0 || yOffset !=0) {
          // Check if we can actually spawn at that location, if so then grow
          if (this.getMap().isEmptyFloor(this.getX() + xOffset,
                                        this.getY() + yOffset)) {
            var entity = new Game.Entity(Game.FungusTemplate);
            entity.setX(this.getX() + xOffset);
            entity.setY(this.getY() + yOffset);
            this.getMap().addEntity(entity);
            this._growthsRemaining--;
          }
        }
      }
    }
  }
}

Game.Mixins.SimpleAttacker = {
  name: 'SimpleAttacker',
  groupName: 'Attacker',
  attack: function(target) {
    //only remove the entity is they were attackable
    if (target.hasMixin('Destructible')) {
      target.takeDamage(this, 1);
    }
  }
}

Game.Mixins.Destructible = {
  name: 'Destructible',
  init: function() {
    this._hp = 1;
  },
  takeDamage: function(attacker, damage) {
    this._hp -= damage;
    // If have 0 or less HP, then remove ourselves from the map
    if (this._hp <= 0) {
      this.getMap().removeEntity(this);
    }
  }
}
// Player template
Game.PlayerTemplate = {
  character: '@',
  foreground: 'white',
  background: 'black',
  mixins: [Game.Mixins.Moveable, Game.Mixins.PlayerActor,
          Game.Mixins.SimpleAttacker, Game.Mixins.Destructible]
}

Game.FungusTemplate = {
  character: 'F',
  foreground: 'rgb(7, 99, 32)',
  mixins: [Game.Mixins.FungusActor, Game.Mixins.Destructible]
}
