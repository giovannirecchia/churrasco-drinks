const STORAGE_KEY = 'churrasco-drinks-v1';

const guests = [
  'Eu',
  'Fe e Umit',
  'Filipi e Isa',
  'Thi e Ju',
  'Gustavo',
  'Shura',
  'Cici',
  'Riley',
  'Aycan',
  'Enis',
  'Dove',
  'Amgad',
  'Larissa',
  'Ana'
];

const drinks = [
  'Beer',
  'Caipirinha',
  'Batida de morango',
  'Jagermeister',
  'Tequila Rose',
  'Aperol Spritz',
  'Breezer Watermelon'
];

const defaultState = {
  selectedGuest: guests[0],
  mode: 'private',
  publicGuestLocked: false,
  unitCost: '',
  roundStep: 0.25,
  counts: Object.fromEntries(guests.map(guest => [guest, Object.fromEntries(drinks.map(drink => [drink, 0]))]))
};

let state = loadState();
let feedbackTimeout = null;

const guestSelect = document.getElementById('guestSelect');
const guestButtons = document.getElementById('guestButtons');
const guestPickerSection = document.getElementById('guestPickerSection');
const drinksSection = document.getElementById('drinksSection');
const drinksGrid = document.getElementById('drinksGrid');
const feedbackMessage = document.getElementById('feedbackMessage');
const activeGuest = document.getElementById('activeGuest');
const activeGuestText = document.getElementById('activeGuestText');
const guestSummary = document.getElementById('guestSummary');
const adminPanel = document.getElementById('adminPanel');
const adminToggle = document.getElementById('adminToggle');
const resetGuestBtn = document.getElementById('resetGuestBtn');
const exportBtn = document.getElementById('exportBtn');
const unitCostInput = document.getElementById('unitCost');
const roundStepSelect = document.getElementById('roundStep');
const totalUnitsEl = document.getElementById('totalUnits');
const roundedUnitCostEl = document.getElementById('roundedUnitCost');
const drinkTotalsEl = document.getElementById('drinkTotals');
const personTotalsEl = document.getElementById('personTotals');
const modeSelect = document.getElementById('modeSelect');
const doneBtn = document.getElementById('doneBtn');
const switchGuestBtn = document.getElementById('switchGuestBtn');
const backToNamesBtn = document.getElementById('backToNamesBtn');

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return structuredClone(defaultState);

    const merged = structuredClone(defaultState);
    merged.selectedGuest = guests.includes(saved.selectedGuest) ? saved.selectedGuest : guests[0];
    merged.mode = saved.mode === 'public' ? 'public' : 'private';
    merged.publicGuestLocked = Boolean(saved.publicGuestLocked);
    merged.unitCost = saved.unitCost ?? '';
    merged.roundStep = Number(saved.roundStep) || 0.25;

    for (const guest of guests) {
      for (const drink of drinks) {
        merged.counts[guest][drink] = Number(saved?.counts?.[guest]?.[drink] || 0);
      }
    }
    return merged;
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function roundUpToStep(value, step) {
  if (!value || value <= 0) return 0;
  return Math.ceil(value / step) * step;
}

function currency(value) {
  return `£${value.toFixed(2)}`;
}

function totalForGuest(guest) {
  return drinks.reduce((sum, drink) => sum + state.counts[guest][drink], 0);
}

function totalForDrink(drink) {
  return guests.reduce((sum, guest) => sum + state.counts[guest][drink], 0);
}

function totalUnits() {
  return guests.reduce((sum, guest) => sum + totalForGuest(guest), 0);
}

function showFeedback(message) {
  feedbackMessage.textContent = message;
  feedbackMessage.classList.remove('hidden');
  clearTimeout(feedbackTimeout);
  feedbackTimeout = setTimeout(() => {
    feedbackMessage.classList.add('hidden');
  }, 1200);
}

function adjustCount(drink, delta) {
  const guest = state.selectedGuest;
  const next = Math.max(0, state.counts[guest][drink] + delta);
  const previous = state.counts[guest][drink];
  state.counts[guest][drink] = next;
  saveState();
  render();

  if (delta > 0 && next > previous) {
    showFeedback(`${drink} registrada para ${guest}`);
    if (state.mode === 'public') {
      state.publicGuestLocked = false;
      saveState();
      setTimeout(() => render(), 450);
    }
  }
}

function resetGuest() {
  const guest = state.selectedGuest;
  const confirmed = confirm(`Zerar todas as bebidas de ${guest}?`);
  if (!confirmed) return;
  for (const drink of drinks) state.counts[guest][drink] = 0;
  saveState();
  render();
}

function selectGuest(guest) {
  state.selectedGuest = guest;
  state.publicGuestLocked = true;
  saveState();
  render();
}

function finishGuestFlow() {
  if (state.mode === 'public') {
    state.publicGuestLocked = false;
    saveState();
    render();
    return;
  }

  showFeedback(`Pronto — você continua lançando para ${state.selectedGuest}`);
}

function renderGuestSelect() {
  guestSelect.innerHTML = guests.map(guest => `<option value="${guest}">${guest}</option>`).join('');
  guestSelect.value = state.selectedGuest;

  guestButtons.innerHTML = guests.map(guest => `<button class="guest-btn" data-guest="${guest}">${guest}</button>`).join('');
  guestButtons.querySelectorAll('[data-guest]').forEach(btn => {
    btn.addEventListener('click', () => selectGuest(btn.dataset.guest));
  });
}

