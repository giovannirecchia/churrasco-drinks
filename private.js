const guests = window.CHURRASCO_GUESTS;
const drinks = window.CHURRASCO_DRINKS;
let state = window.loadAppState();
let feedbackTimeout = null;
let selectedGuest = null;

const guestPickerSection = document.getElementById('guestPickerSection');
const drinksSection = document.getElementById('drinksSection');
const guestButtons = document.getElementById('guestButtons');
const activeGuest = document.getElementById('activeGuest');
const activeGuestText = document.getElementById('activeGuestText');
const feedbackMessage = document.getElementById('feedbackMessage');
const drinksGrid = document.getElementById('drinksGrid');
const backBtn = document.getElementById('backBtn');
const doneBtn = document.getElementById('doneBtn');
const guestSummary = document.getElementById('guestSummary');

function save() {
  window.saveAppState(state);
}

function showFeedback(message) {
  feedbackMessage.textContent = message;
  feedbackMessage.classList.remove('hidden');
  clearTimeout(feedbackTimeout);
  feedbackTimeout = setTimeout(() => feedbackMessage.classList.add('hidden'), 1200);
}

function selectGuest(guest) {
  state.selectedGuest = guest;
  selectedGuest = guest;
  save();
  render();
}

function goBackToSelection() {
  selectedGuest = null;
  render();
}

function adjustCount(drink, delta) {
  const guest = state.selectedGuest;
  const next = Math.max(0, state.counts[guest][drink] + delta);
  const previous = state.counts[guest][drink];
  state.counts[guest][drink] = next;
  save();
  render();
  if (delta > 0 && next > previous) showFeedback(`${drink} registrada para ${guest}`);
}

function renderGuestButtons() {
  guestButtons.innerHTML = guests.map((guest) => `
    <button class="guest-btn ${state.selectedGuest === guest ? 'selected' : ''}" data-guest="${guest}">${guest}</button>
  `).join('');
  guestButtons.querySelectorAll('[data-guest]').forEach((btn) => {
    btn.addEventListener('click', () => selectGuest(btn.dataset.guest));
  });
}

function renderDrinks() {
  const guest = selectedGuest || state.selectedGuest;
  activeGuest.textContent = guest;
  activeGuestText.textContent = guest;
  drinksGrid.innerHTML = drinks.map((drink) => {
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
  drinksGrid.querySelectorAll('[data-drink]').forEach((btn) => {
    btn.addEventListener('click', () => adjustCount(btn.dataset.drink, Number(btn.dataset.delta)));
  });
}

function renderSummary() {
  const guest = state.selectedGuest;
  const rows = drinks
    .filter((drink) => state.counts[guest][drink] > 0)
    .map((drink) => `<div class="summary-item"><span>${drink}</span><strong>${state.counts[guest][drink]}</strong></div>`);
  const total = window.totalForGuest(state, guest);
  guestSummary.innerHTML = rows.length
    ? rows.join('') + `<div class="summary-item"><span>Total</span><strong>${total}</strong></div>`
    : '<div class="summary-item"><span class="sub">Ainda sem consumo registrado.</span><strong>0</strong></div>';
}

function ensureValidGuest() {
  if (!guests.includes(state.selectedGuest)) {
    state.selectedGuest = guests[0];
    save();
  }
}

function render() {
  ensureValidGuest();
  const activeSelection = selectedGuest || state.selectedGuest;
  guestPickerSection.classList.toggle('hidden', Boolean(activeSelection && selectedGuest));
  drinksSection.classList.toggle('hidden', !Boolean(activeSelection && selectedGuest));
  renderGuestButtons();
  if (activeSelection && selectedGuest) {
    renderDrinks();
    renderSummary();
  }
}

doneBtn.addEventListener('click', () => showFeedback(`Pronto — você continua lançando para ${state.selectedGuest}`));
backBtn.addEventListener('click', goBackToSelection);

window.addEventListener('storage', () => {
  state = window.loadAppState();
  ensureValidGuest();
  render();
});

render();
