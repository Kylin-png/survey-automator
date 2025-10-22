const canvas = document.getElementById('sim');
const ctx = canvas.getContext('2d');

const generationEl = document.getElementById('generation');
const aliveEl = document.getElementById('alive');
const bestDistanceEl = document.getElementById('best-distance');
const lastBestEl = document.getElementById('last-best');
const toggleBtn = document.getElementById('toggle-run');
const resetBtn = document.getElementById('reset');

const POPULATION_SIZE = 30;
const ELITE_RATIO = 0.2;
const MUTATION_RATE = 0.08;
const GRAVITY = 0.12;
const DRAG = 0.0025;
const ANGULAR_DRAG = 0.04;
const THRUST_POWER = 0.22;
const TORQUE_POWER = 0.045;
const MAX_ENEMIES = 6;
const ENEMY_RESPAWN_FRAMES = 140;
const WORLD_HEIGHT = 720;
const WORLD_WIDTH = 1600;

let pixelRatio = window.devicePixelRatio || 1;
let baseScale = 1;

let isRunning = true;
let generation = 1;
let bestEver = 0;
let lastBest = 0;
let frameCount = 0;
let enemies = [];
let planes = [];
let population = null;

const groundHeight = 80;
const ceilingHeight = 60;

function resizeCanvas() {
  const ratio = WORLD_WIDTH / WORLD_HEIGHT;
  const availableWidth = Math.min(window.innerWidth - 360, window.innerWidth - 60);
  const availableHeight = window.innerHeight - 260;
  let width = availableWidth;
  let height = width / ratio;
  if (height > availableHeight) {
    height = availableHeight;
    width = height * ratio;
  }
  const finalWidth = Math.max(480, width);
  const finalHeight = finalWidth / ratio;
  pixelRatio = window.devicePixelRatio || 1;
  baseScale = finalHeight / WORLD_HEIGHT;
  canvas.width = finalWidth * pixelRatio;
  canvas.height = finalHeight * pixelRatio;
  canvas.style.width = `${finalWidth}px`;
  canvas.style.height = `${finalHeight}px`;
  ctx.setTransform(pixelRatio * baseScale, 0, 0, pixelRatio * baseScale, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function randRange(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

class NeuralNetwork {
  constructor(layerSizes) {
    this.layerSizes = layerSizes.slice();
    this.weights = [];
    this.biases = [];

    for (let i = 0; i < layerSizes.length - 1; i++) {
      const inputSize = layerSizes[i];
      const outputSize = layerSizes[i + 1];
      const layerWeights = new Array(outputSize).fill(0).map(() =>
        new Array(inputSize).fill(0).map(() => randRange(-1, 1))
      );
      const layerBiases = new Array(outputSize).fill(0).map(() => randRange(-1, 1));
      this.weights.push(layerWeights);
      this.biases.push(layerBiases);
    }
  }

  static crossover(a, b) {
    const child = a.clone();
    for (let layer = 0; layer < child.weights.length; layer++) {
      for (let o = 0; o < child.weights[layer].length; o++) {
        for (let i = 0; i < child.weights[layer][o].length; i++) {
          if (Math.random() < 0.5) {
            child.weights[layer][o][i] = b.weights[layer][o][i];
          }
        }
        if (Math.random() < 0.5) {
          child.biases[layer][o] = b.biases[layer][o];
        }
      }
    }
    return child;
  }

  clone() {
    const clone = new NeuralNetwork(this.layerSizes);
    for (let layer = 0; layer < this.weights.length; layer++) {
      for (let o = 0; o < this.weights[layer].length; o++) {
        clone.weights[layer][o] = this.weights[layer][o].slice();
      }
      clone.biases[layer] = this.biases[layer].slice();
    }
    return clone;
  }

  mutate(rate = MUTATION_RATE) {
    const mutateValue = (val) => val + randRange(-0.4, 0.4);
    for (let layer = 0; layer < this.weights.length; layer++) {
      for (let o = 0; o < this.weights[layer].length; o++) {
        for (let i = 0; i < this.weights[layer][o].length; i++) {
          if (Math.random() < rate) {
            this.weights[layer][o][i] = mutateValue(this.weights[layer][o][i]);
          }
        }
        if (Math.random() < rate) {
          this.biases[layer][o] = mutateValue(this.biases[layer][o]);
        }
      }
    }
  }

  forward(inputs) {
    let activations = inputs.slice();
    for (let layer = 0; layer < this.weights.length; layer++) {
      const next = new Array(this.weights[layer].length).fill(0);
      for (let o = 0; o < this.weights[layer].length; o++) {
        let sum = this.biases[layer][o];
        for (let i = 0; i < this.weights[layer][o].length; i++) {
          sum += this.weights[layer][o][i] * activations[i];
        }
        next[o] = Math.tanh(sum);
      }
      activations = next;
    }
    return activations;
  }
}

class Genome {
  constructor(brain) {
    this.brain = brain;
    this.fitness = 0;
  }

  clone() {
    return new Genome(this.brain.clone());
  }
}

class Population {
  constructor(size) {
    this.size = size;
    this.genomes = new Array(size).fill(null).map(() =>
      new Genome(new NeuralNetwork([8, 12, 8, 2]))
    );
  }

  evolve() {
    this.genomes.sort((a, b) => b.fitness - a.fitness);
    lastBest = this.genomes[0].fitness;
    bestEver = Math.max(bestEver, lastBest);
    const elitesCount = Math.max(2, Math.floor(this.size * ELITE_RATIO));
    const elites = this.genomes.slice(0, elitesCount);
    const newGenomes = [];

    // Keep the best genome untouched for visualization.
    newGenomes.push(elites[0].clone());

    for (let i = 1; i < elites.length && newGenomes.length < this.size; i++) {
      const eliteVariant = elites[i].clone();
      eliteVariant.brain.mutate(MUTATION_RATE * 0.5);
      newGenomes.push(eliteVariant);
    }

    while (newGenomes.length < this.size) {
      const parentA = this.tournamentPick(elites);
      const parentB = this.tournamentPick(elites);
      const childBrain = NeuralNetwork.crossover(parentA.brain, parentB.brain);
      childBrain.mutate(MUTATION_RATE);
      newGenomes.push(new Genome(childBrain));
    }

    this.genomes = newGenomes;
    generation += 1;
  }

  tournamentPick(elites) {
    const k = 3;
    let best = null;
    for (let i = 0; i < k; i++) {
      const contender = elites[Math.floor(Math.random() * elites.length)];
      if (!best || contender.fitness > best.fitness) {
        best = contender;
      }
    }
    return best;
  }
}

class Plane {
  constructor(genome, color, highlight = false) {
    this.genome = genome;
    this.color = color;
    this.highlight = highlight;
    this.reset();
  }

  reset() {
    this.position = { x: 120, y: WORLD_HEIGHT / 2 };
    this.velocity = { x: 4 + Math.random(), y: randRange(-1, 1) };
    this.angle = randRange(-0.05, 0.05);
    this.angularVelocity = randRange(-0.01, 0.01);
    this.alive = true;
    this.age = 0;
    this.distance = 0;
  }

  get nosePosition() {
    return {
      x: this.position.x + Math.cos(this.angle) * 22,
      y: this.position.y + Math.sin(this.angle) * 22,
    };
  }

  update(delta) {
    if (!this.alive) return;

    const nearestEnemy = this.findNearestEnemy();
    const inputs = this.buildInputs(nearestEnemy);
    const [thrustRaw, pitchRaw] = this.genome.brain.forward(inputs);
    const thrust = (thrustRaw + 1) / 2;
    const torque = pitchRaw;

    const forward = { x: Math.cos(this.angle), y: Math.sin(this.angle) };
    this.velocity.x += forward.x * THRUST_POWER * thrust;
    this.velocity.y += forward.y * THRUST_POWER * thrust;

    this.velocity.x *= 1 - DRAG;
    this.velocity.y *= 1 - DRAG;
    this.angularVelocity *= 1 - ANGULAR_DRAG;

    this.angularVelocity += torque * TORQUE_POWER;
    this.velocity.y += GRAVITY;

    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;
    this.angle += this.angularVelocity * delta;
    this.angle = ((this.angle + Math.PI) % (Math.PI * 2)) - Math.PI;

    this.distance = Math.max(this.distance, this.position.x - 120);
    this.age += delta;

    this.checkBounds();
    this.checkEnemyCollision(nearestEnemy);
  }

  buildInputs(nearestEnemy) {
    const vx = clamp(this.velocity.x / 15, -1, 1);
    const vy = clamp(this.velocity.y / 15, -1, 1);
    const sin = Math.sin(this.angle);
    const cos = Math.cos(this.angle);
    const angVel = clamp(this.angularVelocity / 0.5, -1, 1);
    const altitude = clamp((this.position.y - ceilingHeight) / (WORLD_HEIGHT - ceilingHeight - groundHeight), 0, 1);

    let enemyDX = 1;
    let enemyDY = 0;
    if (nearestEnemy) {
      enemyDX = clamp((nearestEnemy.position.x - this.position.x) / 400, -1, 1);
      enemyDY = clamp((nearestEnemy.position.y - this.position.y) / 400, -1, 1);
    }

    return [vx, vy, sin, cos, angVel, altitude, enemyDX, enemyDY];
  }

  findNearestEnemy() {
    let closest = null;
    let bestDist = Infinity;
    for (const enemy of enemies) {
      const dist = enemy.distanceTo(this.position);
      if (dist < bestDist) {
        bestDist = dist;
        closest = enemy;
      }
    }
    return closest;
  }

  checkBounds() {
    if (this.position.y > WORLD_HEIGHT - groundHeight - 6) {
      this.die();
    }
    if (this.position.y < ceilingHeight) {
      this.die();
    }
    if (this.position.x < -120) {
      this.die();
    }
  }

  checkEnemyCollision(nearestEnemy) {
    const nose = this.nosePosition;
    if (nearestEnemy && nearestEnemy.containsPoint(nose.x, nose.y)) {
      this.die();
    }
    for (const enemy of enemies) {
      if (enemy === nearestEnemy) continue;
      if (enemy.containsPoint(nose.x, nose.y)) {
        this.die();
        break;
      }
    }
  }

  checkPlaneCollision(others) {
    if (!this.alive) return;
    for (const other of others) {
      if (other === this || !other.alive) continue;
      const dx = other.position.x - this.position.x;
      const dy = other.position.y - this.position.y;
      const distanceSq = dx * dx + dy * dy;
      if (distanceSq < 36 * 36) {
        this.die();
        other.die();
      }
    }
  }

  die() {
    if (!this.alive) return;
    this.alive = false;
    this.genome.fitness = Math.max(this.genome.fitness, this.distance);
  }

  draw(ctx, cameraX, isLeader = false) {
    ctx.save();
    ctx.translate(this.position.x - cameraX, this.position.y);
    ctx.rotate(this.angle);
    ctx.beginPath();
    ctx.moveTo(24, 0);
    ctx.lineTo(-18, 12);
    ctx.lineTo(-10, 0);
    ctx.lineTo(-18, -12);
    ctx.closePath();
    const fill = isLeader ? '#ffe08a' : this.highlight ? '#9ff7ff' : this.color;
    const glow = isLeader
      ? 'rgba(255, 224, 138, 0.65)'
      : this.highlight
      ? 'rgba(120, 235, 255, 0.6)'
      : 'rgba(68, 145, 255, 0.35)';
    ctx.fillStyle = fill;
    ctx.shadowColor = glow;
    ctx.shadowBlur = isLeader ? 20 : this.highlight ? 14 : 8;
    ctx.fill();
    ctx.restore();
  }
}

class Enemy {
  constructor() {
    this.reset();
  }

  reset() {
    this.radius = randRange(22, 38);
    this.position = {
      x: WORLD_WIDTH + randRange(120, 360),
      y: randRange(ceilingHeight + 50, WORLD_HEIGHT - groundHeight - 120),
    };
    this.velocity = {
      x: randRange(-4.2, -2.5),
      y: randRange(-0.6, 0.6),
    };
  }

  update(delta) {
    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;

    if (this.position.y < ceilingHeight + 40 || this.position.y > WORLD_HEIGHT - groundHeight - 40) {
      this.velocity.y *= -1;
    }

    if (this.position.x < -this.radius - 200) {
      this.reset();
      this.position.x = WORLD_WIDTH + randRange(200, 600);
    }
  }

  distanceTo(point) {
    const dx = this.position.x - point.x;
    const dy = this.position.y - point.y;
    return Math.hypot(dx, dy);
  }

  containsPoint(x, y) {
    const dx = this.position.x - x;
    const dy = this.position.y - y;
    return dx * dx + dy * dy < this.radius * this.radius;
  }

  draw(ctx, cameraX) {
    ctx.save();
    ctx.translate(this.position.x - cameraX, this.position.y);
    const gradient = ctx.createRadialGradient(0, 0, this.radius * 0.2, 0, 0, this.radius);
    gradient.addColorStop(0, 'rgba(255, 86, 86, 0.9)');
    gradient.addColorStop(1, 'rgba(120, 0, 16, 0.8)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function initPopulation() {
  population = new Population(POPULATION_SIZE);
  buildPlanes();
}

function buildPlanes() {
  planes = population.genomes.map((genome, index) => {
    genome.fitness = 0;
    const hue = 180 + (index * 13) % 140;
    const color = `hsl(${hue}, 85%, 65%)`;
    return new Plane(genome, color, index === 0);
  });
  enemies = [];
  for (let i = 0; i < MAX_ENEMIES; i++) {
    enemies.push(new Enemy());
  }
  frameCount = 0;
  updateHud();
}

function updateHud() {
  generationEl.textContent = generation;
  aliveEl.textContent = planes.filter((p) => p.alive).length;
  bestDistanceEl.textContent = Math.round(bestEver);
  lastBestEl.textContent = Math.round(lastBest);
}

let lastTimestamp = performance.now();

function loop(timestamp) {
  requestAnimationFrame(loop);
  if (!isRunning) {
    lastTimestamp = timestamp;
    return;
  }
  const delta = Math.min((timestamp - lastTimestamp) / 16.666, 2.5);
  lastTimestamp = timestamp;

  frameCount += 1;
  updateSimulation(delta);
  drawScene();
}

function updateSimulation(delta) {
  let aliveCount = 0;
  for (const plane of planes) {
    plane.update(delta);
    plane.checkPlaneCollision(planes);
    if (plane.alive) {
      aliveCount += 1;
      plane.genome.fitness = Math.max(plane.genome.fitness, plane.distance);
      bestEver = Math.max(bestEver, plane.genome.fitness);
    }
  }

  if (frameCount % ENEMY_RESPAWN_FRAMES === 0 && enemies.length < MAX_ENEMIES) {
    enemies.push(new Enemy());
  }
  for (const enemy of enemies) {
    enemy.update(delta);
  }

  const allDead = aliveCount === 0;
  if (allDead) {
    population.evolve();
    bestEver = Math.max(bestEver, population.genomes[0].fitness);
    buildPlanes();
  }

  updateHud();
}

function drawScene() {
  const leader = findLeaderPlane();
  const cameraX = computeCameraX(leader);
  ctx.setTransform(pixelRatio * baseScale, 0, 0, pixelRatio * baseScale, 0, 0);
  ctx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  drawBackground(cameraX);
  drawEnemies(cameraX);
  for (const plane of planes) {
    plane.draw(ctx, cameraX, plane === leader);
  }
  drawGround(cameraX);
  drawOverlays(cameraX, leader);
}

function findLeaderPlane() {
  if (planes.length === 0) return null;
  const alivePlanes = planes.filter((p) => p.alive);
  if (alivePlanes.length > 0) {
    return alivePlanes.reduce((a, b) => (a.position.x > b.position.x ? a : b));
  }
  return planes.reduce((a, b) => (a.distance > b.distance ? a : b));
}

function computeCameraX(leader) {
  if (!leader) return 0;
  return Math.max(leader.position.x - 220, 0);
}

function drawBackground(cameraX) {
  const gradient = ctx.createLinearGradient(0, 0, 0, WORLD_HEIGHT);
  gradient.addColorStop(0, '#0b1d36');
  gradient.addColorStop(0.5, '#163656');
  gradient.addColorStop(1, '#06162a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  const stars = 40;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  for (let i = 0; i < stars; i++) {
    const x = ((cameraX * 0.3 + i * 400) % WORLD_WIDTH + WORLD_WIDTH) % WORLD_WIDTH;
    const y = ((i * 57) % WORLD_HEIGHT) * 0.6 + 60;
    ctx.fillRect(x, y, 2, 2);
  }
}

function drawGround(cameraX) {
  ctx.save();
  ctx.translate(-cameraX, 0);
  ctx.fillStyle = '#0b111c';
  ctx.fillRect(cameraX - WORLD_WIDTH, WORLD_HEIGHT - groundHeight, WORLD_WIDTH * 3, groundHeight);

  ctx.fillStyle = 'rgba(50, 104, 72, 0.7)';
  for (let i = 0; i < 12; i++) {
    const hillX = cameraX + i * 260;
    ctx.beginPath();
    ctx.ellipse(hillX, WORLD_HEIGHT - 50, 180, 40, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawEnemies(cameraX) {
  for (const enemy of enemies) {
    enemy.draw(ctx, cameraX);
  }
}

function drawOverlays(cameraX, leader) {
  ctx.save();
  ctx.translate(-cameraX, 0);
  ctx.strokeStyle = 'rgba(109, 200, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 10]);
  ctx.beginPath();
  ctx.moveTo(cameraX, ceilingHeight);
  ctx.lineTo(cameraX + WORLD_WIDTH, ceilingHeight);
  ctx.moveTo(cameraX, WORLD_HEIGHT - groundHeight);
  ctx.lineTo(cameraX + WORLD_WIDTH, WORLD_HEIGHT - groundHeight);
  ctx.stroke();
  ctx.restore();

  if (leader) {
    const screenX = leader.position.x - cameraX;
    const distance = Math.round(leader.distance);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '16px "Inter", sans-serif';
    ctx.fillText(`Leader: ${distance}m`, clamp(screenX, 40, WORLD_WIDTH - 160), 36);
  }
}

function resetSimulation() {
  generation = 1;
  bestEver = 0;
  lastBest = 0;
  population = new Population(POPULATION_SIZE);
  buildPlanes();
  updateHud();
}

toggleBtn.addEventListener('click', () => {
  isRunning = !isRunning;
  toggleBtn.textContent = isRunning ? 'Pause' : 'Resume';
});

resetBtn.addEventListener('click', () => {
  resetSimulation();
});

initPopulation();
requestAnimationFrame(loop);