function renderDrinks() {
  const guest = state.selectedGuest;
  activeGuest.textContent = guest;
  activeGuestText.textContent = guest;
  drinksGrid.innerHTML = drinks.map(drink => {
    const count = state.counts[guest][drink];
    return `
      <div class="drink-card">
        <h3>${drink}</h3>
        <div class="counter-row">
          <button class="counter-btn minus" data-drink="${drink}" data-delta="-1">-1</button>
          <div class="counter-value">${count}</div>
          <button class="counter-btn plus" data-drink="${drink}" data-delta="1">+1</button>
        </div>
      </div>
    `;
  }).join('');

  drinksGrid.querySelectorAll('[data-drink]').forEach(btn => {
    btn.addEventListener('click', () => adjustCount(btn.dataset.drink, Number(btn.dataset.delta)));
  });
}

function renderGuestSummary() {
  const guest = state.selectedGuest;
  const total = totalForGuest(guest);
  const rows = drinks
    .filter(drink => state.counts[guest][drink] > 0)
    .map(drink => `<div class="summary-item"><span>${drink}</span><strong>${state.counts[guest][drink]}</strong></div>`);

  guestSummary.innerHTML = rows.length
    ? rows.join('') + `<div class="summary-item"><span>Total</span><strong>${total}</strong></div>`
    : '<div class="summary-item"><span class="sub">Ainda sem consumo registrado.</span><strong>0</strong></div>';
}

function renderAdmin() {
  const rawUnitCost = Number(state.unitCost || 0);
  const rounded = roundUpToStep(rawUnitCost, Number(state.roundStep || 0.25));
  const total = totalUnits();

  totalUnitsEl.textContent = String(total);
  roundedUnitCostEl.textContent = currency(rounded);

  drinkTotalsEl.innerHTML = drinks
    .map(drink => `<div class="summary-item"><span>${drink}</span><strong>${totalForDrink(drink)}</strong></div>`)
    .join('');

  personTotalsEl.innerHTML = guests.map(guest => {
    const units = totalForGuest(guest);
    const amount = rounded * units;
    return `
      <div class="summary-item">
        <div>
          <div>${guest}</div>
          <div class="sub">${units} unidade(s)</div>
        </div>
        <strong>${currency(amount)}</strong>
      </div>
    `;
  }).join('');
}

function buildSummaryText() {
  const rawUnitCost = Number(state.unitCost || 0);
  const rounded = roundUpToStep(rawUnitCost, Number(state.roundStep || 0.25));

  const lines = [
    'Resumo final das bebidas',
    '',
    `Custo por unidade informado: ${currency(rawUnitCost)}`,
    `Custo por unidade arredondado: ${currency(rounded)}`,
    '',
    'Consumo por pessoa:'
  ];

  for (const guest of guests) {
    const units = totalForGuest(guest);
    if (units === 0) continue;
    lines.push(`- ${guest}: ${units} unidade(s) → ${currency(units * rounded)}`);
    for (const drink of drinks) {
      const count = state.counts[guest][drink];
      if (count > 0) lines.push(`  • ${drink}: ${count}`);
    }
  }

  lines.push('', 'Totais por bebida:');
  for (const drink of drinks) {
    lines.push(`- ${drink}: ${totalForDrink(drink)}`);
  }

  lines.push('', `Total geral de unidades: ${totalUnits()}`);
  return lines.join('\n');
}

async function copySummary() {
  const text = buildSummaryText();
  try {
    await navigator.clipboard.writeText(text);
    exportBtn.textContent = 'Copiado!';
    setTimeout(() => { exportBtn.textContent = 'Copiar resumo'; }, 1500);
  } catch {
    alert(text);
  }
}

function renderFlow() {
  const publicMode = state.mode === 'public';
  modeSelect.value = state.mode;

  if (publicMode) {
    guestSelect.parentElement.style.display = 'none';
    guestButtons.style.display = 'grid';
    const showDrinks = state.publicGuestLocked;
    guestPickerSection.classList.toggle('hidden', showDrinks);
    drinksSection.classList.toggle('hidden', !showDrinks);
    doneBtn.style.display = 'inline-flex';
    switchGuestBtn.style.display = 'none';
    backToNamesBtn.classList.toggle('hidden', !showDrinks);
    return;
  }

  guestPickerSection.classList.remove('hidden');
  drinksSection.classList.remove('hidden');
  guestSelect.parentElement.style.display = 'block';
  guestButtons.style.display = 'none';
  doneBtn.style.display = 'inline-flex';
  switchGuestBtn.style.display = 'none';
  backToNamesBtn.classList.add('hidden');
}

function render() {
  renderGuestSelect();
  renderDrinks();
  renderGuestSummary();
  renderAdmin();
  renderFlow();
  unitCostInput.value = state.unitCost;
  roundStepSelect.value = String(state.roundStep);
}

guestSelect.addEventListener('change', (e) => {
  selectGuest(e.target.value);
});

adminToggle.addEventListener('click', () => {
  adminPanel.classList.toggle('hidden');
});

resetGuestBtn.addEventListener('click', resetGuest);
exportBtn.addEventListener('click', copySummary);
doneBtn.addEventListener('click', finishGuestFlow);
switchGuestBtn.addEventListener('click', finishGuestFlow);
backToNamesBtn.addEventListener('click', finishGuestFlow);

modeSelect.addEventListener('change', (e) => {
  state.mode = e.target.value;
  state.publicGuestLocked = false;
  saveState();
  render();
});

unitCostInput.addEventListener('input', (e) => {
  state.unitCost = e.target.value;
  saveState();
  renderAdmin();
});

roundStepSelect.addEventListener('change', (e) => {
  state.roundStep = Number(e.target.value);
  saveState();
  renderAdmin();
});

render();
