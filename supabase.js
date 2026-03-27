window.supabaseClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

window.insertDrinkEvent = async function insertDrinkEvent({ person, drink, delta, source }) {
  const { data, error } = await window.supabaseClient
    .from('drink_events')
    .insert([{ person, drink, delta, source }])
    .select();
  if (error) throw error;
  return data;
};

window.fetchDrinkEvents = async function fetchDrinkEvents() {
  const { data, error } = await window.supabaseClient
    .from('drink_events')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
};

window.computeStateFromEvents = function computeStateFromEvents(events) {
  const state = window.createDefaultState();
  for (const event of events) {
    if (!state.counts[event.person] || state.counts[event.person][event.drink] == null) continue;
    state.counts[event.person][event.drink] = Math.max(0, state.counts[event.person][event.drink] + Number(event.delta || 0));
  }
  return state;
};
