window.CHURRASCO_GUESTS = [
  'Giovanni',
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
  'Ana',
  'Naessa'
];

window.CHURRASCO_DRINKS = [
  'Beer',
  'Caipirinha',
  'Batida de morango',
  'Jagermeister',
  'Tequila Rose',
  'Aperol Spritz',
  'Breezer Watermelon'
];

window.STORAGE_KEY = 'churrasco-drinks-v2';

window.createDefaultState = function createDefaultState() {
  const guests = window.CHURRASCO_GUESTS;
  const drinks = window.CHURRASCO_DRINKS;
  return {
    selectedGuest: guests[0],
    unitCost: '',
    roundStep: 0.25,
    counts: Object.fromEntries(
      guests.map((guest) => [guest, Object.fromEntries(drinks.map((drink) => [drink, 0]))])
    )
  };
};

window.loadAppState = function loadAppState() {
  const fallback = window.createDefaultState();
  try {
    const saved = JSON.parse(localStorage.getItem(window.STORAGE_KEY));
    if (!saved) return fallback;
    const merged = window.createDefaultState();
    merged.selectedGuest = window.CHURRASCO_GUESTS.includes(saved.selectedGuest)
      ? saved.selectedGuest
      : window.CHURRASCO_GUESTS[0];
    merged.unitCost = saved.unitCost ?? '';
    merged.roundStep = Number(saved.roundStep) || 0.25;
    for (const guest of window.CHURRASCO_GUESTS) {
      for (const drink of window.CHURRASCO_DRINKS) {
        merged.counts[guest][drink] = Number(saved?.counts?.[guest]?.[drink] || 0);
      }
    }
    return merged;
  } catch {
    return fallback;
  }
};

window.saveAppState = function saveAppState(state) {
  localStorage.setItem(window.STORAGE_KEY, JSON.stringify(state));
};

window.roundUpToStep = function roundUpToStep(value, step) {
  if (!value || value <= 0) return 0;
  return Math.ceil(value / step) * step;
};

window.currency = function currency(value) {
  return `£${Number(value || 0).toFixed(2)}`;
};

window.totalForGuest = function totalForGuest(state, guest) {
  return window.CHURRASCO_DRINKS.reduce((sum, drink) => sum + state.counts[guest][drink], 0);
};

window.totalForDrink = function totalForDrink(state, drink) {
  return window.CHURRASCO_GUESTS.reduce((sum, guest) => sum + state.counts[guest][drink], 0);
};

window.totalUnits = function totalUnits(state) {
  return window.CHURRASCO_GUESTS.reduce((sum, guest) => sum + window.totalForGuest(state, guest), 0);
};
