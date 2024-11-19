import { Application, Graphics } from 'pixi.js';
import './style.css';

const g = 9.81;
const MASS_DEFAULT = 0.1; // grams
const MASS_SMALL_DEFAULT = 0.001; // grams

// 1px == 0.1 meters

function acceleration(m1: number, m2: number) {
  return (m2 / (2 * m1 + m2)) * g;
}

(async () => {
  const canvasWrapper = document.querySelector<HTMLDivElement>('#canvas')!;

  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#ffffff', resizeTo: canvasWrapper });
  canvasWrapper.appendChild(app.canvas);

  const CIRCLE_CENTER_X = app.screen.width / 2;
  const CIRCLE_CENTER_Y = app.screen.height / 4;
  const CIRCLE_R = 80;

  const DEFAULT_DRAW_HEIGHT = 240; // px
  const DEFAULT_MAX_HEIGHT = 720; // px

  const RECT_WIDTH = 60; // px
  const RECT_HEIGHT = 80; // px
  const SMALL_RECT_WIDTH = 100; // px
  const SMALL_RECT_HEIGHT = 10; // px

  // Draw circle
  const circle = new Graphics();
  circle.circle(CIRCLE_CENTER_X, CIRCLE_CENTER_Y, CIRCLE_R);

  circle.moveTo(CIRCLE_CENTER_X, CIRCLE_CENTER_Y);
  circle.lineTo(CIRCLE_CENTER_X, CIRCLE_CENTER_Y + CIRCLE_R);

  circle.stroke({ width: 2, color: 0x000000 });
  circle.fill({ color: 0x000000, alpha: 0.2 });

  app.stage.addChild(circle);

  function drawWeight1(graphics: Graphics, dy: number) {
    graphics.clear();
    graphics.moveTo(CIRCLE_CENTER_X - CIRCLE_R, CIRCLE_CENTER_Y);
    graphics.lineTo(
      CIRCLE_CENTER_X - CIRCLE_R,
      CIRCLE_CENTER_Y + DEFAULT_DRAW_HEIGHT - dy
    );
    graphics.stroke({ width: 2, color: 0x000000 });
    graphics.rect(
      CIRCLE_CENTER_X - CIRCLE_R - RECT_WIDTH / 2,
      CIRCLE_CENTER_Y + DEFAULT_DRAW_HEIGHT - dy,
      RECT_WIDTH,
      RECT_HEIGHT
    );
    graphics.stroke({ width: 2, color: 0x000000 });
    graphics.fill({ color: 0x000000, alpha: 0.2 });
  }

  function drawWeight2(graphics: Graphics, dy: number) {
    graphics.clear();
    graphics.moveTo(CIRCLE_CENTER_X + CIRCLE_R, CIRCLE_CENTER_Y);
    graphics.lineTo(
      CIRCLE_CENTER_X + CIRCLE_R,
      CIRCLE_CENTER_Y + DEFAULT_DRAW_HEIGHT + dy
    );
    graphics.stroke({ width: 2, color: 0x000000 });
    graphics.rect(
      CIRCLE_CENTER_X + CIRCLE_R - SMALL_RECT_WIDTH / 2,
      CIRCLE_CENTER_Y + DEFAULT_DRAW_HEIGHT + dy,
      SMALL_RECT_WIDTH,
      SMALL_RECT_HEIGHT
    );
    graphics.stroke({ width: 2, color: 0x000000 });
    graphics.fill({ color: 0xd1304b, alpha: 0.6 });
    graphics.rect(
      CIRCLE_CENTER_X + CIRCLE_R - RECT_WIDTH / 2,
      CIRCLE_CENTER_Y + DEFAULT_DRAW_HEIGHT + SMALL_RECT_HEIGHT + dy,
      RECT_WIDTH,
      RECT_HEIGHT
    );
    graphics.stroke({ width: 2, color: 0x000000 });
    graphics.fill({ color: 0x000000, alpha: 0.2 });
  }

  // Draw weight1
  const weight1 = new Graphics();
  drawWeight1(weight1, 0);
  app.stage.addChild(weight1);

  // Draw weight2
  const weight2 = new Graphics();
  drawWeight2(weight2, 0);
  app.stage.addChild(weight2);

  let simulationRunning = false;

  let mass1 = MASS_DEFAULT;
  let mass2 = MASS_SMALL_DEFAULT;
  let speed = 0;
  let h = 0;
  let acc = acceleration(mass1, mass2);

  const startButton = document.querySelector<HTMLButtonElement>('#start-btn')!;
  startButton.addEventListener('click', () => {
    simulationRunning = !simulationRunning;
  });

  const resetButton = document.querySelector<HTMLButtonElement>('#reset-btn')!;
  resetButton.addEventListener('click', () => {
    simulationRunning = false;

    speed = 0;
    h = 0;
    acc = acceleration(mass1, mass2);

    drawWeight1(weight1, 0);
    drawWeight2(weight2, 0);
  });

  const mass1Span = document.querySelector<HTMLSpanElement>('#mass1')!;
  const mass2Span = document.querySelector<HTMLSpanElement>('#mass2')!;

  const sP = document.querySelector<HTMLSpanElement>('#s')!;

  document
    .querySelector<HTMLInputElement>('#mass1-input')!
    .addEventListener('change', (e) => {
      mass1 = Number((e.target as HTMLInputElement).value) / 100;
      mass1Span.textContent = `${mass1} g`;

      acc = acceleration(mass1, mass2);
    });

  document
    .querySelector<HTMLInputElement>('#mass2-input')!
    .addEventListener('change', (e) => {
      mass2 = Number((e.target as HTMLInputElement).value) / 10000;
      mass2Span.textContent = `${mass2} g`;

      acc = acceleration(mass1, mass2);
    });

  app.ticker.add(({ deltaTime }) => {
    if (simulationRunning) {
      if (weight2.getBounds().maxY > app.screen.height) {
        simulationRunning = false;
      }

      speed += acc * deltaTime;

      const deltaY = speed * deltaTime;
      h += deltaY;
      sP.innerText = h.toFixed(2);

      drawWeight1(weight1, h);
      drawWeight2(weight2, h);
    }
  });

  // Listen for animate update
  // app.ticker.add((time) => {
  //   // Continuously rotate the container!
  //   // * use delta to create frame-independent transform *
  //   container.rotation -= 0.01 * time.deltaTime;
  // });
})();
