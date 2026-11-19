const storageKey = 'leonida-atlas-r3-v1';
const icon = document.createElement('link');
icon.rel = 'icon';
icon.href = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#120826"/><text x="5" y="24" fill="#ffd76a" font-size="24" font-family="serif">VI</text></svg>')}`;
document.head.append(icon);
const stageNames = ['', 'Story Campaign', 'Partners in Crime', 'Leonida Collectibles', 'Grind & Activities', 'Completion & Platinum'];
const gradeOrder = ['platinum', 'gold', 'silver', 'bronze'];
const byId = (id) => document.getElementById(id);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const cited = (value) => escapeHtml(value).replace(/\[(\d+)\]/g, '<a class="cite" href="#source-$1" aria-label="Source $1">[$1]</a>');
const revealed = new Set();
let trophies = [];
let state = { earned: [], counts: {} };
let kind = 'all';
let selectedId = null;

function normalizeState(value) {
  if (!value || typeof value !== 'object' || !Array.isArray(value.earned) || !value.counts || typeof value.counts !== 'object' || Array.isArray(value.counts)) {
    throw new Error('Choose a tracker JSON file containing earned and counts.');
  }
  const earned = new Set(value.earned.filter((id) => Number.isInteger(id) && trophies.some((trophy) => trophy.id === id)));
  const counts = {};
  for (const trophy of trophies) {
    if (!trophy.count) continue;
    const amount = Number(value.counts[trophy.id] ?? 0);
    counts[trophy.id] = Number.isFinite(amount) ? Math.max(0, Math.min(trophy.count, Math.floor(amount))) : 0;
    if (earned.has(trophy.id)) counts[trophy.id] = trophy.count;
    if (counts[trophy.id] === trophy.count) earned.add(trophy.id);
  }
  return { earned: [...earned], counts };
}

