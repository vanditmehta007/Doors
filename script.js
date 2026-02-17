const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const MOVE_SPEED = 220;

class DoorsScene extends Phaser.Scene {
  constructor() {
    super("DoorsScene");

    this.places = [
      { id: "garden", name: "In A Giant's Garden", bg: "bg_garden" },
      { id: "office", name: "Liminal Office", bg: "bg_office" },
      { id: "tron", name: "Tron", bg: "bg_tron" },
      { id: "underwater", name: "Underwater", bg: "bg_underwater" },
      { id: "upside_down", name: "Upside Down World", bg: "bg_upside" },
      { id: "outer_space", name: "Outer Space Void", bg: "bg_space" },
    ];

    this.keyPlaceIds = this.places
      .filter((p) => p.id !== "outer_space")
      .map((p) => p.id);

    this.placeMap = {};
    this.places.forEach((p) => {
      this.placeMap[p.id] = p;
    });

    this.doorPositions = [
      { x: 190, y: 420 },
      { x: 480, y: 420 },
      { x: 770, y: 420 },
    ];
  }

  preload() {
    this.load.image("door", "door'.png");
    this.load.image("bg_garden", "teletubbie.jpg");
    this.load.image("bg_office", "grey.jpg");
    this.load.image("bg_tron", "tron.jpg");
    this.load.image("bg_underwater", "underwater2.jpg");
    this.load.image("bg_upside", "lights.jpg");
    this.load.image("bg_space", "space-sky-nebula.jpg");
  }

  create() {
    this.createGeneratedTextures();

    this.currentPlaceId = "garden";
    this.collectedKeys = new Set();
    this.winTriggered = false;
    this.keyPoints = {};

    this.keyPlaceIds.forEach((placeId) => {
      this.keyPoints[placeId] = this.randomPlayablePosition();
    });

    this.background = this.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "bg_garden")
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    this.doorSprites = [];
    this.doorLabels = [];
    this.doorPositions.forEach((pos, index) => {
      const door = this.physics.add
        .sprite(pos.x, pos.y, "door")
        .setDisplaySize(110, 155)
        .setImmovable(true)
        .setDepth(2);
      door.body.allowGravity = false;
      door.destinationId = "garden";
      door.slot = index + 1;
      this.doorSprites.push(door);

      const label = this.add
        .text(pos.x, pos.y + 100, `Door ${index + 1}`, {
          fontFamily: "monospace",
          fontSize: "16px",
          color: "#f5f5f5",
          backgroundColor: "#00000099",
          padding: { left: 6, right: 6, top: 2, bottom: 2 },
        })
        .setOrigin(0.5)
        .setDepth(5);
      this.doorLabels.push(label);
    });

    this.goldenDoor = this.physics.add
      .sprite(480, 170, "gold_door")
      .setDepth(3)
      .setVisible(false)
      .setImmovable(true);
    this.goldenDoor.body.allowGravity = false;

    this.keySprite = this.physics.add
      .sprite(100, 100, "key")
      .setDepth(4)
      .setAlpha(0)
      .setVisible(false);
    this.keySprite.body.allowGravity = false;

    this.player = this.physics.add
      .sprite(480, 290, "player")
      .setCollideWorldBounds(true)
      .setDepth(4);

    this.physics.add.overlap(this.player, this.keySprite, () => this.tryCollectKey());

    this.keysText = this.add
      .text(14, 12, "", {
        fontFamily: "monospace",
        fontSize: "19px",
        color: "#ffffff",
        backgroundColor: "#00000099",
        padding: { left: 8, right: 8, top: 4, bottom: 4 },
      })
      .setDepth(6);

