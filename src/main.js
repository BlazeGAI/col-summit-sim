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
function rulesList() { return `<ol class="rules">${scenario.rules.map(rule => `<li>${esc(rule)}</li>`).join('')}</ol>`; }
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

function playerRankings(state) {
  const history = state.history || [];
  const finalResources = state.resources || {};
  const scores = scenario.players.map(player => {
    let points = 0;
    let detail = '';
    if (player.name === 'Korab') {
      const decisiveRounds = history.filter(h => h.tags?.includes('decisive')).length;
      const noTieRounds = history.filter(h => h.uniqueWinner).length;
      points = decisiveRounds * 3 + noTieRounds * 2;
      detail = `${decisiveRounds} decisive team choice${decisiveRounds === 1 ? '' : 's'}, ${noTieRounds} clear decision${noTieRounds === 1 ? '' : 's'}`;
    } else if (player.name === 'Bri') {
      const efficientRounds = history.filter(h => (h.cost?.food || 0) <= 2).length;
      const reserveBonus = (finalResources.food || 0) > 4 ? 8 : 0;
      points = efficientRounds * 2 + reserveBonus;
      detail = `${efficientRounds} supply-conscious round${efficientRounds === 1 ? '' : 's'}${reserveBonus ? ', food reserve protected' : ''}`;
    } else if (player.name === 'Vicki') {
      const cautiousRounds = history.filter(h => h.tags?.includes('cautious')).length;
      points = cautiousRounds * 4;
      detail = `${cautiousRounds} cautious team choice${cautiousRounds === 1 ? '' : 's'}`;
    } else if (player.name === 'Jeff') {
      const equipmentRounds = history.filter(h => ((h.cost?.rope || 0) + (h.cost?.matches || 0) + (h.cost?.medicine || 0)) >= 3).length;
      points = equipmentRounds * 5;
      detail = `${equipmentRounds} equipment-intensive round${equipmentRounds === 1 ? '' : 's'}`;
    } else if (player.name === 'Sree') {
      const mapRounds = history.filter(h => h.tags?.includes('map')).length;
      const mapBonus = (finalResources.map || 0) >= 3 ? 8 : 0;
      points = mapRounds * 3 + mapBonus;
      detail = `${mapRounds} map-building choice${mapRounds === 1 ? '' : 's'}${mapBonus ? ', map knowledge target reached' : ''}`;
    } else if (player.name === 'Mike') {
      const matches = history.filter(h => h.submissions?.[player.name]?.choiceId === h.choiceId).length;
      points = matches * 4;
      detail = `${matches} personal choice${matches === 1 ? '' : 's'} matched the final team decision`;
    }
    return { ...player, points, detail };
  });
  return scores.sort((a,b) => b.points - a.points || a.name.localeCompare(b.name)).map((player, index, arr) => ({
    ...player,
    rank: index > 0 && player.points === arr[index - 1].points ? arr[index - 1].rank : index + 1
  }));
}

function leaderboard(state, compact=false) {
  const rankings = playerRankings(state);
  return `<div class="leaderboard ${compact ? 'compact-board' : ''}">${rankings.map(p => `<article><span class="rank">#${p.rank}</span><div><strong>${esc(p.name)}</strong><small>${esc(p.role)}${compact ? '' : ` · ${esc(p.detail)}`}</small></div><strong>${p.points} pts</strong></article>`).join('')}</div>`;
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
  shell(`<section class="card join"><p class="eyebrow">COL Summer Summit</p><h1>${scenario.title}</h1><p class="lede">${esc(scenario.context)}</p><div class="how-to"><h2>How the simulation works</h2>${rulesList()}</div><label>Room code<input id="room" value="${esc(room)}" maxlength="12"></label><label>Your name<select id="player">${scenario.players.map(p=>`<option>${esc(p.name)}</option>`).join('')}</select></label><button id="join">Join game</button><a class="secondary" href="?mode=host&room=${esc(room)}">Open TV host screen</a></section>`);
  document.querySelector('#join').onclick = () => { const r=document.querySelector('#room').value.trim().toUpperCase(); const p=document.querySelector('#player').value; location.href=`?mode=player&room=${encodeURIComponent(r)}&player=${encodeURIComponent(p)}`; };
}

