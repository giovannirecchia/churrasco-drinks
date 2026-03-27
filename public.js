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
const drinkButtons = document.getElementById('drinkButtons');
const doneBtn = document.getElementById('doneBtn');

function showFeedback(message) {
  feedbackMessage.textContent = message;
  feedbackMessage.classList.remove('hidden');
  clearTimeout(feedbackTimeout);
  feedbackTimeout = setTimeout(() => feedbackMessage.classList.add('hidden'), 1200);
}

function goHome() {
  selectedGuest = null;
  render();
}

function selectGuest(guest) {
  selectedGuest = guest;
  render();
}

async function registerDrink(drink) {
  if (!selectedGuest) return;
  try {
    await window.insertDrinkEvent({ person: selectedGuest, drink, delta: 1, source: 'public' });
    await refreshState();
    showFeedback(`${drink} registrada para ${selectedGuest}`);
    setTimeout(() => {
      goHome();
    }, 500);
  } catch (error) {
    showFeedback(`Erro ao registrar`);
    console.error(error);
  }
}

function renderGuestButtons() {
  guestButtons.innerHTML = guests.map((guest) => `
    <button class="guest-btn" data-guest="${guest}">${guest}</button>
  `).join('');
  guestButtons.querySelectorAll('[data-guest]').forEach((btn) => {
    btn.addEventListener('click', () => selectGuest(btn.dataset.guest));
  });
}

function renderDrinkButtons() {
  activeGuest.textContent = selectedGuest || '';
  activeGuestText.textContent = selectedGuest || '';
  drinkButtons.innerHTML = drinks.map((drink, index) => `
    <button class="drink-quick-btn ${index === 0 ? 'primary-drink' : ''}" data-drink="${drink}">${drink}</button>
  `).join('');
  drinkButtons.querySelectorAll('[data-drink]').forEach((btn) => {
    btn.addEventListener('click', () => registerDrink(btn.dataset.drink));
  });
}

function render() {
  guestPickerSection.classList.toggle('hidden', Boolean(selectedGuest));
  drinksSection.classList.toggle('hidden', !selectedGuest);
  renderGuestButtons();
  if (selectedGuest) renderDrinkButtons();
}

async function refreshState() {
  const events = await window.fetchDrinkEvents();
  state = window.computeStateFromEvents(events);
}

doneBtn.addEventListener('click', goHome);

(async function init() {
  await refreshState();
  render();
  window.supabaseClient
    .channel('drink-events-public')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'drink_events' }, async () => {
      await refreshState();
      render();
    })
    .subscribe();
})();
