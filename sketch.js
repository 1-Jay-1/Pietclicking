let balls = [];
let effects = [];
let bgColor;

const palette = [
  { name: "red",    col: [255, 60, 60] },
  { name: "blue",   col: [60, 120, 255] },
  { name: "orange", col: [255, 150, 50] },
  { name: "yellow", col: [255, 220, 60] },
  { name: "pink",   col: [255, 120, 180] },
  { name: "green",  col: [0, 255, 120] }
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  bgColor = color(20);

  for (let p of palette) {
    balls.push(new Ball(p));
  }
}

function draw() {
  background(bgColor);

  for (let i = effects.length - 1; i >= 0; i--) {
    let e = effects[i];
    e.update();
    e.display();

    if (e.finished) {
      bgColor = color(...e.finalColor);
      effects.splice(i, 1);
    }
  }

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(80);
  text("404", width / 2, height / 2 - 40);
  textSize(20);
  text("Click the colors to explore", width / 2, height / 2 + 30);

  for (let b of balls) {
    b.move();
    b.display();
  }
}

function mousePressed() {
  for (let b of balls) {
    if (b.clicked(mouseX, mouseY)) {
      effects = [];
      effects.push(new Effect(b.data));
      break;
    }
  }
}

// ======== BALL ========
class Ball {
  constructor(data) {
    this.data = data;
    this.x = random(width);
    this.y = random(height);
    this.dx = random(-1.5, 1.5);
    this.dy = random(-1.5, 1.5);
    this.r = 25;
  }

  move() {
    this.x += this.dx;
    this.y += this.dy;

    if (this.x < this.r || this.x > width - this.r) this.dx *= -1;
    if (this.y < this.r || this.y > height - this.r) this.dy *= -1;
  }

  display() {
    noStroke();
    fill(...this.data.col);
    ellipse(this.x, this.y, this.r * 2);
  }

  clicked(mx, my) {
    return dist(mx, my, this.x, this.y) < this.r;
  }
}

// ======== EFFECT ========
class Effect {
  constructor(data) {
    this.name = data.name;
    this.finalColor = data.col;
    this.col = color(...data.col);
    this.t = 0;
    this.finished = false;
    this.hearts = [];
    this.particles = [];
    this.spread = [];
  }

  update() {
    this.t++;
  }

