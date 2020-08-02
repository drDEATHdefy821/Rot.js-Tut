// Create our Mixins namespace
Game.Mixins = {};

Game.Mixins.PlayerActor = {
  name: 'PlayerActor',
  groupName: 'Actor',
  act: function() {
    // Detect if the game is over
    if (this.getHp() < 1) {
      Game.Screen.playScreen.setGameEnded(true);
      // Send a last message to the player
      Game.sendMessage(this, 'You have died... Press [Enter] to continue!');
    }
    // Re-render the screen
    Game.refresh();
    // Lock the engine and wait asynchronously for the player to press a key
    this.getMap().getEngine().lock();
    // Clear the message queue
    this.clearMessages();
  }
};

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
                                        this.getY() + yOffset,
                                        this.getZ())) {
            var entity = Game.EntityRepository.create('fungus');
            entity.setPosition(this.getX() + xOffset,
                              this.getY() + yOffset, this.getZ());
            this.getMap().addEntity(entity);
            this._growthsRemaining--;

            // Send a message nearby
            Game.sendMessageNearby(this.getMap(),
              entity.getX(), entity.getY(), entity.getZ(),
              'The fungus is spreading!');
          }
        }
      }
    }
  }
};

Game.Mixins.WanderActor = {
  name: 'WanderActor',
  groupName: 'Actor',
  act: function() {
    // Flip coin to determin if moving 1 in the positive or negative direction
    var moveOffset = (Math.round(Math.random()) === 1) ? 1 : -1;
    // Flip coin to determine if moving in x direction or y direction
    if (Math.round(Math.random()) === 1) {
      this.tryMove(this.getX() + moveOffset, this.getY(), this.getZ());
    } else {
      this.tryMove(this.getX(), this.getY() + moveOffset, this.getZ());
    }
  }
};

Game.Mixins.Attacker = {
  name: 'Attacker',
  groupName: 'Attacker',
  init: function(template) {
    this._attackValue = template['attackValue'] || 1;
  },
  getAttackValue: function() {
    return this._attackValue;
  },
  attack: function(target) {
    // If the target is Destructible, calculate the damage based on
    // attack and defense value.
    if (target.hasMixin('Destructible')) {
      var attack = this.getAttackValue();
      var defense = target.getDefenseValue();
      var max = Math.max(0, attack - defense);
      var damage = 1 + Math.floor(Math.random() * max);
      Game.sendMessage(this, 'You strike the %s for %d damage!',
                      [target.getName(), damage]);
      Game.sendMessage(target, 'The %s strikes you for %d damage!',
                      [this.getName(), damage]);
      target.takeDamage(this, damage);
    }
  }
};

Game.Mixins.Destructible = {
  name: 'Destructible',
  init: function(template) {
    this._maxHp = template['maxHp'] || 10;
    // We allow taking in health from the template incase we want
    // the entity to start with a differnt amount of HP that the max.
    this._hp = template['hp'] || this._maxHp;

    this._defenseValue = template['defenseValue'] || 0;
  },
  getDefenseValue: function() {
    return this._defenseValue;
  },
  getHp: function() {
    return this._hp;
  },
  getMaxHp: function() {
    return this._maxHp;
  },
  takeDamage: function(attacker, damage) {
    this._hp -= damage;
    // If have 0 or less HP, then remove ourselves from the map
    if (this._hp <= 0) {
      Game.sendMessage(attacker, 'You kill the %s!', [this.getName()]);
      // Check if the player died, and if so call their act method
      // to prompt the user.
      if (this.hasMixin(Game.Mixins.PlayerActor)) {
        this.act();
      } else {
        this.getMap().removeEntity(this);
      }
    }
  }
};

Game.Mixins.MessageRecipient = {
  name: 'MessageRecipient',
  init: function(template) {
    this._messages = [];
  },
  receiveMessage: function(message) {
    this._messages.push(message);
  },
  getMessages: function() {
    return this._messages;
  },
  clearMessages: function() {
    this._messages = [];
  }
};

Game.Mixins.Sight = {
  name: 'Sight',
  groupName: 'Sight',
  init: function(template) {
    this._sightRadius = template['sightRadius'] || 5;
  },
  getSightRadius: function() {
    return this._sightRadius;
  }
}

