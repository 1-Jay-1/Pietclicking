let rects = [];
let xLines = [];
let yLines = [];

const palette = [
  [220, 50, 50],   // red
  [50, 90, 220],   // blue
  [240, 200, 50]   // yellow
];

let baseX = [];
let baseY = [];

let coloredRects = []; // FIFO queue, each keeps its own color forever

function setup() {
  createCanvas(600, 600);
  initComposition();
}

function draw() {
  background(255);

  animateGrid();

  drawRects();
  drawLines();
}

// =====================
// INIT
// =====================

function initComposition() {
  rects = [];
  coloredRects = [];

  let divisions = int(random(5, 7));

  xLines = [0, width];
  yLines = [0, height];

  baseX = [0, width];
  baseY = [0, height];

  for (let i = 0; i < divisions; i++) {
    let x = random(60, width - 60);
    let y = random(60, height - 60);

    xLines.push(x);
    yLines.push(y);

    baseX.push(x);
    baseY.push(y);
  }

  xLines.sort((a, b) => a - b);
  yLines.sort((a, b) => a - b);
  baseX.sort((a, b) => a - b);
  baseY.sort((a, b) => a - b);

  buildRects();
}

function buildRects() {
  rects = [];

  for (let i = 0; i < xLines.length - 1; i++) {
    for (let j = 0; j < yLines.length - 1; j++) {
      rects.push({ i, j });
    }
  }
}

// =====================
// ANIMATION
// =====================

function animateGrid() {
  for (let i = 1; i < xLines.length - 1; i++) {
    let target = baseX[i];
    xLines[i] = lerp(xLines[i], target + sin(frameCount * 0.01 + i) * 6, 0.08);
  }

  for (let i = 1; i < yLines.length - 1; i++) {
    let target = baseY[i];
    yLines[i] = lerp(yLines[i], target + cos(frameCount * 0.01 + i) * 6, 0.08);
  }
}

// =====================
// CLICK (FIXED: NO COLOR CHANGES EVER)
// =====================

function mousePressed() {
  for (let r of rects) {
    let x = xLines[r.i];
    let y = yLines[r.j];
    let w = xLines[r.i + 1] - xLines[r.i];
    let h = yLines[r.j + 1] - yLines[r.j];

    if (
      mouseX > x && mouseX < x + w &&
      mouseY > y && mouseY < y + h
    ) {

      // remove oldest ONLY if over limit
      if (coloredRects.length >= 3) {
        coloredRects.shift(); // remove oldest
      }

      // prevent duplicate rect selection
      if (coloredRects.some(c => c.r === r)) return;

      // assign a color that is NOT currently used
      let usedColors = coloredRects.map(c => c.color);
      let available = palette.filter(p =>
        !usedColors.some(u =>
          u[0] === p[0] && u[1] === p[1] && u[2] === p[2]
        )
      );

      if (available.length === 0) return;

      let color = random(available);

      // IMPORTANT: color is locked forever for this rect
      coloredRects.push({ r, color });

      break;
    }
  }
}

// =====================
// DRAW
// =====================

function drawRects() {
  noStroke();

  // base grid
  for (let r of rects) {
    let x = xLines[r.i];
    let y = yLines[r.j];
    let w = xLines[r.i + 1] - xLines[r.i];
    let h = yLines[r.j + 1] - yLines[r.j];

    fill(245);
    rect(x, y, w, h);
  }

  // draw colored rectangles (NO CHANGES EVER)
  for (let c of coloredRects) {
    let r = c.r;

    let x = xLines[r.i];
    let y = yLines[r.j];
    let w = xLines[r.i + 1] - xLines[r.i];
    let h = yLines[r.j + 1] - yLines[r.j];

    fill(c.color[0], c.color[1], c.color[2]);
    rect(x, y, w, h);
  }
}

// =====================
// GRID LINES
// =====================

function drawLines() {
  stroke(0);
  strokeWeight(6);

  for (let x of xLines) line(x, 0, x, height);
  for (let y of yLines) line(0, y, width, y);
}