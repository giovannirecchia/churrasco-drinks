const guests = window.CHURRASCO_GUESTS;
const drinks = window.CHURRASCO_DRINKS;
let state = window.createDefaultState();
let events = [];

const refreshBtn = document.getElementById('refreshBtn');
const exportBtn = document.getElementById('exportBtn');
const drinkTotalsEl = document.getElementById('drinkTotals');
const personTotalsEl = document.getElementById('personTotals');

function buildSummaryText() {
  const lines = ['Resumo final das bebidas', '', 'Consumo por pessoa:'];

  for (const guest of guests) {
    const units = window.totalForGuest(state, guest);
    if (units === 0) continue;
    lines.push(`- ${guest}: ${units} unidade(s)`);
    for (const drink of drinks) {
      const count = state.counts[guest][drink];
      if (count > 0) lines.push(`  • ${drink}: ${count}`);
    }
  }

  lines.push('', 'Totais por bebida:');
  for (const drink of drinks) lines.push(`- ${drink}: ${window.totalForDrink(state, drink)}`);
  lines.push('', `Total geral de unidades: ${window.totalUnits(state)}`);
  lines.push('', 'Últimos lançamentos:');
  for (const event of events.slice(-20)) {
    const time = new Date(event.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    lines.push(`- ${time} | ${event.person} | ${event.drink} | ${event.delta > 0 ? '+1' : '-1'} | ${event.source}`);
  }
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

function render() {
  drinkTotalsEl.innerHTML = drinks
    .map((drink) => `<div class="summary-item"><span>${drink}</span><strong>${window.totalForDrink(state, drink)}</strong></div>`)
    .join('');

  personTotalsEl.innerHTML = guests.map((guest) => {
    const units = window.totalForGuest(state, guest);
    return `
      <div class="summary-item">
        <div>
          <div>${guest}</div>
          <div class="sub">${units} unidade(s)</div>
        </div>
        <strong>${units}</strong>
      </div>
    `;
  }).join('');
}

async function refreshState() {
  events = await window.fetchDrinkEvents();
  state = window.computeStateFromEvents(events);
}

refreshBtn.addEventListener('click', async () => {
  await refreshState();
  render();
});
exportBtn.addEventListener('click', copySummary);

(async function init() {
  await refreshState();
  render();
  window.supabaseClient
    .channel('drink-events-admin')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'drink_events' }, async () => {
      await refreshState();
      render();
    })
    .subscribe();
})();
