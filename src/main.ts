import Chart from 'chart.js/auto';
import { Application, Graphics } from 'pixi.js';

import './style.css';

const g = 9.81;
const MASS_DEFAULT = 0.1; // grams
const MASS_SMALL_DEFAULT = 0.05; // grams

// 1px == 0.1 meters

function acceleration(m1: number, m2: number) {
  return (m2 / (2 * m1 + m2)) * g;
}

function computeG(m1: number, m2: number, h: number, H: number, t: number) {
  return ((2 * m1 + m2) * H * H) / (2 * m2 * h * t * t);
}

(async () => {
  const canvasWrapper = document.querySelector<HTMLDivElement>('#canvas')!;

  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#ffffff', resizeTo: canvasWrapper });
  canvasWrapper.appendChild(app.canvas);

  const chartCanvas = document.getElementById('chart') as HTMLCanvasElement;

  const chart = new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels: [], // h values (x-axis)
      datasets: [
        {
          label: 'v^2 vs h',
          data: [], // v^2 values (y-axis)
          borderColor: '#646cff',
          backgroundColor: 'rgba(100, 108, 255, 0.2)',
          tension: 0.1, // Smooth curve
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            color: 'white',
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'h (m)',
            color: 'white',
          },
          ticks: { color: 'white' },
        },
        y: {
          title: {
            display: true,
            text: 'v^2 (m^2/s^2)',
            color: 'white',
          },
          ticks: { color: 'white' },
        },
      },
    },
  });

  const CIRCLE_CENTER_X = app.screen.width / 2;
  const CIRCLE_CENTER_Y = app.screen.height / 4;
  const CIRCLE_R = 80;

  const DEFAULT_DRAW_HEIGHT = 240; // px

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
  let H = 0;
  let t = 0;
  let acc = acceleration(mass1, mass2);

  const mass1Span = document.querySelector<HTMLSpanElement>('#mass1')!;
  const mass2Span = document.querySelector<HTMLSpanElement>('#mass2')!;

  const sP = document.querySelector<HTMLSpanElement>('#s')!;
  const newG = document.querySelector<HTMLSpanElement>('#g')!;

  const startButton = document.querySelector<HTMLButtonElement>('#start-btn')!;
  startButton.addEventListener('click', () => {
    simulationRunning = !simulationRunning;
  });

  const resetButton = document.querySelector<HTMLButtonElement>('#reset-btn')!;
  resetButton.addEventListener('click', () => {
    simulationRunning = false;

    speed = 0;
    H = 0;
    h = 0;
    t = 0;
    acc = acceleration(mass1, mass2);

    sP.innerHTML = '0';

    drawWeight1(weight1, 0);
    drawWeight2(weight2, 0);
  });

  document
    .querySelector<HTMLInputElement>('#mass1-input')!
    .addEventListener('change', (e) => {
      mass1 = Number((e.target as HTMLInputElement).value) / 10;
      mass1Span.textContent = `${mass1} g`;

      acc = acceleration(mass1, mass2);
    });

  document
    .querySelector<HTMLInputElement>('#mass2-input')!
    .addEventListener('change', (e) => {
      mass2 = Number((e.target as HTMLInputElement).value) / 100;
      mass2Span.textContent = `${mass2} g`;

      acc = acceleration(mass1, mass2);
    });

  app.ticker.add(({ deltaTime }) => {
    if (simulationRunning) {
      if (weight2.getBounds().maxY > app.screen.height) {
        simulationRunning = false;

        h = speed * speed / (2 * acc);

        newG.innerHTML = `g: ${computeG(mass1, mass2, h, H, t)}`;
      }

      t += deltaTime / app.ticker.FPS;

      speed = acc * t;

      const deltaY = speed * t;
      H = deltaY;
      sP.innerText = H.toFixed(2);

      drawWeight1(weight1, H);
      drawWeight2(weight2, H);

      chart.data.labels?.push(H.toFixed(5)); // Add h to x-axis
      chart.data.datasets[0].data.push((speed * speed).toFixed(2)); // Add v^2 to y-axis
      chart.update();
    }
  });

  // Listen for animate update
  // app.ticker.add((time) => {
  //   // Continuously rotate the container!
  //   // * use delta to create frame-independent transform *
  //   container.rotation -= 0.01 * time.deltaTime;
  // });
})();
