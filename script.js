const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;
const MOVE_SPEED = 220;

function createParticles(scene, color = 0xffffff) {
  const particles = scene.add.particles(0, 0, "particle_dot", {
    x: { min: 0, max: GAME_WIDTH },
    y: { min: 0, max: GAME_HEIGHT },
    lifespan: { min: 4000, max: 8000 },
    speed: { min: 20, max: 60 },
    scale: { start: 0.8, end: 0 },
    alpha: { start: 0.6, end: 0 },
    tint: color,
    blendMode: 'ADD',
    quantity: 1,
    frequency: 100
  });
  return particles;
}

class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
  }

  create() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    // Background
    this.add.rectangle(w / 2, h / 2, w, h, 0x000000);

    // Particles
    this.createCustomTexture(); // Ensure we have a texture for particles
    createParticles(this, 0x4488ff);

    this.add
      .text(w / 2, h * 0.12, "DOORS", {
        fontFamily: "monospace",
        fontSize: "60px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(w / 2, h * 0.22, "Multidimensional Explorer", {
        fontFamily: "monospace",
        fontSize: "24px",
        color: "#5cc8ff",
      })
      .setOrigin(0.5);

    const story =
      "You are a multidimensional explorer.\n" +
      "You must find orbs hidden in various strange dimensions.\n" +
      "Once you have found all the orbs, you can enter the\n" +
      "Golden Door and escape into Outer Space.";
    "Find orbs in strange dimensions to escape.\n" +
      "Once you have all orbs, enter the Golden Door.\n" +
      "But be warned: You cannot stay long.";

    this.add
      .text(w / 2, h * 0.38, story, {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#cccccc",
        align: "center",
        lineSpacing: 10,
      })
      .setOrigin(0.5);

    const warning =
      "WARNING: DIMENSION SHIFTS ARE FATAL\n" +
      "Every time the world shifts, your health drops.\n" +
      "Lingering leads to death. Move quickly!";

    this.add
      .text(w / 2, h * 0.58, warning, {
        fontFamily: "monospace",
        fontSize: "19px",
        color: "#ff3333",
        align: "center",
        fontStyle: "bold",
        lineSpacing: 6,
      })
      .setOrigin(0.5);

    const instructions = "Use WASD or Arrows to move.\nSurvive until you find the orb.";
    this.add
      .text(w / 2, h * 0.75, instructions, {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#ffe98a",
        align: "center",
      })
      .setOrigin(0.5);

    const btn = this.add
      .text(w / 2, h * 0.85, "START GAME", {
        fontFamily: "monospace",
        fontSize: "28px",
        color: "#000000",
        backgroundColor: "#ffffff",
        padding: { left: 20, right: 20, top: 10, bottom: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.scene.start("DoorsScene"))
      .on("pointerover", () => btn.setStyle({ backgroundColor: "#cccccc" }))
      .on("pointerout", () => btn.setStyle({ backgroundColor: "#ffffff" }));
  }

  createCustomTexture() {
    if (this.textures.exists("particle_dot")) return;
    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture("particle_dot", 8, 8);
    g.destroy();
  }
}
class DeathScene extends Phaser.Scene {
  constructor() {
    super("DeathScene");
  }

  create() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    this.add.rectangle(w / 2, h / 2, w, h, 0x000000);

    // Red particles for death
    createParticles(this, 0xff0000);

