const guests = window.CHURRASCO_GUESTS;
const drinks = window.CHURRASCO_DRINKS;
let state = window.loadAppState();

const exportBtn = document.getElementById('exportBtn');
const unitCostInput = document.getElementById('unitCost');
const roundStepSelect = document.getElementById('roundStep');
const totalUnitsEl = document.getElementById('totalUnits');
const roundedUnitCostEl = document.getElementById('roundedUnitCost');
const drinkTotalsEl = document.getElementById('drinkTotals');
const personTotalsEl = document.getElementById('personTotals');

function save() {
  window.saveAppState(state);
}

function buildSummaryText() {
  const rawUnitCost = Number(state.unitCost || 0);
  const rounded = window.roundUpToStep(rawUnitCost, Number(state.roundStep || 0.25));
  const lines = [
    'Resumo final das bebidas',
    '',
    `Custo por unidade informado: ${window.currency(rawUnitCost)}`,
    `Custo por unidade arredondado: ${window.currency(rounded)}`,
    '',
    'Consumo por pessoa:'
  ];

  for (const guest of guests) {
    const units = window.totalForGuest(state, guest);
    if (units === 0) continue;
    lines.push(`- ${guest}: ${units} unidade(s) → ${window.currency(units * rounded)}`);
    for (const drink of drinks) {
      const count = state.counts[guest][drink];
      if (count > 0) lines.push(`  • ${drink}: ${count}`);
    }
  }

  lines.push('', 'Totais por bebida:');
  for (const drink of drinks) lines.push(`- ${drink}: ${window.totalForDrink(state, drink)}`);
  lines.push('', `Total geral de unidades: ${window.totalUnits(state)}`);
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
  state = window.loadAppState();
  const rawUnitCost = Number(state.unitCost || 0);
  const rounded = window.roundUpToStep(rawUnitCost, Number(state.roundStep || 0.25));

  unitCostInput.value = state.unitCost;
  roundStepSelect.value = String(state.roundStep);
  totalUnitsEl.textContent = String(window.totalUnits(state));
  roundedUnitCostEl.textContent = window.currency(rounded);

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
        <strong>${window.currency(units * rounded)}</strong>
      </div>
    `;
  }).join('');
}

exportBtn.addEventListener('click', copySummary);
unitCostInput.addEventListener('input', (e) => {
  state.unitCost = e.target.value;
  save();
  render();
});
roundStepSelect.addEventListener('change', (e) => {
  state.roundStep = Number(e.target.value);
  save();
  render();
});
window.addEventListener('storage', render);

render();
