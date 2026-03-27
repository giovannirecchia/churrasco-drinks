const guests = window.CHURRASCO_GUESTS;
const drinks = window.CHURRASCO_DRINKS;
let state = window.createDefaultState();
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
const refreshBtn = document.getElementById('refreshBtn');
const doneBtn = document.getElementById('doneBtn');
const guestSummary = document.getElementById('guestSummary');

function showFeedback(message) {
  feedbackMessage.textContent = message;
  feedbackMessage.classList.remove('hidden');
  clearTimeout(feedbackTimeout);
  feedbackTimeout = setTimeout(() => feedbackMessage.classList.add('hidden'), 1200);
}

function selectGuest(guest) {
  selectedGuest = guest;
  render();
}

function goBackToSelection() {
  selectedGuest = null;
  render();
}

async function adjustCount(drink, delta) {
  const guest = selectedGuest;
  if (!guest) return;
  try {
    await window.insertDrinkEvent({ person: guest, drink, delta, source: 'private' });
    await refreshState();
    render();
    if (delta > 0) showFeedback(`${drink} registrada para ${guest}`);
  } catch (error) {
    showFeedback('Erro ao registrar');
    console.error(error);
  }
}

function renderGuestButtons() {
  guestButtons.innerHTML = guests.map((guest) => `
    <button class="guest-btn ${selectedGuest === guest ? 'selected' : ''}" data-guest="${guest}">${guest}</button>
  `).join('');
  guestButtons.querySelectorAll('[data-guest]').forEach((btn) => {
    btn.addEventListener('click', () => selectGuest(btn.dataset.guest));
  });
}

function renderDrinks() {
  const guest = selectedGuest;
  activeGuest.textContent = guest;
  activeGuestText.textContent = guest;
  drinksGrid.innerHTML = drinks.map((drink) => {
    const count = state.counts[guest]?.[drink] || 0;
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
  const guest = selectedGuest;
  const rows = drinks
    .filter((drink) => (state.counts[guest]?.[drink] || 0) > 0)
    .map((drink) => `<div class="summary-item"><span>${drink}</span><strong>${state.counts[guest][drink]}</strong></div>`);
  const total = window.totalForGuest(state, guest);
  guestSummary.innerHTML = rows.length
    ? rows.join('') + `<div class="summary-item"><span>Total</span><strong>${total}</strong></div>`
    : '<div class="summary-item"><span class="sub">Ainda sem consumo registrado.</span><strong>0</strong></div>';
}

function render() {
  guestPickerSection.classList.toggle('hidden', Boolean(selectedGuest));
  drinksSection.classList.toggle('hidden', !selectedGuest);
  renderGuestButtons();
  if (selectedGuest) {
    renderDrinks();
    renderSummary();
  }
}

async function refreshState() {
  const events = await window.fetchDrinkEvents();
  state = window.computeStateFromEvents(events);
}

doneBtn.addEventListener('click', () => showFeedback(`Pronto — você continua lançando para ${selectedGuest}`));
backBtn.addEventListener('click', goBackToSelection);
refreshBtn.addEventListener('click', async () => {
  await refreshState();
  render();
  showFeedback('Dados atualizados');
});

(async function init() {
  await refreshState();
  render();
  window.supabaseClient
    .channel('drink-events-private')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'drink_events' }, async () => {
      await refreshState();
      render();
    })
    .subscribe();
})();