async function playerView() {
  const player = scenario.players.find(p => p.name === playerName) || scenario.players[0];
  async function render() {
    const s = await getState();
    if (s.phase === 'lobby') {
      shell(`<section class="card"><p class="eyebrow">Room ${room}</p><h1>${esc(player.name)}</h1><h2>${esc(player.role)}</h2><p>${esc(scenario.context)}</p><div class="private"><span>Private incentive</span><p>${esc(player.motive)}</p></div><div class="how-to"><h2>Rules</h2>${rulesList()}</div>${status('Waiting for the host to begin.')}</section>`, 'player'); return;
    }
    if (s.phase === 'consequence') {
      const last = s.history?.[s.history.length - 1];
      shell(`<section class="card consequence-card"><p class="eyebrow">Round ${s.round_index + 1} result</p><h1>${esc(last?.choice || 'Decision resolved')}</h1><p class="result-text">${esc(last?.result || '')}</p><p class="round-points">Team impact: +${last?.points || 0} points</p><h2>Resources now</h2><div class="resources compact">${resourceCards(s.resources)}</div>${status('Review what happened. The host will advance when the team is ready.')}</section>`, 'player'); return;
    }
    if (s.phase === 'complete') {
      const survived = s.team_score >= 65 && Object.values(s.resources).every(v => v >= 0);
      const rankings = playerRankings(s);
      const mine = rankings.find(p => p.name === player.name);
      shell(`<section class="card"><p class="eyebrow">Final result</p><h1>${survived ? 'The team survived' : 'The mountain won'}</h1><p>Team score: ${s.team_score}</p><div class="resources">${resourceCards(s.resources)}</div><div class="private"><span>Your role result</span><p><strong>#${mine?.rank || '-'} · ${mine?.points || 0} role points</strong></p><p>${esc(mine?.detail || '')}</p></div><h2>Player rankings</h2>${leaderboard(s, true)}</section>`, 'player'); return;
    }
    const round = scenario.rounds[s.round_index];
    const submitted = s.submissions?.[player.name];
    shell(`<section class="card"><p class="eyebrow">Round ${s.round_index+1} of ${scenario.maxRounds}</p><h1>${esc(round.title)}</h1><p>${esc(round.briefing)}</p><div class="private"><span>${esc(player.role)}</span><p>${esc(player.motive)}</p></div><div class="resources compact">${resourceCards(s.resources)}</div>${submitted ? status(`Submitted: ${submitted.choice}`) : `<form id="choiceForm">${round.options.map(o=>`<label class="option"><input type="radio" name="choice" value="${o.id}" required><span><strong>${esc(o.label)}</strong><small>${esc(o.description)}</small></span></label>`).join('')}<label>Recommendation to the team<textarea name="note" maxlength="160" placeholder="One concise reason"></textarea></label><button>Lock in decision</button></form>`}</section>`, 'player');
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
      shell(`<section class="hostHero lobby-host"><p class="eyebrow">Room code</p><h1>${room}</h1><p>Players open this address on their phones:</p><code>${location.origin}${location.pathname}?room=${room}</code><h2>${scenario.title}</h2><p class="host-lede">${esc(scenario.context)}</p><div class="host-rules"><h3>Rules of the expedition</h3>${rulesList()}</div><button id="start">Begin expedition</button><button class="secondary" id="newGame">New Game</button></section>`, 'host');
      document.querySelector('#start').onclick=async()=>{await saveState({phase:'decision',round_index:0,submissions:{}}); render();};
      bindNewGameButton();
      return;
    }
    if(s.phase==='consequence') {
      const last=s.history?.[s.history.length-1];
      const isFinal=s.round_index>=scenario.maxRounds-1;
      shell(`<section class="hostConsequence"><div><p class="eyebrow">Round ${s.round_index+1} consequence</p><h1>${esc(last?.choice || 'Decision resolved')}</h1><p class="result-text">${esc(last?.result || '')}</p><p class="score">+${last?.points || 0} team points</p></div><aside><h2>Resources now</h2><div class="resources">${resourceCards(s.resources)}</div><button id="continue">${isFinal ? 'See final results' : 'Continue to next round'}</button><button class="secondary" id="newGame">New Game</button></aside></section>`, 'host');
      document.querySelector('#continue').onclick=async()=>{await saveState({phase:isFinal?'complete':'decision',round_index:isFinal?s.round_index:s.round_index+1,submissions:{}}); render();};
      bindNewGameButton();
      return;
    }
    if(s.phase==='complete') {
      const survived=s.team_score>=65 && Object.values(s.resources).every(v=>v>=0);
      shell(`<section class="hostHero results-host"><p class="eyebrow">Expedition complete</p><h1>${survived?'You survived Blackridge':'You did not make it out'}</h1><p class="score">${s.team_score} team points</p><div class="resources">${resourceCards(s.resources)}</div><h2>Player role rankings</h2><p>Rankings reflect how well each player advanced their private role objective. They do not replace the shared team result.</p>${leaderboard(s)}<div class="history">${(s.history||[]).map(h=>`<article><strong>${esc(h.round)}</strong><span>${esc(h.choice)} · ${h.points} points</span></article>`).join('')}</div><button id="newGame">New Game</button></section>`, 'host');
      bindNewGameButton();
      return;
    }
    const round=scenario.rounds[s.round_index]; const entries=Object.entries(s.submissions||{}); const counts={}; entries.forEach(([,v])=>counts[v.choiceId]=(counts[v.choiceId]||0)+1);
    shell(`<section class="hostRound"><div class="visual" style="background-image:linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.75)),url('${round.image}')"><p class="eyebrow">Round ${s.round_index+1} of ${scenario.maxRounds}</p><h1>${esc(round.title)}</h1><p>${esc(round.briefing)}</p></div><aside><h2>Team resources</h2><div class="resources">${resourceCards(s.resources)}</div><h2>Decisions received</h2><p class="score">${entries.length} / ${scenario.players.length}</p><div class="votes">${round.options.map(o=>`<div><span>${esc(o.label)}</span><strong>${counts[o.id]||0}</strong></div>`).join('')}</div>${entries.length===scenario.players.length?'<button id="resolve">Reveal consequence</button>':status('Discuss the options. Each player submits on their phone.')}<button class="secondary" id="newGame">New Game</button></aside></section>`, 'host');
    bindNewGameButton();
    const btn=document.querySelector('#resolve'); if(btn) btn.onclick=async()=>{
      const sortedCounts=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
      const winner=sortedCounts[0]?.[0];
      const topCount=sortedCounts[0]?.[1] || 0;
      const tied=sortedCounts.filter(([,count])=>count===topCount).length>1;
      const option=round.options.find(o=>o.id===winner)||round.options[0];
      const resources={...s.resources};
      Object.entries(option.cost).forEach(([k,v])=>resources[k]=(resources[k]||0)-v);
      let points=option.score;
      if(option.tags.includes('map')) points+=Math.max(0,resources.map)*2;
      if(Object.values(resources).some(v=>v<0)) points-=15;
      const history=[...(s.history||[]),{
        round:round.title,
        choice:option.label,
        choiceId:option.id,
        result:option.result,
        points,
        tags:[...option.tags],
        cost:{...option.cost},
        uniqueWinner:!tied,
        votes:{...counts},
        submissions:{...(s.submissions||{})},
        resourcesAfter:{...resources}
      }];
      await saveState({resources,team_score:s.team_score+points,history,submissions:{},phase:'consequence'});
      render();
    };
  }
  await render(); subscribe(render);
}

if(mode==='host') hostView().catch(e=>shell(`<section class="card"><h1>Setup needed</h1><p>${esc(e.message)}</p></section>`));
else if(mode==='player') playerView().catch(e=>shell(`<section class="card"><h1>Unable to join</h1><p>${esc(e.message)}</p></section>`));
else joinView();
