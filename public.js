const guests = window.CHURRASCO_GUESTS;
const drinks = window.CHURRASCO_DRINKS;
let state = window.loadAppState();
let feedbackTimeout = null;

const guestPickerSection = document.getElementById('guestPickerSection');
const drinksSection = document.getElementById('drinksSection');
const guestButtons = document.getElementById('guestButtons');
const activeGuest = document.getElementById('activeGuest');
const activeGuestText = document.getElementById('activeGuestText');
const feedbackMessage = document.getElementById('feedbackMessage');
const drinkButtons = document.getElementById('drinkButtons');
const doneBtn = document.getElementById('doneBtn');

let selectedGuest = null;

function save() {
  window.saveAppState(state);
}

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

function registerDrink(drink) {
  if (!selectedGuest) return;
  state.counts[selectedGuest][drink] += 1;
  save();
  showFeedback(`${drink} registrada para ${selectedGuest}`);
  setTimeout(() => {
    goHome();
  }, 500);
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
  state = window.loadAppState();
  guestPickerSection.classList.toggle('hidden', Boolean(selectedGuest));
  drinksSection.classList.toggle('hidden', !selectedGuest);
  renderGuestButtons();
  if (selectedGuest) renderDrinkButtons();
}

doneBtn.addEventListener('click', goHome);
window.addEventListener('storage', () => {
  state = window.loadAppState();
});

render();