    this.placeText = this.add
      .text(14, 52, "", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#ffe98a",
        backgroundColor: "#00000099",
        padding: { left: 8, right: 8, top: 4, bottom: 4 },
      })
      .setDepth(6);

    this.hintText = this.add
      .text(14, GAME_HEIGHT - 68, "", {
        fontFamily: "monospace",
        fontSize: "17px",
        color: "#ffffff",
        backgroundColor: "#00000099",
        padding: { left: 8, right: 8, top: 4, bottom: 4 },
        wordWrap: { width: GAME_WIDTH - 28 },
      })
      .setDepth(6);

    this.eventText = this.add
      .text(GAME_WIDTH / 2, 28, "", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ffe98a",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(7)
      .setAlpha(0);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys("W,A,S,D");
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    this.time.addEvent({
      delay: 7000,
      loop: true,
      callback: () => {
        if (this.winTriggered) return;
        this.relocateUncollectedKeys();
        this.randomizeDoors();
      },
    });

    this.enterPlace("garden", true);
    this.randomizeDoors();
  }

  update() {
    if (this.winTriggered) {
      this.player.setVelocity(0, 0);
      return;
    }

    this.handleMovement();
    this.updateKeyVisibilityAndHint();

    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      const nearby = this.getNearestDoor();
      if (nearby) {
        this.enterPlace(nearby.destinationId, false);
        return;
      }

      if (this.goldenDoor.visible && this.isNear(this.goldenDoor, 95)) {
        this.enterPlace("outer_space", false);
      }
    }
  }

  handleMovement() {
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vx += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) vy += 1;

    if (vx !== 0 || vy !== 0) {
      const norm = Math.sqrt(vx * vx + vy * vy);
      vx = (vx / norm) * MOVE_SPEED;
      vy = (vy / norm) * MOVE_SPEED;
    }

    this.player.setVelocity(vx, vy);
  }

  randomPlayablePosition() {
    return {
      x: Phaser.Math.Between(90, GAME_WIDTH - 90),
      y: Phaser.Math.Between(95, GAME_HEIGHT - 120),
    };
  }

  relocateUncollectedKeys() {
    this.keyPlaceIds.forEach((placeId) => {
      if (this.collectedKeys.has(placeId)) return;
      this.keyPoints[placeId] = this.randomPlayablePosition();
    });

    const currentPos = this.keyPoints[this.currentPlaceId];
    if (currentPos && !this.collectedKeys.has(this.currentPlaceId)) {
      this.keySprite.setPosition(currentPos.x, currentPos.y).setVisible(true).setAlpha(0.01);
    }
  }

  enterPlace(placeId, movePlayerToCenter) {
    this.currentPlaceId = placeId;
    const place = this.placeMap[placeId];

    this.background.setTexture(place.bg).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    this.placeText.setText(`Place: ${place.name}`);

    if (movePlayerToCenter) {
      this.player.setPosition(480, 290);
    } else {
      this.player.setPosition(480, 470);
    }

    const keyPos = this.keyPoints[placeId];
    if (keyPos && !this.collectedKeys.has(placeId)) {
      this.keySprite.setPosition(keyPos.x, keyPos.y).setVisible(true).setAlpha(0.01);
    } else {
      this.keySprite.setVisible(false);
    }

    this.updateGoldenDoorVisibility();
    this.updateKeysText();

    if (placeId === "outer_space") {
      this.triggerWin();
      return;
    }

    this.hintText.setText("Move freely. Press E near a door to travel.");
  }

  tryCollectKey() {
    const keyPos = this.keyPoints[this.currentPlaceId];
    if (!keyPos || this.collectedKeys.has(this.currentPlaceId)) return;

    this.collectedKeys.add(this.currentPlaceId);
    this.keySprite.setVisible(false);
    this.updateKeysText();
    this.updateGoldenDoorVisibility();
    this.flashEvent(`Key found in ${this.placeMap[this.currentPlaceId].name}!`);

    if (this.collectedKeys.size === this.keyPlaceIds.length) {
      this.flashEvent("All keys found. Locate the Golden Door.");
    }
  }

  updateGoldenDoorVisibility() {
    const ready = this.collectedKeys.size === this.keyPlaceIds.length;
    const show = ready && this.currentPlaceId !== "outer_space";
    this.goldenDoor.setVisible(show);
  }

  updateKeysText() {
    this.keysText.setText(`Keys: ${this.collectedKeys.size}/${this.keyPlaceIds.length}`);
  }

  updateKeyVisibilityAndHint() {
    if (this.currentPlaceId === "outer_space") return;

    const keyPos = this.keyPoints[this.currentPlaceId];
    if (keyPos && !this.collectedKeys.has(this.currentPlaceId)) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        keyPos.x,
        keyPos.y
      );

      const alpha = Phaser.Math.Clamp(1 - distance / 260, 0.02, 1);
      this.keySprite.setAlpha(alpha);

      let temp = "Cold";
      if (distance < 80) temp = "Scorching";
      else if (distance < 130) temp = "Hot";
      else if (distance < 190) temp = "Warm";
      else if (distance < 260) temp = "Chilly";

      this.hintText.setText(`${temp} trail for this place's key. Press E near a door to move.`);
    } else if (this.collectedKeys.size === this.keyPlaceIds.length) {
      this.hintText.setText("All keys collected. Find and enter the Golden Door.");
    } else {
      this.hintText.setText("No key left in this place. Try another door.");
    }
  }

  getNearestDoor() {
    let bestDoor = null;
    let bestDistance = Infinity;

    this.doorSprites.forEach((door) => {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, door.x, door.y);
      if (d < 95 && d < bestDistance) {
        bestDistance = d;
        bestDoor = door;
      }
    });

    return bestDoor;
  }

  isNear(sprite, threshold) {
    const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, sprite.x, sprite.y);
    return d <= threshold;
  }

  randomizeDoors() {
    if (this.currentPlaceId === "outer_space") return;

    const available = this.keyPlaceIds.filter((id) => id !== this.currentPlaceId);
    this.doorSprites.forEach((door, idx) => {
      door.destinationId = Phaser.Utils.Array.GetRandom(available);
      this.doorLabels[idx].setText(`Door ${door.slot}: ???`);
    });

    this.flashEvent("The maze shifts. Doors and keys changed.");
  }

  flashEvent(text) {
    this.eventText.setText(text);
    this.tweens.killTweensOf(this.eventText);
    this.eventText.setAlpha(0);
    this.tweens.add({
      targets: this.eventText,
      alpha: 1,
      duration: 120,
      yoyo: true,
      hold: 900,
    });
  }

  triggerWin() {
    this.winTriggered = true;
    this.goldenDoor.setVisible(false);
    this.hintText.setText("You escaped through the golden door into Outer Space Void.");
    this.flashEvent("Victory: Strange places conquered.");
  }

  createGeneratedTextures() {
    const g = this.add.graphics();

    g.clear();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(16, 16, 14);
    g.fillStyle(0x5cc8ff, 1);
    g.fillCircle(16, 16, 8);
    g.generateTexture("player", 32, 32);

    g.clear();
    g.fillStyle(0xdea900, 1);
    g.fillRect(0, 7, 28, 10);
    g.fillCircle(28, 12, 9);
    g.fillStyle(0x8f6c00, 1);
    g.fillCircle(28, 12, 4);
    g.generateTexture("key", 37, 24);

    g.clear();
    g.fillStyle(0xd5a10f, 1);
    g.fillRoundedRect(0, 0, 86, 130, 8);
    g.lineStyle(3, 0xffeb7a, 1);
    g.strokeRoundedRect(0, 0, 86, 130, 8);
    g.fillStyle(0x6a4f00, 1);
    g.fillCircle(66, 65, 4);
    g.generateTexture("gold_door", 86, 130);

    g.destroy();
  }
}

const config = {
  type: Phaser.CANVAS,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#000000",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: DoorsScene,
};

new Phaser.Game(config);