Game.sendMessage = function(recipient, message, args) {
  // Make sure the recipient can recive the message before doing any work.
  if (recipient.hasMixin(Game.Mixins.MessageRecipient)) {
    // If args were passed, then we format the message,
    // else no formatting is needed
    if (args) {
      message = vsprintf(message, args);
    }
    recipient.receiveMessage(message);
  }
};

Game.sendMessageNearby = function(map, centerX, centerY, centerZ, message, args) {
  // If args were passed, then we format the message,
  // else no formatting is needed
  if (args) {
    message = vsprintf(message, args);
  }
  // Get the nearby entities
  entities = map.getEntitiesWithinRadius(centerX, centerY, centerZ, 5);
  // Iterate through nearby entities, sending the message if they can receive it
  for (var i = 0; i < entities.length; i++) {
    if (entities[i].hasMixin(Game.Mixins.MessageRecipient)) {
        entities[i].receiveMessage(message);
    }
  }
};

Game.Mixins.InventoryHolder = {
  name: 'InventoryHolder',
  init: function(template) {
    // Default to 10 slots.
    var inventorySlots = template['inventorySlots'] || 10;
    // Set up an empty inventory
    this._items = new Array(inventorySlots);
  },
  getItems: function() {
    return this._items;
  },
  getItem: function(i) {
    return this._items[i]
  },
  addItem: function(item) {
    // Try to find a slot, returning ture only if we could add the item
    for (var i = 0; i < this._items.length; i++) {
      if (!this._items[i]) {
        this._items[i] = item;
        return true;
      }
    }
    return false;
  },
  removeItem: function(i) {
    // Simply clear the inventory slot.
    this._items[i] = null;
  },
  canAddItem: function() {
    // Check if we have an empty slot
    for (var i = 0; i < this._items.length; i++) {
      if (!this._items[i]) {
        return true;
      }
    }
    return false;
  },
  pickupItems: function(indices) {
    // Allows the user to pick up items from the map, where indices is the
    // the indices for the array returned by map.getItemsAt
    var mapItems = this._map.getItemsAt(this.getX(), this.getY(), this.getZ());
    var added = 0;
    // Iterate through all indices.
    for (var i = 0; i < indices.length; i++) {
      // Try to add the item. if our inventory is not full, then splice the
      // item out of the list of items. In order to fetch the right item, we
      // have to offset the number of items already added.
      if (this.addItem(mapItems[indices[i] - added])) {
        mapItems.splice(indices[i] - added, 1);
        added++;
      } else {
        // Inventory is full
        break;
      }
    }
    // Update the map items
    this._map.setItemsAt(this.getX(), this.getY(), this.getZ(), mapItems);
    // Return true onlu if we added all items
    return added === indices.length;
  },
  dropItem: function(i) {
    // Drops an item to the current map tile
    if (this._items[i]) {
      if (this._map) {
        this._map.addItem(this.getX(), this.getY(), this.getZ(), this._items[i]);
      }
      this.removeItem(i);
    }
  }
};

// Player template
Game.PlayerTemplate = {
  character: '@',
  foreground: 'white',
  background: 'black',
  maxHp: 40,
  attackValue: 10,
  sightRadius: 6,
  inventorySlots: 22,
  mixins: [Game.Mixins.PlayerActor,
          Game.Mixins.Attacker, Game.Mixins.Destructible,
          Game.Mixins.InventoryHolder,
          Game.Mixins.Sight, Game.Mixins.MessageRecipient]
};

// Create our central entity repository
Game.EntityRepository = new Game.Repository('entities', Game.Entity);

Game.EntityRepository.define('fungus', {
  name: 'fungus',
  character: 'F',
  foreground: 'rgb(7, 99, 32)',
  maxHp: 10,
  mixins: [Game.Mixins.FungusActor, Game.Mixins.Destructible]
});

Game.EntityRepository.define('bat', {
  name: 'bat',
  character: 'B',
  foreground: 'brown',
  maxHp: 5,
  attackValue: 2,
  mixins: [Game.Mixins.WanderActor, Game.Mixins.Attacker,
          Game.Mixins.Destructible]
});

Game.EntityRepository.define('newt', {
  name: 'newt',
  character: ':',
  foreground: 'green',
  maxHp: 3,
  attackValue: 2,
  mixins: [Game.Mixins.WanderActor, Game.Mixins.Attacker,
          Game.Mixins.Destructible]
});
