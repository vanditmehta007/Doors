const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;
const MOVE_SPEED = 500;

// --- Mobile Controls ---
class VirtualJoystick {
  constructor(scene, x, y, radius) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.pointer = null;
    this.vector = { x: 0, y: 0 };

    this.base = scene.add.circle(x, y, radius, 0x888888, 0.4).setDepth(100).setScrollFactor(0);
    this.thumb = scene.add.circle(x, y, radius / 2, 0xffffff, 0.7).setDepth(101).setScrollFactor(0);

    this.base.setInteractive();

    // Global input listeners to catch drags that start on base but move out
    scene.input.on('pointerdown', (pointer) => {
      // Check if touch is within roughly 1.5x interaction radius
      if (Phaser.Math.Distance.Between(pointer.x, pointer.y, this.x, this.y) <= this.radius * 2) {
        this.pointer = pointer;
        this.updateThumb(pointer.x, pointer.y);
      }
    });

    scene.input.on('pointermove', (pointer) => {
      if (this.pointer === pointer) {
        this.updateThumb(pointer.x, pointer.y);
      }
    });

    scene.input.on('pointerup', (pointer) => {
      if (this.pointer === pointer) {
        this.pointer = null;
        this.reset();
      }
    });
  }

  updateThumb(x, y) {
    let dx = x - this.x;
    let dy = y - this.y;
    let angle = Math.atan2(dy, dx);
    let dist = Math.min(this.radius, Math.sqrt(dx * dx + dy * dy));

    this.thumb.x = this.x + dist * Math.cos(angle);
    this.thumb.y = this.y + dist * Math.sin(angle);

    // Normalize vector (0 to 1 magnitude)
    let force = dist / this.radius;
    this.vector.x = Math.cos(angle) * force;
    this.vector.y = Math.sin(angle) * force;
  }

  reset() {
    this.thumb.x = this.x;
    this.thumb.y = this.y;
    this.vector = { x: 0, y: 0 };
  }

  getX() { return this.vector.x; }
  getY() { return this.vector.y; }
}

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

class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Loading Bar Graphics
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading',
      style: {
        font: '20px monospace',
        fill: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: '18px monospace',
        fill: '#ffffff'
      }
    });
    percentText.setOrigin(0.5, 0.5);

    const assetText = this.make.text({
      x: width / 2,
      y: height / 2 + 50,
      text: '',
      style: {
        font: '18px monospace',
        fill: '#ffffff'
      }
    });
    assetText.setOrigin(0.5, 0.5);

    this.load.on('progress', function (value) {
      percentText.setText(parseInt(value * 100) + '%');
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('fileprogress', function (file) {
      assetText.setText('Loading assets...');
    });

    this.load.on('complete', function () {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
    });

    // --- Assets from StartScene ---
    this.load.audio("bgm", "bgm.mp3");
    this.load.audio("teleport", "woosh.mp3");
    this.load.image("key", "orb.png");
    this.load.image("story_bg", "18157220.jpg");

    // --- Assets from DoorsScene ---
    this.load.image("gold_door_img", "c30893ec-9cb3-44cd-92b9-9a2d1bea55d5.jpg");
    this.load.image("door", "door.png");
    this.load.image("bg_garden", "teletubbie.jpg");
    this.load.image("bg_office", "grey.jpg");
    this.load.image("bg_tron", "tron.jpg");
    this.load.image("bg_underwater", "underwater2.jpg");
    this.load.image("bg_upside", "lights.jpg");
    this.load.image("bg_space", "space-sky-nebula.jpg");

    // Simulate some load time so the bar is visible
    for (let i = 0; i < 50; i++) {
      this.load.image('asset' + i, 'door.png');
    }
  }

  create() {
    this.scene.start("StartScene");
  }
}

class AboutScene extends Phaser.Scene {
  constructor() {
    super("AboutScene");
  }

  create() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    this.add.rectangle(w / 2, h / 2, w, h, 0x111111);

