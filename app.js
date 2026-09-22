// UV regions for a 64x64 Java Edition skin. Each entry is one rectangular
// slot that can be swapped as a whole between the two source skins.
const REGIONS = [
  { part: 'head', label: 'Head', layer: 'base', x: 0, y: 0, w: 32, h: 16 },
  { part: 'head', label: 'Head', layer: 'overlay', x: 32, y: 0, w: 32, h: 16 },

  { part: 'torso', label: 'Torso', layer: 'base', x: 16, y: 16, w: 24, h: 16 },
  { part: 'torso', label: 'Torso', layer: 'overlay', x: 16, y: 32, w: 24, h: 16 },

  { part: 'rightArm', label: 'Right arm', layer: 'base', x: 40, y: 16, w: 16, h: 16 },
  { part: 'rightArm', label: 'Right arm', layer: 'overlay', x: 40, y: 32, w: 16, h: 16 },

  { part: 'leftArm', label: 'Left arm', layer: 'base', x: 32, y: 48, w: 16, h: 16 },
  { part: 'leftArm', label: 'Left arm', layer: 'overlay', x: 48, y: 48, w: 16, h: 16 },

  { part: 'rightLeg', label: 'Right leg', layer: 'base', x: 0, y: 16, w: 16, h: 16 },
  { part: 'rightLeg', label: 'Right leg', layer: 'overlay', x: 0, y: 32, w: 16, h: 16 },

  { part: 'leftLeg', label: 'Left leg', layer: 'base', x: 16, y: 48, w: 16, h: 16 },
  { part: 'leftLeg', label: 'Left leg', layer: 'overlay', x: 0, y: 48, w: 16, h: 16 },
];

const PARTS = ['head', 'torso', 'rightArm', 'leftArm', 'rightLeg', 'leftLeg'];

const SKIN_SIZE = 64;

// part -> layer -> 'A' | 'B'
const state = {};
for (const part of PARTS) {
  state[part] = { base: 'A', overlay: 'A' };
}

const images = { A: null, B: null };

function regionKey(part, layer) {
  return `${part}:${layer}`;
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not decode image'));
    };
    img.src = url;
  });
}

function drawSkinPreview(canvas, img) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, SKIN_SIZE, SKIN_SIZE);
  if (img) ctx.drawImage(img, 0, 0);
}

async function handleFileInput(slot, file, errorEl) {
  errorEl.textContent = '';
  images[slot] = null;
  if (!file) {
    drawSkinPreview(document.getElementById(`preview${slot}`), null);
    renderMerge();
    return;
  }
  try {
    const img = await loadImageFromFile(file);
    if (img.width !== SKIN_SIZE || img.height !== SKIN_SIZE) {
      errorEl.textContent = `Expected a ${SKIN_SIZE}x${SKIN_SIZE} PNG, got ${img.width}x${img.height}.`;
      drawSkinPreview(document.getElementById(`preview${slot}`), null);
      renderMerge();
      return;
    }
    images[slot] = img;
    drawSkinPreview(document.getElementById(`preview${slot}`), img);
  } catch (err) {
    errorEl.textContent = err.message;
  }
  renderMerge();
}

function buildPartsGrid() {
  const grid = document.getElementById('partsGrid');
  grid.innerHTML = '';

  for (const part of PARTS) {
    const label = REGIONS.find((r) => r.part === part).label;

    const nameEl = document.createElement('div');
    nameEl.className = 'part-name';
    nameEl.textContent = label;
    grid.appendChild(nameEl);

    grid.appendChild(buildLayerToggle(part, 'base', 'Base'));
    grid.appendChild(buildLayerToggle(part, 'overlay', 'Overlay'));
  }
}

function buildLayerToggle(part, layer, layerLabel) {
  const wrap = document.createElement('div');
  wrap.className = 'layer-toggle';
  wrap.dataset.key = regionKey(part, layer);

  const sources = layer === 'overlay' ? ['A', 'B', 'None'] : ['A', 'B'];

  for (const source of sources) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = source === 'None' ? 'None' : `${layerLabel} ${source}`;
    btn.dataset.source = source;
    btn.addEventListener('click', () => {
      state[part][layer] = source;
      updateToggleStyles();
      renderMerge();
    });
    wrap.appendChild(btn);
  }
  return wrap;
}

function updateToggleStyles() {
  document.querySelectorAll('.layer-toggle').forEach((wrap) => {
    const [part, layer] = wrap.dataset.key.split(':');
    const active = state[part][layer];
    wrap.querySelectorAll('button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.source === active);
    });
  });
}

function renderMerge() {
  const canvas = document.getElementById('previewOutput');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, SKIN_SIZE, SKIN_SIZE);

  const downloadLink = document.getElementById('downloadLink');

  if (!images.A || !images.B) {
    downloadLink.removeAttribute('href');
    downloadLink.setAttribute('aria-disabled', 'true');
    return;
  }

  ctx.drawImage(images.A, 0, 0);

  for (const region of REGIONS) {
    const source = state[region.part][region.layer];
    if (source === 'A') continue;
    ctx.clearRect(region.x, region.y, region.w, region.h);
    if (source === 'B') {
      ctx.drawImage(
        images.B,
        region.x, region.y, region.w, region.h,
        region.x, region.y, region.w, region.h,
      );
    }
  }

  downloadLink.href = canvas.toDataURL('image/png');
  downloadLink.removeAttribute('aria-disabled');
}

document.getElementById('fileA').addEventListener('change', (e) => {
  handleFileInput('A', e.target.files[0], document.getElementById('errorA'));
});
document.getElementById('fileB').addEventListener('change', (e) => {
  handleFileInput('B', e.target.files[0], document.getElementById('errorB'));
});

document.getElementById('bodyFromB').addEventListener('click', () => {
  for (const part of PARTS) {
    if (part === 'head') continue;
    state[part].base = 'B';
    state[part].overlay = 'B';
  }
  updateToggleStyles();
  renderMerge();
});

buildPartsGrid();
updateToggleStyles();
renderMerge();