function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    const now = new Date();
    byId('savedAt').textContent = `Saved in this browser · ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  } catch {
    byId('savedAt').textContent = 'Browser storage unavailable · export to keep your progress';
  }
}

const isEarned = (trophy) => state.earned.includes(trophy.id);
const isMasked = (trophy) => byId('spoilerTgl').checked && trophy.hidden && !isEarned(trophy) && !revealed.has(trophy.id);
const roadmap = (first, second) => first.stage - second.stage || first.id - second.id;
const medallion = (trophy, extra = '') => `<div class="medallion ${trophy.grade} ${extra}" aria-hidden="true"><svg viewBox="0 0 32 32"><use href="#trophyCup"/></svg></div>`;
const chips = (trophy) => `<span class="grade-chip ${trophy.grade}">${trophy.grade}</span><span class="kind-chip">${escapeHtml(trophy.kind)}</span><span class="stage-chip">Stage ${trophy.stage}</span>${trophy.id === 28 ? '<span class="miss-badge">POSSIBLY MISSABLE</span>' : ''}`;
const sourceTag = (trophy) => trophy.id === 28 ? 'PowerPyx · GTABase · Exophase' : 'PowerPyx · Exophase · PSNProfiles';

function renderDashboard() {
  const earned = trophies.filter(isEarned);
  const percent = Math.round(earned.length / trophies.length * 100);
  byId('ringNum').textContent = `${percent}%`;
  const circumference = 2 * Math.PI * 34;
  byId('ringFg').style.strokeDasharray = String(circumference);
  byId('ringFg').style.strokeDashoffset = String(circumference * (1 - earned.length / trophies.length));
  byId('statEarned').textContent = `${earned.length}/${trophies.length}`;
  byId('statMiss').textContent = state.earned.includes(28) ? '0' : '1';
  byId('statHidden').textContent = `${earned.filter((trophy) => trophy.hidden).length}/${trophies.filter((trophy) => trophy.hidden).length}`;
  byId('statGrades').innerHTML = gradeOrder.map((grade) => `<span class="grade-${grade}">${grade[0].toUpperCase()} <b>${earned.filter((trophy) => trophy.grade === grade).length}/${trophies.filter((trophy) => trophy.grade === grade).length}</b></span>`).join('');
  const next = [...trophies].sort(roadmap).find((trophy) => !isEarned(trophy));
  byId('nextUp').textContent = next ? `NEXT UP — ${isMasked(next) ? 'Hidden trophy' : next.name} · Stage ${next.stage}` : 'PLATINUM RUN — All 55 trophies earned ✓';
  for (let stage = 1; stage <= 5; stage += 1) {
    const total = trophies.filter((trophy) => trophy.stage === stage).length;
    const completed = earned.filter((trophy) => trophy.stage === stage).length;
    const width = `${completed / total * 100}%`;
    document.querySelector(`.sbar[data-stage="${stage}"] .sbar-fill`).style.width = width;
    const card = document.querySelector(`.stage-card[data-stage="${stage}"]`);
    card.querySelector('.bar-fill').style.width = width;
    card.querySelector('.stage-count').textContent = `${completed} / ${total} earned`;
  }
  const secured = state.earned.includes(28);
  byId('missBanner').className = secured ? 'miss-banner secured' : 'miss-banner';
  byId('missBanner').style.background = secured ? 'linear-gradient(110deg, #143c37, #192738)' : '';
  byId('missBanner').style.borderColor = secured ? '#5ff2d066' : '';
  byId('missBanner').style.color = secured ? '#b9f5de' : '';
  byId('missBanner').innerHTML = secured
    ? '<span>Possibly missable: secured ✓</span>'
    : '<span>⚠ 1 POSSIBLY MISSABLE — Positive Mental Attitude: the Chapter 1 balcony meditation at Jason\'s house vanishes after Chapter 1. Do it before the chapter ends.</span><button type="button" data-action="show-missable">Show it</button>';
}

function cardMarkup(trophy) {
  const masked = isMasked(trophy);
  const amount = state.counts[trophy.id] ?? 0;
  return `<article id="guide-${trophy.id}" class="card${isEarned(trophy) ? ' earned' : ''}" data-id="${trophy.id}" data-grade="${trophy.grade}">
    <div class="card-top">${medallion(trophy)}<div><h3>${masked ? 'Hidden trophy' : escapeHtml(trophy.name)}</h3><div class="chips-row">${chips(trophy)}</div></div></div>
    ${masked ? '<div class="spoiler-mask">Keep this discovery for later.<button type="button" class="reveal-btn" data-action="reveal">Reveal</button></div>' : `<p class="card-desc">${escapeHtml(trophy.description)}</p>`}
    ${trophy.count ? `<div class="count-label"><span>Progress</span><span>${amount}/${trophy.count}</span></div><div class="countbar bar"><span style="width:${amount / trophy.count * 100}%"></span></div>` : ''}
    <div class="card-foot"><a class="src-tag" href="#sourcesSec">${sourceTag(trophy)}</a>${isEarned(trophy) ? '<span class="earned-seal">✓ EARNED</span>' : ''}</div>
    ${masked ? '' : '<button type="button" class="reveal-btn" data-action="open">Open field notes ↗</button>'}
  </article>`;
}

function renderGrid() {
  const query = byId('q').value.trim().toLocaleLowerCase();
  const grade = byId('gradeSel').value;
  const sort = byId('sortSel').value;
  const visible = trophies.filter((trophy) => {
    const text = isMasked(trophy) ? 'hidden trophy' : `${trophy.name} ${trophy.description} ${trophy.guide}`;
    return (kind === 'all' || (kind === 'missable' ? trophy.id === 28 : trophy.kind === kind)) && (grade === 'all' || trophy.grade === grade) && text.toLocaleLowerCase().includes(query);
  });
  visible.sort((first, second) => {
    if (sort === 'grade') return gradeOrder.indexOf(first.grade) - gradeOrder.indexOf(second.grade) || roadmap(first, second);
    if (sort === 'name') return (isMasked(first) ? 'Hidden trophy' : first.name).localeCompare(isMasked(second) ? 'Hidden trophy' : second.name) || roadmap(first, second);
    if (sort === 'unearned') return Number(isEarned(first)) - Number(isEarned(second)) || roadmap(first, second);
    return roadmap(first, second);
  });
  let previousStage = null;
  byId('grid').innerHTML = visible.map((trophy) => {
    let heading = '';
    if (sort === 'roadmap' && previousStage !== trophy.stage) {
      const group = trophies.filter((entry) => entry.stage === trophy.stage);
      heading = `<h3 class="group-head">STAGE ${trophy.stage} — ${stageNames[trophy.stage]} · ${group.filter(isEarned).length}/${group.length} EARNED</h3>`;
      previousStage = trophy.stage;
    }
    return heading + cardMarkup(trophy);
  }).join('') || '<p class="empty-state">No trophies match these filters. Try another search or category.</p>';
  document.querySelectorAll('[data-kind]').forEach((button) => {
    const active = button.dataset.kind === kind;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function renderDetail() {
  const trophy = trophies.find((entry) => entry.id === selectedId);
  if (!trophy) return;
  const detail = byId('detail');
  if (isMasked(trophy)) {
    detail.innerHTML = `${medallion(trophy, 'xl')}<h2 id="detailTitle">Hidden trophy</h2><div class="spoiler-mask">Reveal these field notes when you are ready.<button class="reveal-btn" type="button" data-action="reveal">Reveal</button></div><p class="detail-source">Source: ${escapeHtml(trophy.source)}</p>`;
    return;
  }
  const amount = state.counts[trophy.id] ?? 0;
  detail.innerHTML = `<p class="overline">THE FIELD NOTES · STAGE ${trophy.stage}</p>${medallion(trophy, 'xl')}
    <h2 id="detailTitle">${escapeHtml(trophy.name)}</h2>
    <button class="earn-toggle" type="button" data-action="earn" aria-pressed="${isEarned(trophy)}">${isEarned(trophy) ? '✓ Earned · mark unearned' : 'Mark as earned'}</button>
    <div class="official-desc"><h3>OFFICIAL DESCRIPTION · PLAYSTATION</h3><p>${escapeHtml(trophy.description)}</p></div>
    <div class="detail-chips">${chips(trophy)}</div>
    ${trophy.count ? `<div class="count-stepper"><button type="button" data-action="decrement" aria-label="Decrease progress" ${amount === 0 ? 'disabled' : ''}>−</button><output aria-live="polite">${amount}/${trophy.count}</output><button type="button" data-action="increment" aria-label="Increase progress" ${amount === trophy.count ? 'disabled' : ''}>+</button></div>` : ''}
    ${trophy.id === 28 ? `<div class="miss-box"><strong>MISSABLE? POSSIBLY</strong>${cited("Point of no return: end of Chapter 1. The first meditation (Lucia, on the balcony at Jason's house, after Down to Earth) is reported gone once Chapter 1 ends [1][2]. Whether the trophy strictly requires it is unconfirmed; PowerPyx's author did it and earned the trophy — do it first [1].")}</div><div class="uncertain"><h3>NOT CONFIRMED</h3><p>${cited('The balcony raises the counter but is not marked as a Meditation Spot. Its strict requirement remains unconfirmed [1][2].')}</p></div>` : ''}
    <h3 class="detail-guide-heading">HOW TO GET IT — in our own words</h3><p class="guide-copy">${cited(trophy.guide)}</p>
    <ol class="detail-steps">${trophy.steps.split('\n').filter(Boolean).map((step) => `<li>${cited(step)}</li>`).join('')}</ol>
    <p class="detail-source">Source: ${escapeHtml(trophy.source)}</p>`;
}

function render() {
  renderDashboard();
  renderGrid();
  renderDetail();
}

function changeEarned(trophy, earned) {
  state.earned = state.earned.filter((id) => id !== trophy.id);
  if (earned) state.earned.push(trophy.id);
  if (trophy.count) state.counts[trophy.id] = earned ? trophy.count : Math.min(state.counts[trophy.id] ?? 0, trophy.count - 1);
}

function openDetail(id, updateUrl = true) {
  if (!trophies.some((trophy) => trophy.id === id)) return;
  selectedId = id;
  renderDetail();
  if (updateUrl) history.replaceState(null, '', `${location.pathname}${location.search}#guide-${id}`);
  byId('detail').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function applyHash() {
  if (location.hash === '#view=roadmap') byId('roadmapSec').scrollIntoView({ behavior: 'smooth' });
  if (location.hash === '#view=missables') {
    kind = 'missable';
    renderGrid();
    byId('listSec').scrollIntoView({ behavior: 'smooth' });
  }
  const match = location.hash.match(/^#guide-(\d+)$/);
  if (match) openDetail(Number(match[1]), false);
}

function bindControls() {
  byId('q').addEventListener('input', renderGrid);
  byId('gradeSel').addEventListener('change', renderGrid);
  byId('sortSel').addEventListener('change', renderGrid);
  byId('spoilerTgl').addEventListener('change', render);
  document.querySelectorAll('[data-kind]').forEach((button) => button.addEventListener('click', () => {
    kind = button.dataset.kind;
    renderGrid();
  }));
  byId('missBanner').addEventListener('click', (event) => {
    if (event.target.closest('button')) openDetail(28);
  });
  byId('grid').addEventListener('click', (event) => {
    if (event.target.closest('a')) return;
    const card = event.target.closest('[data-id]');
    if (!card) return;
    const id = Number(card.dataset.id);
    if (event.target.closest('[data-action="reveal"]')) {
      revealed.add(id);
      render();
    } else {
      openDetail(id);
    }
  });
  byId('grid').addEventListener('pointermove', (event) => {
    const card = event.target.closest('[data-id]');
    if (!card || event.pointerType === 'touch') return;
    const bounds = card.getBoundingClientRect();
    card.style.setProperty('--rx', `${(0.5 - (event.clientY - bounds.top) / bounds.height) * 6}deg`);
    card.style.setProperty('--ry', `${((event.clientX - bounds.left) / bounds.width - 0.5) * 6}deg`);
  });
  byId('grid').addEventListener('pointerout', (event) => {
    const card = event.target.closest('[data-id]');
    if (card && !card.contains(event.relatedTarget)) {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    }
  });
  byId('detail').addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    const trophy = trophies.find((entry) => entry.id === selectedId);
    if (!action || !trophy) return;
    if (action === 'reveal') {
      revealed.add(trophy.id);
    } else if (action === 'earn') {
      changeEarned(trophy, !isEarned(trophy));
      save();
    } else if (action === 'increment' || action === 'decrement') {
      const amount = Math.max(0, Math.min(trophy.count, (state.counts[trophy.id] ?? 0) + (action === 'increment' ? 1 : -1)));
      state.counts[trophy.id] = amount;
      changeEarned(trophy, amount === trophy.count);
      save();
    }
    render();
  });
  byId('exportBtn').addEventListener('click', () => {
    let url;
    try {
      url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'leonida-atlas-progress.json';
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
    } catch {
      byId('savedAt').textContent = 'Export failed · try again in this browser';
    } finally {
      if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  });
  byId('importBtn').addEventListener('click', () => byId('fileIn').click());
  byId('fileIn').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const imported = normalizeState(JSON.parse(await file.text()));
      state = imported;
      save();
      render();
    } catch {
      byId('savedAt').textContent = 'Import failed · choose a valid tracker JSON file';
    } finally {
      event.target.value = '';
    }
  });
  window.addEventListener('hashchange', applyHash);
}

async function initialize() {
  try {
    const response = await fetch('data/trophies.json');
    if (!response.ok) throw new Error('Trophy data unavailable');
    const data = await response.json();
    trophies = data.trophies;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) state = normalizeState(JSON.parse(stored));
    } catch {
      state = { earned: [], counts: {} };
    }
    const parameters = new URLSearchParams(location.search);
    if (parameters.has('earned')) state.earned = parameters.get('earned').split(',').map(Number);
    if (parameters.has('counts')) {
      state.counts = {};
      for (const entry of parameters.get('counts').split(',')) {
        const [id, amount] = entry.split(':');
        if (/^\d+$/.test(id)) state.counts[id] = Number(amount);
      }
    }
    state = normalizeState(state);
    byId('spoilerTgl').parentElement.querySelector('span:last-child').textContent = 'Spoiler protection';
    bindControls();
    save();
    render();
    const open = Number(parameters.get('open'));
    if (open) openDetail(open, false);
    applyHash();
  } catch {
    byId('grid').innerHTML = '<p class="empty-state">The trophy data could not load. Serve the app folder with node serve.ts and reload.</p>';
    byId('savedAt').textContent = 'Guide unavailable · reload to try again';
  }
}

initialize();