    this.add
      .text(w / 2, h * 0.15, "ABOUT", {
        fontFamily: "monospace",
        fontSize: "40px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const aboutText =
      "Created for Brackey's Game Jam 2026 .\n\n" +
      "Concept & Development: Vandit Mehta\n" +
      "Visuals: Phaser 3 & Custom GLSL Shaders\n\n" +
      "Navigate through dimensions, survive the shift,\n" +
      "and find the Golden Door to reality.";

    this.add
      .text(w / 2, h * 0.4, aboutText, {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#cccccc",
        align: "center",
        lineSpacing: 10,
      })
      .setOrigin(0.5);

    const backBtn = this.add
      .text(w / 2, h * 0.8, "BACK", {
        fontFamily: "monospace",
        fontSize: "28px",
        color: "#000000",
        backgroundColor: "#ffffff",
        padding: { left: 20, right: 20, top: 10, bottom: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.scene.start("StartScene"))
      .on("pointerover", () => backBtn.setStyle({ backgroundColor: "#cccccc" }))
      .on("pointerout", () => backBtn.setStyle({ backgroundColor: "#ffffff" }));
  }
}

class StoryScene extends Phaser.Scene {
  constructor() {
    super("StoryScene");
  }

  create() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    this.add.rectangle(w / 2, h / 2, w, h, 0x111111);

    // Image on the Left
    this.add.image(w * 0.25, h / 2, 'story_bg').setDisplaySize(w * 0.4, h * 0.6);

    this.add
      .text(w / 2, h * 0.1, "STORY", {
        fontFamily: "monospace",
        fontSize: "40px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const storyText =
      "You are a Multidimensional Explorer.\n" +
      "During a routine jump, your tether snapped.\n" +
      "Now you are trapped in an unstable dimension shift.\n\n" +
      "Every 5 seconds, the dimension around you shifts.\n" +
      "This shift tears at your very existence (Health).\n\n" +
      "Legend speaks of Golden Orbs hidden in these dimensions.\n" +
      "Collect them all to stabilize the Golden Door, your escape.\n" +
      "Only then can you escape back to true Reality.";

    this.add
      .text(w * 0.7, h * 0.5, storyText, {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#ffe98a",
        align: "left",
        lineSpacing: 10,
        wordWrap: { width: w * 0.45 }
      })
      .setOrigin(0.5);

    const backBtn = this.add
      .text(w / 2, h * 0.85, "BACK", {
        fontFamily: "monospace",
        fontSize: "28px",
        color: "#000000",
        backgroundColor: "#ffffff",
        padding: { left: 20, right: 20, top: 10, bottom: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.scene.start("StartScene"))
      .on("pointerover", () => backBtn.setStyle({ backgroundColor: "#cccccc" }))
      .on("pointerout", () => backBtn.setStyle({ backgroundColor: "#ffffff" }));
  }
}

class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
  }

  // preload() removed - handled in BootScene

  create() {
    if (!this.sound.get("bgm")) {
      this.sound.play("bgm", { loop: true, volume: 0.5 });
    } else if (!this.sound.get("bgm").isPlaying) {
      this.sound.get("bgm").play({ loop: true, volume: 0.5 });
    }

    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    // Background
    this.add.rectangle(w / 2, h / 2, w, h, 0x000000);

    // Floating Lines Effect
    const linesGraphics = this.add.graphics();
    this.lines = [];
    for (let i = 0; i < 20; i++) {
      this.lines.push({
        x: Phaser.Math.Between(0, w),
        y: Phaser.Math.Between(0, h),
        length: Phaser.Math.Between(50, 200),
        speed: Phaser.Math.FloatBetween(0.5, 2),
        color: Phaser.Utils.Array.GetRandom([0x5cc8ff, 0x4488ff, 0x00ffff])
      });
    }

    this.events.on('update', () => {
      linesGraphics.clear();
      this.lines.forEach(line => {
        // Move
        line.y -= line.speed;
        if (line.y < -100) {
          line.y = h + 100;
          line.x = Phaser.Math.Between(0, w);
        }

        // Draw
        linesGraphics.lineStyle(2, line.color, 0.3);
        linesGraphics.beginPath();
        linesGraphics.moveTo(line.x, line.y);
        linesGraphics.lineTo(line.x, line.y + line.length);
        linesGraphics.strokePath();
      });
    });

    // Particles
    this.createCustomTexture(); // Ensure we have a texture for particles
    createParticles(this, 0x4488ff);

    this.add
      .text(w / 2, h * 0.12, "Door to Reality", {
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
      "You are trapped in the shift of dimensions , now you must escape to reality before you die.\n" +
      "You must find orbs hidden in various strange dimensions.\n" +
      "Once you have found all the orbs, you can enter the\n" +
      "Golden Door and escape into Reality.";
    "Find orbs in strange dimensions to escape.\n" +
      "Once you have all orbs, enter the Golden Door.\n" +
      "But be warned: You cannot stay long.\n" +
      "";

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
      "Every 5 seconds the dimension shifts, your health drops.\n" +
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

    const instructions = "Use WASD or Arrows or Joystick(Mobile Devices) to move and E for entering the Golden Door.\nSurvive until you find the orb.\nUse the Proximity Bar to navigate";
    const instrText = this.add
      .text(w / 2, h * 0.75, instructions, {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#ffe98a",
        align: "center",
      })
      .setOrigin(0.5);

    // Add Orb Image near instructions
    this.add.image(w / 2 + 350, h * 0.75, "key").setDisplaySize(50, 50);

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

    // About Button
    const aboutBtn = this.add
      .text(w / 2 - 150, h * 0.85, "ABOUT", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ffffff",
        padding: { left: 10, right: 10, top: 5, bottom: 5 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.scene.start("AboutScene"))
      .on("pointerover", () => aboutBtn.setColor("#cccccc"))
      .on("pointerout", () => aboutBtn.setColor("#ffffff"));

    // Story Button
    const storyBtn = this.add
      .text(w / 2 + 150, h * 0.85, "STORY", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ffffff",
        padding: { left: 10, right: 10, top: 5, bottom: 5 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.scene.start("StoryScene"))
      .on("pointerover", () => storyBtn.setColor("#cccccc"))
      .on("pointerout", () => storyBtn.setColor("#ffffff"));
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

  init(data) {
    this.survivedTime = data.time || 0;
  }

  create() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    // Liquid Ether Shader Code
    const fragShader = `
precision mediump float;

uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;

// Simplex Noise (2D)
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main( void ) {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= resolution.x / resolution.y;

    // Interact
    vec2 m = mouse * 2.0 - 1.0;
    m.x *= resolution.x / resolution.y;
    float d = length(p - m);
    // Mouse force (repulsion)
    p -= (m - p) * 0.15 * smoothstep(0.4, 0.0, d);

    float t = time * 0.2; // Speed

    // Liquid "Ether" Domain Warping
    float n1 = snoise(p * 2.5 + t);
    float n2 = snoise(p * 4.0 - t * 1.5 + n1);

    // Color Mixing
    // #ffffffff (White)
    vec3 c1 = vec3(1.0, 1.0, 1.0);
    // #240000ff (Dark Red)
    vec3 c2 = vec3(0.141, 0.0, 0.0);
    // #09021eff (Deep Blue)
    vec3 c3 = vec3(0.035, 0.008, 0.118);
    
    // Mix based on noise
    vec3 col = mix(c1, c2, smoothstep(-1.0, 1.0, n1));
    col = mix(col, c3, smoothstep(-0.5, 0.5, n2));

    // Highlights
    float highlight = smoothstep(0.6, 0.8, n2);
    col += highlight * 0.2;

    // Post processing - subtle vignette
    float vig = 1.0 - length(uv - 0.5) * 0.5;
    col *= vig;

    gl_FragColor = vec4(col, 1.0);
}
    `;

    // Create shader object
    const baseShader = new Phaser.Display.BaseShader('LiquidEther', fragShader);
    this.shaderInfo = this.add.shader(baseShader, w / 2, h / 2, w, h);

    this.shaderInfo.setPointer(this.input.activePointer);

    // Red particles for death (layered on top)
    createParticles(this, 0xff0000);

    this.add
      .text(w / 2, h * 0.4, "YOU DIED..", {
        fontFamily: "monospace",
        fontSize: "64px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: '#000000',
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(w / 2, h * 0.6, `The dimensions consumed you.\nSurvived: ${this.survivedTime.toFixed(2)}s`, {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ffffff",
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center'
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

    // About Button
    const aboutBtn = this.add
      .text(w / 2 - 150, h * 0.75, "ABOUT", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ffffff",
        padding: { left: 10, right: 10, top: 5, bottom: 5 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.scene.start("AboutScene"))
      .on("pointerover", () => aboutBtn.setColor("#cccccc"))
      .on("pointerout", () => aboutBtn.setColor("#ffffff"));

    // Story Button
    const storyBtn = this.add
      .text(w / 2 + 150, h * 0.75, "STORY", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ffffff",
        padding: { left: 10, right: 10, top: 5, bottom: 5 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.scene.start("StoryScene"))
      .on("pointerover", () => storyBtn.setColor("#cccccc"))
      .on("pointerout", () => storyBtn.setColor("#ffffff"));
  }
}

class VictoryScene extends Phaser.Scene {
  constructor() {
    super("VictoryScene");
  }

  init(data) {
    this.completionTime = data.time || 0;
  }

  create() {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;

    // Background Image for Carousel
    this.carouselImages = ["bg_garden", "bg_office", "bg_tron", "bg_underwater", "bg_upside", "bg_space"];
    this.currentIndex = 0;

    this.bg1 = this.add.image(w / 2, h / 2, this.carouselImages[0]).setDisplaySize(w, h).setAlpha(1);
    this.bg2 = this.add.image(w / 2, h / 2, this.carouselImages[1]).setDisplaySize(w, h).setAlpha(0);

    // Carousel Logic
    this.time.addEvent({
      delay: 2500,
      loop: true,
      callback: () => {
        this.currentIndex = (this.currentIndex + 1) % this.carouselImages.length;
        const nextImage = this.carouselImages[this.currentIndex];

        // Swap
        this.bg2.setTexture(nextImage).setDisplaySize(w, h).setAlpha(0);

        // Tween Crossfade
        this.tweens.add({
          targets: this.bg2,
          alpha: 1,
          duration: 1000,
          onComplete: () => {
            // Once faded in, set bg1 to this image and reset bg2
            this.bg1.setTexture(nextImage).setDisplaySize(w, h);
            this.bg2.setAlpha(0);
          }
        });
      }
    });

    // Dark Overlay for readability
    this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.4);

    // Gold/Green particles for victory (layered on top)
    createParticles(this, 0xffee00);

    this.add
      .text(w / 2, h * 0.3, "VICTORY", {
        fontFamily: "monospace",
        fontSize: "64px",
        color: "#00ff00",
        fontStyle: "bold",
        stroke: '#000000',
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(w / 2, h * 0.45, `You have escaped into the Reality.\nTime: ${this.completionTime.toFixed(2)}s`, {
        fontFamily: "monospace",
        fontSize: "24px",
        color: "#ffffff",
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center'
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

    // About Button
    const aboutBtn = this.add
      .text(w / 2 - 150, h * 0.65, "ABOUT", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ffffff",
        padding: { left: 10, right: 10, top: 5, bottom: 5 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.scene.start("AboutScene"))
      .on("pointerover", () => aboutBtn.setColor("#cccccc"))
      .on("pointerout", () => aboutBtn.setColor("#ffffff"));

    // Story Button
    const storyBtn = this.add
      .text(w / 2 + 150, h * 0.65, "STORY", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ffffff",
        padding: { left: 10, right: 10, top: 5, bottom: 5 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.scene.start("StoryScene"))
      .on("pointerover", () => storyBtn.setColor("#cccccc"))
      .on("pointerout", () => storyBtn.setColor("#ffffff"));
  }
}

class DoorsScene extends Phaser.Scene {
  constructor() {
    super("DoorsScene");

    this.places = [
      { id: "garden", name: "In A Calm Garden", bg: "bg_garden" },
      { id: "office", name: "In a Liminal Office", bg: "bg_office" },
      { id: "tron", name: "Tron", bg: "bg_tron" },
      { id: "underwater", name: "Underwater Castle", bg: "bg_underwater" },
      { id: "upside_down", name: "Upside Down World", bg: "bg_upside" },
      { id: "outer_space", name: "Matrix", bg: "bg_space" },
    ];

    this.keyPlaceIds = this.places
      .filter((p) => p.id !== "outer_space")
      .map((p) => p.id);

    this.placeMap = {};
    this.places.forEach((p) => {
      this.placeMap[p.id] = p;
    });

    this.doorPositions = [
      { x: GAME_WIDTH / 2, y: GAME_HEIGHT * 0.8 },
    ];
  }

  // preload() removed - handled in BootScene

  create() {
    this.startTime = this.time.now;
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

    // Create Soft Spotlight Mask (BitmapMask)
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = 400;
    maskCanvas.height = 400;
    const ctx = maskCanvas.getContext('2d');
    const grd = ctx.createRadialGradient(200, 200, 80, 200, 200, 200);
    grd.addColorStop(0, 'rgba(255, 255, 255, 1)');       // Inner visible
    grd.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');   // "Blur" / outer foggy circle
    grd.addColorStop(1, 'rgba(255, 255, 255, 0)');       // Fade to black
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 400, 400);

    if (!this.textures.exists('soft_mask')) {
      this.textures.addCanvas('soft_mask', maskCanvas);
    }

    this.lightSprite = this.add.image(0, 0, 'soft_mask').setVisible(false);
    this.spotlightMask = new Phaser.Display.Masks.BitmapMask(this, this.lightSprite);

    this.background.setMask(this.spotlightMask);

    this.goldenDoor = this.physics.add
      .sprite(GAME_WIDTH / 2, GAME_HEIGHT * 0.3, "gold_door_img")
      .setDisplaySize(400, 200)
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

    // Glow/Shine Effect behind the Orb
    this.keyShine = this.add.sprite(0, 0, "shine_glow")
      .setDisplaySize(120, 120)
      .setTint(0xffff00)
      .setAlpha(0.4)
      .setDepth(3)
      .setVisible(false);

    this.keyShine.setMask(this.spotlightMask);

    this.tweens.add({
      targets: this.keyShine,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0.1,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.keySprite = this.physics.add
      .sprite(100, 100, "key")
      .setDisplaySize(60, 60)
      .setDepth(4)
      .setAlpha(0)
      .setVisible(false);
    this.keySprite.body.allowGravity = false;
    this.keySprite.setMask(this.spotlightMask);

    this.player = this.physics.add
      .sprite(GAME_WIDTH / 2, GAME_HEIGHT * 0.55, "player")
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

    // Mobile Controls
    // Show on mobile or if check fails (fallback)
    const isMobile = !this.sys.game.device.os.desktop || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Uncomment the line below to test on Desktop (always show controls)
    // const isMobile = true; 

    if (isMobile) {
      this.input.addPointer(2); // Multi-touch support

      // Joystick Left
      this.joystick = new VirtualJoystick(this, 100, GAME_HEIGHT - 80, 50);

      // Action Button Right
      this.actionButton = this.add.circle(GAME_WIDTH - 100, GAME_HEIGHT - 80, 40, 0x888888, 0.4)
        .setDepth(100).setScrollFactor(0).setInteractive();
      this.add.text(GAME_WIDTH - 100, GAME_HEIGHT - 80, "E", { fontSize: '24px', fontStyle: 'bold' }).setOrigin(0.5).setDepth(101).setScrollFactor(0);

      this.actionButton.on('pointerdown', () => {
        this.actionButton.setFillStyle(0xaaaaaa, 0.8);
        this.attemptInteraction();
      });
      this.actionButton.on('pointerup', () => {
        this.actionButton.setFillStyle(0x888888, 0.4);
      });
      this.actionButton.on('pointerout', () => {
        this.actionButton.setFillStyle(0x888888, 0.4);
      });
    }
  }

  update() {
    if (this.winTriggered) {
      this.player.setVelocity(0, 0);
      return;
    }

    this.handleMovement();

    this.lightSprite.setPosition(this.player.x, this.player.y);

    this.updateKeyVisibilityAndHint();
    if (this.shiftTimer) {
      this.timerText.setText(`Shift: ${this.shiftTimer.getRemainingSeconds().toFixed(1)}s`);
    } else {
      this.timerText.setText("");
    }

    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.attemptInteraction();
    }
  }

  attemptInteraction() {
    if (this.goldenDoor.visible) {
      if (this.isNear(this.goldenDoor, 95)) {
        this.cameras.main.fadeOut(500, 255, 255, 255);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.enterPlace("outer_space", false);
          this.cameras.main.fadeIn(500, 255, 255, 255);
        });
      } else {
        this.reduceHealth();
        this.flashEvent("Teleportation penalty - Health Reduced ! Be absolutely sure.");
      }
    }
  }

  handleMovement() {
    let vx = 0;
    let vy = 0;

    // Keyboard Input
    if (this.cursors.left.isDown || this.wasd.A.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vx += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) vy += 1;

    // Joystick Input
    if (this.joystick) {
      vx += this.joystick.getX();
      vy += this.joystick.getY();
    }

    // Physics
    // If using joystick, vx/vy are already fractional vectors.
    // If mixing keys, weclamp or normalize.

    // Check if there is movement
    if (vx !== 0 || vy !== 0) {
      // If purely keyboard, simple normalize.
      // If joystick is involved, we might exceed speed=1 if both used, or just trust the clamp.

      // Calculate magnitude
      const mag = Math.sqrt(vx * vx + vy * vy);

      // If magnitude > 1 (e.g. diagonal keys or mixed input), normalize it to 1 max
      // However, we want to apply MOVE_SPEED.

      // If using joystick, we often want variable speed (slow push = slow walk).
      // Key presses give full speed (mag >= 1).

      // Strategy: Normalize direction, then apply Min(1, mag) * SPEED
      if (mag > 0.1) { // Deadzone
        const dirX = vx / mag;
        const dirY = vy / mag;
        const intensity = Math.min(1, mag);

        vx = dirX * intensity * MOVE_SPEED;
        vy = dirY * intensity * MOVE_SPEED;
      } else {
        vx = 0;
        vy = 0;
      }
    }

    this.player.setVelocity(vx, vy);
  }



  randomPlayablePosition() {
    let x, y;
    let valid = false;
    const doorX = GAME_WIDTH / 2;
    const doorY = GAME_HEIGHT * 0.8;
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
    this.health = Math.max(0, this.health - 20);
    this.updateHealthBar();
    if (this.health === 0) {
      if (this.shiftTimer) this.shiftTimer.remove();
      const elapsed = (this.time.now - this.startTime) / 1000;
      this.scene.start("DeathScene", { time: elapsed });
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
    this.sound.play("teleport", { volume: 0.5 });
    this.currentPlaceId = placeId;
    const place = this.placeMap[placeId];

    // Reset shift timer
    if (this.shiftTimer) {
      this.shiftTimer.remove();
      this.shiftTimer = null;
    }

    if (placeId !== "outer_space") {
      this.shiftTimer = this.time.addEvent({
        delay: 5000,
        loop: true,
        callback: () => {
          if (this.winTriggered) return;
          if (!this.collectedKeys.has(this.currentPlaceId)) {
            this.reduceHealth();
          }
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
      this.player.setPosition(GAME_WIDTH / 2, GAME_HEIGHT * 0.55);
    } else {
      this.player.setPosition(GAME_WIDTH / 2, GAME_HEIGHT * 0.88);
    }

    const keyPos = this.keyPoints[placeId];
    if (keyPos && !this.collectedKeys.has(placeId)) {
      this.keySprite.setPosition(keyPos.x, keyPos.y).setVisible(true).setAlpha(0.01);
      this.keyShine.setPosition(keyPos.x, keyPos.y).setVisible(true);
    } else {
      this.keySprite.setVisible(false);
      this.keyShine.setVisible(false);
    }

    this.updateGoldenDoorVisibility();
    this.updateKeysText();

    if (placeId === "outer_space") {
      this.triggerWin();
      return;
    }

    this.hintText.setText("Explorer, explore this strange place . Find the orb before shift");
  }

  tryCollectKey() {
    const keyPos = this.keyPoints[this.currentPlaceId];
    if (!keyPos || this.collectedKeys.has(this.currentPlaceId)) return;

    this.collectedKeys.add(this.currentPlaceId);
    this.keySprite.setVisible(false);
    this.keyShine.setVisible(false);
    this.updateKeysText();
    this.updateGoldenDoorVisibility();
    this.flashEvent(`Orb found in ${this.placeMap[this.currentPlaceId].name}!`);

    if (this.collectedKeys.size === this.keyPlaceIds.length) {
      this.flashEvent("All orbs found. Navigate to the Golden Door.");
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
      this.hintText.setText("Orb found. Shifting to next dimension...");
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
      this.keyShine.setAlpha(alpha * 0.5); // Shine fades with key
      this.hintText.setText(""); // Clear text hints during search
    } else {
      // Golden Door Phase Hints
      let temp = "Lost in void";
      if (distance < 50) temp = "Press E to Escape!";
      else if (distance < 100) temp = "Almost there , just a bit more!";
      else if (distance < 200) temp = "Just near , find it fast !";
      else if (distance < 350) temp = "You are drifting away!";

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
    const elapsed = (this.time.now - this.startTime) / 1000;
    this.scene.start("VictoryScene", { time: elapsed });
  }

  createGeneratedTextures() {
    const g = this.add.graphics();

    // Shine Glow Texture
    if (!this.textures.exists("shine_glow")) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      const grd = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grd.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grd.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 64, 64);
      this.textures.addCanvas('shine_glow', canvas);
    }

    g.clear();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(16, 16, 14);
    g.fillStyle(0x00008b, 1);
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
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  scene: [BootScene, StartScene, AboutScene, StoryScene, DoorsScene, DeathScene, VictoryScene],
};

// Ensure mobile viewport is correct
if (!document.querySelector("meta[name='viewport']")) {
  const meta = document.createElement("meta");
  meta.name = "viewport";
  meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
  document.head.appendChild(meta);
}

new Phaser.Game(config);

// --- Mobile Orientation Handling ---
const overlay = document.createElement("div");
overlay.style.position = "fixed";
overlay.style.top = "0";
overlay.style.left = "0";
overlay.style.width = "100%";
overlay.style.height = "100%";
overlay.style.backgroundColor = "black";
overlay.style.color = "white";
overlay.style.display = "none";
overlay.style.zIndex = "9999";
overlay.style.flexDirection = "column";
overlay.style.justifyContent = "center";
overlay.style.alignItems = "center";
overlay.style.textAlign = "center";
overlay.innerHTML = "<h1>Please Rotate Your Device</h1><p>Landscape orientation required.</p>";
document.body.appendChild(overlay);

function checkOrientation() {
  const isPortrait = window.innerHeight > window.innerWidth;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile && isPortrait) {
    overlay.style.display = "flex";
    if (window.game) window.game.paused = true;
  } else {
    overlay.style.display = "none";
    if (window.game) window.game.paused = false;


    // Globals are fixed for FIT mode
  }
}

window.addEventListener("resize", checkOrientation);
window.addEventListener("orientationchange", () => {
  setTimeout(checkOrientation, 500); // Wait for resize to settle
  // Optional: Reload to fix layout artifacts if needed
  // window.location.reload(); 
});

checkOrientation();