  display() {

    noStroke();

    // 🔵 BLUE
    if (this.name === "blue") {
      fill(this.col);
      beginShape();
      vertex(-50, height);
      for (let x = -50; x <= width + 50; x += 10) {
        let y = height - this.t * 4 + sin(x * 0.02 + this.t * 0.2) * 30;
        vertex(x, y);
      }
      vertex(width + 50, height);
      endShape(CLOSE);
    }

    // 🟡 YELLOW
    else if (this.name === "yellow") {
      let cx = width / 2;
      let cy = height / 2;

      for (let i = 0; i < 6; i++) {
        fill(red(this.col), green(this.col), blue(this.col), 35);
        ellipse(cx, cy, this.t * 18 + i * 45);
      }

      push();
      translate(cx, cy);
      stroke(this.col);
      strokeWeight(3);

      for (let i = 0; i < 24; i++) {
        let angle = (TWO_PI / 24) * i + this.t * 0.05;
        let len = this.t * 7;
        line(0, 0, cos(angle) * len, sin(angle) * len);
      }

      pop();

      noStroke();
      fill(this.col);
      ellipse(cx, cy, this.t * 9);
    }

    // 💗 PINK
    else if (this.name === "pink") {

      if (this.hearts.length === 0) {
        for (let i = 0; i < 650; i++) {
          this.hearts.push({
            x: random(width),
            y: height + random(50, height * 1.2),
            size: random(10, 26),
            speed: random(2.2, 4.8),
            drift: random(-2.5, 2.5),
            maxY: random(-height * 0.2, height * 0.15)
          });
        }
      }

      for (let h of this.hearts) {
        if (h.y > h.maxY) {
          h.y -= h.speed;
        } else {
          h.y = height + random(50, height * 0.8);
          h.x = random(width);
        }

        h.x += h.drift + sin(h.y * 0.01 + this.t * 0.04) * 1.2;
        h.size += 0.4;

        fill(red(this.col), green(this.col), blue(this.col), 220);
        drawHeart(h.x, h.y, h.size);
      }

      let fadeAmt = map(this.t, 0, 170, 0, 255);
      fill(red(this.col), green(this.col), blue(this.col), constrain(fadeAmt, 0, 140));
      rect(0, 0, width, height);

      if (this.t > 255) this.finished = true;
    }

    // 🔴 RED
    else if (this.name === "red") {

      let cx = width / 2;
      let cy = height / 2;

      if (this.particles.length === 0) {
        for (let i = 0; i < 120; i++) {
          let angle = random(TWO_PI);
          let speed = random(2, 6);
          this.particles.push({
            x: cx,
            y: cy,
            dx: cos(angle) * speed,
            dy: sin(angle) * speed,
            life: random(60, 120),
            size: random(4, 10)
          });
        }
      }

      push();
      translate(random(-2, 2), random(-2, 2));

      let pulse = sin(this.t * 0.25) * 25;

      fill(255, 70, 70);
      ellipse(cx, cy, this.t * 10 + pulse);

      noFill();
      stroke(255, 90, 90, 180);
      strokeWeight(3);

      for (let i = 0; i < 5; i++) {
        let r = this.t * 20 - i * 70;
        if (r > 0) ellipse(cx, cy, r);
      }

      noStroke();

      for (let i = 0; i < 6; i++) {
        fill(255, 60, 60, 25);
        ellipse(cx, cy, this.t * 18 + i * 35);
      }

      for (let p of this.particles) {
        if (p.life > 0) {
          p.x += p.dx;
          p.y += p.dy;
          p.life--;

          fill(255, random(80,150), 80, map(p.life, 0, 120, 0, 255));
          ellipse(p.x, p.y, p.size);
        }
      }

      pop();

      if (this.t > 130) this.finished = true;
    }

    // 🟠 ORANGE
    else if (this.name === "orange") {
      fill(this.col);
      let step = 52;
      let sz = this.t * 2.4;

      for (let x = -step; x < width + step; x += step) {
        for (let y = -step; y < height + step; y += step) {
          rect(x, y, sz, sz);
        }
      }
    }

    // 🟢 GREEN (NEW UPGRADED EFFECT)
    else if (this.name === "green") {

      let cx = width / 2;
      let cy = 0;

      if (this.spread.length === 0) {
        for (let i = 0; i < 180; i++) {
          this.spread.push({
            x: cx + random(-30, 30),
            y: cy,
            vx: random(-1.5, 1.5),
            vy: random(1, 4),
            size: random(3, 10),
            life: random(80, 160)
          });
        }
      }

      let wave = this.t * 14;

      noStroke();
      fill(0, 255, 120, 120);
      ellipse(cx, cy, width * 2, wave * 2);

      noFill();
      stroke(0, 255, 120, 180);
      strokeWeight(2);

      for (let i = 0; i < 6; i++) {
        let r = wave - i * 70;
        if (r > 0) ellipse(cx, cy, r * 2);
      }

      for (let p of this.spread) {
        if (p.life > 0) {
          p.x += p.vx + noise(p.y * 0.01, this.t * 0.01) * 2 - 1;
          p.y += p.vy;
          p.life--;

          fill(0, 255, 120, map(p.life, 0, 160, 0, 255));
          ellipse(p.x, p.y, p.size);
        }
      }

      if (this.t > 160) this.finished = true;
    }
  }
}

function drawHeart(x, y, size) {
  beginShape();
  vertex(x, y);
  bezierVertex(x - size/2, y - size/2, x - size, y + size/3, x, y + size);
  bezierVertex(x + size, y + size/3, x + size/2, y - size/2, x, y);
  endShape(CLOSE);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