    this.add
      .text(w / 2, h * 0.4, "YOU DIED", {
        fontFamily: "monospace",
        fontSize: "64px",
        color: "#ff0000",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(w / 2, h * 0.6, "The dimensions consumed you.", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#cccccc",
      })
      .setOrigin(0.5);

    const btn = this.add
      .text(w / 2, h * 0.75, "TRY AGAIN", {
        fontFamily: "monospace",
        fontSize: "32px",
        color: "#000000",
        backgroundColor: "#ffffff",
        padding: { left: 20, right: 20, top: 10, bottom: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.scene.start("DoorsScene"))
      .on("pointerover", () => btn.setStyle({ backgroundColor: "#cccccc" }))
      .on("pointerout", () => btn.setStyle({ backgroundColor: "#ffffff" }));
  }
}

class VictoryScene extends Phaser.Scene {
  constructor() {
    super("VictoryScene");
  }

  create() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    this.add.image(w / 2, h / 2, "bg_space").setDisplaySize(w, h); // Use space background

    // Gold/Green particles for victory
    createParticles(this, 0xffee00);

    this.add
      .text(w / 2, h * 0.3, "VICTORY", {
        fontFamily: "monospace",
        fontSize: "64px",
        color: "#00ff00",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(w / 2, h * 0.45, "You have escaped the loop.", {
        fontFamily: "monospace",
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const btn = this.add
      .text(w / 2, h * 0.65, "PLAY AGAIN", {
        fontFamily: "monospace",
        fontSize: "32px",
        color: "#000000",
        backgroundColor: "#ffffff",
        padding: { left: 20, right: 20, top: 10, bottom: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.scene.start("DoorsScene"))
      .on("pointerover", () => btn.setStyle({ backgroundColor: "#cccccc" }))
      .on("pointerout", () => btn.setStyle({ backgroundColor: "#ffffff" }));
  }
}

class DoorsScene extends Phaser.Scene {
  constructor() {
    super("DoorsScene");

    this.places = [
      { id: "garden", name: "In A Calm Garden", bg: "bg_garden" },
      { id: "office", name: "In a Liminal Office", bg: "bg_office" },
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
      { x: 480, y: 420 },
    ];
  }

  preload() {
    this.load.image("door", "door.png");
    this.load.image("bg_garden", "teletubbie.jpg");
    this.load.image("bg_office", "grey.jpg");
    this.load.image("bg_tron", "tron.jpg");
    this.load.image("bg_underwater", "underwater2.jpg");
    this.load.image("bg_upside", "lights.jpg");
    this.load.image("bg_space", "space-sky-nebula.jpg");
    this.load.image("key", "207.jpg");
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

    this.spotlight = this.make.graphics();
    this.spotlightMask = this.spotlight.createGeometryMask();
    this.background.setMask(this.spotlightMask);

    this.goldenDoor = this.physics.add
      .sprite(480, 170, "gold_door")
      .setDepth(3)
      .setVisible(false)
      .setImmovable(true);
    this.goldenDoor.body.allowGravity = false;

    this.proximityBar = this.add.graphics().setDepth(6);
    this.proximityLabel = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 55, "Proximity Bar", {
        fontFamily: "monospace",
        fontSize: "14px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(6);

    this.keySprite = this.physics.add
      .sprite(100, 100, "key")
      .setDisplaySize(40, 40)
      .setDepth(4)
      .setAlpha(0)
      .setVisible(false);
    this.keySprite.body.allowGravity = false;
    this.keySprite.setMask(this.spotlightMask);

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

    this.timerText = this.add
      .text(GAME_WIDTH - 14, 12, "", {
        fontFamily: "monospace",
        fontSize: "19px",
        color: "#ffffff",
        backgroundColor: "#00000099",
        padding: { left: 8, right: 8, top: 4, bottom: 4 },
      })
      .setOrigin(1, 0)
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

    this.health = 100;
    this.healthBar = this.add.graphics().setDepth(6);
    this.updateHealthBar();

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



    this.enterPlace("garden", true);
  }

  update() {
    if (this.winTriggered) {
      this.player.setVelocity(0, 0);
      return;
    }

    this.handleMovement();

    this.spotlight.clear();
    this.spotlight.fillCircle(this.player.x, this.player.y, 70);

    this.updateKeyVisibilityAndHint();
    if (this.shiftTimer) {
      this.timerText.setText(`Shift: ${this.shiftTimer.getRemainingSeconds().toFixed(1)}s`);
    } else {
      this.timerText.setText("");
    }

    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      if (this.goldenDoor.visible) {
        if (this.isNear(this.goldenDoor, 95)) {
          this.cameras.main.fadeOut(500, 255, 255, 255);
          this.cameras.main.once("camerafadeoutcomplete", () => {
            this.enterPlace("outer_space", false);
            this.cameras.main.fadeIn(500, 255, 255, 255);
          });
        } else {
          this.reduceHealth();
          this.flashEvent("Teleportation penalty! Don't guess.");
        }
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
    let x, y;
    let valid = false;
    const doorX = 480;
    const doorY = 420;
    const minDist = 100;

    while (!valid) {
      x = Phaser.Math.Between(90, GAME_WIDTH - 90);
      y = Phaser.Math.Between(95, GAME_HEIGHT - 120);
      const d = Phaser.Math.Distance.Between(x, y, doorX, doorY);
      if (d > minDist) {
        valid = true;
      }
    }

    return { x, y };
  }

  reduceHealth() {
    this.health = Math.max(0, this.health - 10);
    this.updateHealthBar();
    if (this.health === 0) {
      if (this.shiftTimer) this.shiftTimer.remove();
      this.scene.start("DeathScene");
    }
  }

  updateHealthBar() {
    this.healthBar.clear();
    this.healthBar.fillStyle(0x000000, 0.5);
    this.healthBar.fillRect(14, 52, 200, 20); // Replaces where Place text was

    const p = this.health / 100;
    const color = p > 0.5 ? 0x00ff00 : p > 0.2 ? 0xffff00 : 0xff0000;

    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(14, 52, 200 * p, 20);

    this.healthBar.lineStyle(2, 0xffffff);
    this.healthBar.strokeRect(14, 52, 200, 20);
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

    // Reset shift timer
    if (this.shiftTimer) {
      this.shiftTimer.remove();
      this.shiftTimer = null;
    }

    if (placeId !== "outer_space") {
      this.shiftTimer = this.time.addEvent({
        delay: 7000,
        loop: true,
        callback: () => {
          if (this.winTriggered) return;
          this.reduceHealth();
          this.shiftDimension();
        },
      });
    }


    this.background.setVisible(true); // Ensure background is visible
    this.background.setTexture(place.bg).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    if (placeId === "outer_space") {
      this.background.clearMask();
      this.keySprite.clearMask();
    } else {
      this.background.setMask(this.spotlightMask);
      this.keySprite.setMask(this.spotlightMask);
    }



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

    this.hintText.setText("Explorer explore this strange place . Press E near a door to travel.");
  }

  tryCollectKey() {
    const keyPos = this.keyPoints[this.currentPlaceId];
    if (!keyPos || this.collectedKeys.has(this.currentPlaceId)) return;

    this.collectedKeys.add(this.currentPlaceId);
    this.keySprite.setVisible(false);
    this.updateKeysText();
    this.updateGoldenDoorVisibility();
    this.flashEvent(`Orb found in ${this.placeMap[this.currentPlaceId].name}!`);

    if (this.collectedKeys.size === this.keyPlaceIds.length) {
      this.flashEvent("All orbs found. Locate the Golden Door.");
    } else {
      if (this.shiftTimer) this.shiftTimer.paused = true;
      this.flashEvent("Orb Found! Teleporting...");

      this.time.delayedCall(800, () => {
        this.shiftDimension();
      });
    }
  }

  updateGoldenDoorVisibility() {
    const ready = this.collectedKeys.size === this.keyPlaceIds.length;
    const show = ready && this.currentPlaceId !== "outer_space";
    this.goldenDoor.setVisible(show);

    if (show) {
      this.player.setVisible(false);
      this.background.setVisible(false); // Hide background
    } else {
      this.player.setVisible(true);
      // Background visibility is handled in enterPlace, but if we are toggling back
      // we might need to restore it. However, the game flow seems one-way to win.
      // We will ensure background is correct in enterPlace.
      if (this.currentPlaceId !== "outer_space") {
        this.background.setVisible(true);
      }
    }
  }

  updateKeysText() {
    this.keysText.setText(`Keys: ${this.collectedKeys.size}/${this.keyPlaceIds.length}`);
  }

  updateKeyVisibilityAndHint() {
    if (this.currentPlaceId === "outer_space") {
      this.proximityBar.clear();
      this.proximityLabel.setVisible(false);
      return;
    }
    this.proximityLabel.setVisible(true);

    let targetX, targetY;
    let targetFound = false;

    // Determine target
    if (this.collectedKeys.size === this.keyPlaceIds.length) {
      // Target is Golden Door
      targetX = this.goldenDoor.x;
      targetY = this.goldenDoor.y;
    } else {
      // Target is Key
      const keyPos = this.keyPoints[this.currentPlaceId];
      if (keyPos && !this.collectedKeys.has(this.currentPlaceId)) {
        targetX = keyPos.x;
        targetY = keyPos.y;
      } else {
        targetFound = true; // Key already found
      }
    }

    this.proximityBar.clear();

    if (targetFound) {
      this.hintText.setText("Orb found. Warping...");
      this.hintText.setBackgroundColor("#00000099");
      this.hintText.setColor("#ffffff");
      return;
    }

    // Calculate distance and proximity
    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, targetX, targetY);
    const maxDist = 400;
    // factor 0 = far, 1 = close
    const factor = Phaser.Math.Clamp(1 - distance / maxDist, 0, 1);

    // Color interpolation from Blue to Red
    // Simple logic: < 0.33 Blue, < 0.66 Yellow, else Red
    let color = 0x00ffff; // Cyan/Blue
    if (factor > 0.8) color = 0xff0000;      // Red - Very Close
    else if (factor > 0.6) color = 0xff8c00; // Orange
    else if (factor > 0.4) color = 0xffff00; // Yellow
    else if (factor > 0.2) color = 0xadd8e6; // Light Blue

    // Draw Bar Background
    const barW = 400;
    const barH = 20;
    const barX = (GAME_WIDTH - barW) / 2;
    const barY = GAME_HEIGHT - 40;

    this.proximityBar.fillStyle(0x000000, 0.5);
    this.proximityBar.fillRect(barX, barY, barW, barH);

    // Draw Fill
    this.proximityBar.fillStyle(color, 1);
    this.proximityBar.fillRect(barX, barY, barW * factor, barH);

    // Draw Border
    this.proximityBar.lineStyle(2, 0xffffff);
    this.proximityBar.strokeRect(barX, barY, barW, barH);

    // Alpha logic for key visibility
    if (this.collectedKeys.size !== this.keyPlaceIds.length) {
      const alpha = Phaser.Math.Clamp(1 - distance / 260, 0.02, 1);
      this.keySprite.setAlpha(alpha);
      this.hintText.setText(""); // Clear text hints during search
    } else {
      // Golden Door Phase Hints
      let temp = "Lost in void";
      if (distance < 50) temp = "Press E to Escape!";
      else if (distance < 100) temp = "Touching the unknown";
      else if (distance < 200) temp = "Sensing a presence";
      else if (distance < 350) temp = "Drifting in darkness";

      if (distance < 50) {
        this.hintText.setBackgroundColor("#00ff00");
        this.hintText.setColor("#000000");
        this.hintText.setText("You found the Golden Door! Press E to escape.");
      } else {
        this.hintText.setText(`BLIND RUN: ${temp}. Find the Golden Door.`);
        this.hintText.setBackgroundColor("#00000099");
        this.hintText.setColor("#ffffff");
      }
    }
  }

  shiftDimension() {
    const available = this.keyPlaceIds.filter(
      (id) => !this.collectedKeys.has(id) && id !== this.currentPlaceId
    );

    let nextId;
    if (available.length > 0) {
      nextId = Phaser.Utils.Array.GetRandom(available);
    } else {
      // If all keys collected (or only current left), just pick any other place to keep shifting
      const others = this.keyPlaceIds.filter(id => id !== this.currentPlaceId);
      if (others.length > 0) nextId = Phaser.Utils.Array.GetRandom(others);
      else nextId = this.currentPlaceId; // Should rarely happen if >1 places
    }

    if (nextId) {
      this.flashEvent("Dimension Unstable! Shifting...");
      this.enterPlace(nextId, false);
    }
  }

  isNear(sprite, threshold) {
    const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, sprite.x, sprite.y);
    return d <= threshold;
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
    if (this.shiftTimer) this.shiftTimer.remove();
    this.scene.start("VictoryScene");
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
  type: Phaser.AUTO,
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
  scene: [StartScene, DoorsScene, DeathScene, VictoryScene],
};

new Phaser.Game(config);
