import { createClient } from '@supabase/supabase-js';
import { scenario } from './scenario.js';

const root = document.querySelector('#app');
const params = new URLSearchParams(location.search);
const mode = params.get('mode') || 'join';
const room = (params.get('room') || 'SUMMIT').toUpperCase();
const playerName = params.get('player');
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = url && key ? createClient(url, key) : null;

const demoState = {
  room_code: room,
  round_index: 0,
  phase: 'lobby',
  resources: scenario.initialResources,
  team_score: 0,
  submissions: {},
  history: []
};

function esc(v='') { return String(v).replace(/[&<>'\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c])); }
function resourceCards(r) { return Object.entries(r).map(([k,v]) => `<div class="resource"><span>${esc(k)}</span><strong>${v}</strong></div>`).join(''); }
function shell(content, klass='') { root.innerHTML = `<div class="app ${klass}">${content}</div>`; }
function status(msg) { return `<p class="status">${esc(msg)}</p>`; }
function freshState() {
  return {
    round_index: 0,
    phase: 'lobby',
    resources: { ...scenario.initialResources },
    team_score: 0,
    submissions: {},
    history: []
  };
}

async function getState() {
  if (!supabase) return JSON.parse(localStorage.getItem(`state:${room}`) || JSON.stringify(demoState));
  const { data, error } = await supabase.from('game_rooms').select('*').eq('room_code', room).single();
  if (error) throw error;
  return data;
}
async function saveState(patch) {
  if (!supabase) {
    const next = { ...(await getState()), ...patch };
    localStorage.setItem(`state:${room}`, JSON.stringify(next));
    window.dispatchEvent(new Event('storage'));
    return next;
  }
  const { data, error } = await supabase.from('game_rooms').update(patch).eq('room_code', room).select().single();
  if (error) throw error;
  return data;
}
async function createRoom() {
  if (!supabase) {
    const storageKey = `state:${room}`;
    if (!localStorage.getItem(storageKey)) localStorage.setItem(storageKey, JSON.stringify(demoState));
    return;
  }
  const { error } = await supabase.from('game_rooms').insert(demoState);
  if (error && error.code !== '23505') throw error;
}
async function subscribe(render) {
  if (!supabase) { window.addEventListener('storage', render); setInterval(render, 1200); return; }
  supabase.channel(`room:${room}`).on('postgres_changes', { event: '*', schema: 'public', table: 'game_rooms', filter: `room_code=eq.${room}` }, render).subscribe();
}

function joinView() {
  shell(`<section class="card join"><p class="eyebrow">COL Summer Summit</p><h1>${scenario.title}</h1><p>${scenario.subtitle}</p><label>Room code<input id="room" value="${esc(room)}" maxlength="12"></label><label>Your name<select id="player">${scenario.players.map(p=>`<option>${esc(p.name)}</option>`).join('')}</select></label><button id="join">Join game</button><a class="secondary" href="?mode=host&room=${esc(room)}">Open TV host screen</a></section>`);
  document.querySelector('#join').onclick = () => { const r=document.querySelector('#room').value.trim().toUpperCase(); const p=document.querySelector('#player').value; location.href=`?mode=player&room=${encodeURIComponent(r)}&player=${encodeURIComponent(p)}`; };
}

async function playerView() {
  const player = scenario.players.find(p => p.name === playerName) || scenario.players[0];
  async function render() {
    const s = await getState();
    if (s.phase === 'lobby') {
      shell(`<section class="card"><p class="eyebrow">Room ${room}</p><h1>${esc(player.name)}</h1><h2>${esc(player.role)}</h2><div class="private"><span>Private incentive</span><p>${esc(player.motive)}</p></div>${status('Waiting for the host to begin.')}</section>`, 'player'); return;
    }
    if (s.phase === 'complete') {
      const survived = s.team_score >= 65 && Object.values(s.resources).every(v => v >= 0);
      shell(`<section class="card"><p class="eyebrow">Final result</p><h1>${survived ? 'The team survived' : 'The mountain won'}</h1><p>Team score: ${s.team_score}</p><div class="resources">${resourceCards(s.resources)}</div><p>${esc(player.motive)}</p></section>`, 'player'); return;
    }
    const round = scenario.rounds[s.round_index];
    const submitted = s.submissions?.[player.name];
    shell(`<section class="card"><p class="eyebrow">Round ${s.round_index+1} of ${scenario.maxRounds}</p><h1>${esc(round.title)}</h1><div class="private"><span>${esc(player.role)}</span><p>${esc(player.motive)}</p></div><div class="resources compact">${resourceCards(s.resources)}</div>${submitted ? status(`Submitted: ${submitted.choice}`) : `<form id="choiceForm">${round.options.map(o=>`<label class="option"><input type="radio" name="choice" value="${o.id}" required><span><strong>${esc(o.label)}</strong><small>${esc(o.description)}</small></span></label>`).join('')}<label>Recommendation to the team<textarea name="note" maxlength="160" placeholder="One concise reason"></textarea></label><button>Lock in decision</button></form>`}</section>`, 'player');
    const form=document.querySelector('#choiceForm'); if(form) form.onsubmit=async e=>{e.preventDefault(); const fd=new FormData(form); const option=round.options.find(o=>o.id===fd.get('choice')); const next={...(s.submissions||{}),[player.name]:{choice:option.label,choiceId:option.id,note:fd.get('note')}}; await saveState({submissions:next}); render();};
  }
  await render(); subscribe(render);
}

async function hostView() {
  await createRoom();

  async function startNewGame() {
    const confirmed = window.confirm('Start a new game? This will erase the current score, submissions, history, and resource changes for this room.');
    if (!confirmed) return;
    await saveState(freshState());
    render();
  }

  function bindNewGameButton() {
    const btn = document.querySelector('#newGame');
    if (btn) btn.onclick = startNewGame;
  }

  async function render() {
    const s=await getState();
    if(s.phase==='lobby') {
      shell(`<section class="hostHero"><p class="eyebrow">Room code</p><h1>${room}</h1><p>Players open this address on their phones:</p><code>${location.origin}${location.pathname}?room=${room}</code><h2>${scenario.title}</h2><p>${scenario.subtitle}</p><button id="start">Begin expedition</button><button class="secondary" id="newGame">New Game</button></section>`, 'host');
      document.querySelector('#start').onclick=async()=>{await saveState({phase:'decision',round_index:0,submissions:{}}); render();};
      bindNewGameButton();
      return;
    }
    if(s.phase==='complete') {
      const survived=s.team_score>=65 && Object.values(s.resources).every(v=>v>=0);
      shell(`<section class="hostHero"><p class="eyebrow">Expedition complete</p><h1>${survived?'You survived Blackridge':'You did not make it out'}</h1><p class="score">${s.team_score} points</p><div class="resources">${resourceCards(s.resources)}</div><div class="history">${(s.history||[]).map(h=>`<article><strong>${esc(h.round)}</strong><span>${esc(h.choice)}. ${h.points} points</span></article>`).join('')}</div><button id="newGame">New Game</button></section>`, 'host');
      bindNewGameButton();
      return;
    }
    const round=scenario.rounds[s.round_index]; const entries=Object.entries(s.submissions||{}); const counts={}; entries.forEach(([,v])=>counts[v.choiceId]=(counts[v.choiceId]||0)+1);
    shell(`<section class="hostRound"><div class="visual" style="background-image:linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.75)),url('${round.image}')"><p class="eyebrow">Round ${s.round_index+1} of ${scenario.maxRounds}</p><h1>${esc(round.title)}</h1><p>${esc(round.briefing)}</p></div><aside><h2>Team resources</h2><div class="resources">${resourceCards(s.resources)}</div><h2>Decisions received</h2><p class="score">${entries.length} / ${scenario.players.length}</p><div class="votes">${round.options.map(o=>`<div><span>${esc(o.label)}</span><strong>${counts[o.id]||0}</strong></div>`).join('')}</div>${entries.length===scenario.players.length?'<button id="resolve">Reveal consequence</button>':status('Discuss the options. Each player submits on their phone.')}<button class="secondary" id="newGame">New Game</button></aside></section>`, 'host');
    bindNewGameButton();
    const btn=document.querySelector('#resolve'); if(btn) btn.onclick=async()=>{const winner=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]; const option=round.options.find(o=>o.id===winner)||round.options[0]; const resources={...s.resources}; Object.entries(option.cost).forEach(([k,v])=>resources[k]=(resources[k]||0)-v); let points=option.score; if(option.tags.includes('map')) points+=Math.max(0,resources.map)*2; if(Object.values(resources).some(v=>v<0)) points-=15; const history=[...(s.history||[]),{round:round.title,choice:option.label,points}]; const done=s.round_index>=scenario.maxRounds-1; await saveState({resources,team_score:s.team_score+points,history,submissions:{},round_index:done?s.round_index:s.round_index+1,phase:done?'complete':'decision'}); render();};
  }
  await render(); subscribe(render);
}

if(mode==='host') hostView().catch(e=>shell(`<section class="card"><h1>Setup needed</h1><p>${esc(e.message)}</p></section>`));
else if(mode==='player') playerView().catch(e=>shell(`<section class="card"><h1>Unable to join</h1><p>${esc(e.message)}</p></section>`));
else joinView();
