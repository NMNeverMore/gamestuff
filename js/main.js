// ---------------------------------------------------------------
// GAME REGISTRY
// Add a new object here whenever you add a new folder under games/.
// `path` is relative to this index.html file.
// `spine` is a hex color used as the card's left accent border.
// ---------------------------------------------------------------
const GAMES = [
  {
    id: 'arena-breakout-infinite',
    title: 'Arena Breakout: Infinite',
    genre: 'Extraction Shooter',
    tags: ['fps', 'extraction', 'tactical', 'pvp'],
    spine: '#e8a33d',
    path: 'games/arena-breakout-infinite/index.html',
    blurb: 'Loot-and-extract tactical FPS. Builds, meta loadouts, and red item tracking.',
  },
];

const grid = document.getElementById('grid');
const searchInput = document.getElementById('search');
const countEl = document.getElementById('count');
const emptyEl = document.getElementById('empty');
const emptyTermEl = document.getElementById('empty-term');

function cardHTML(game) {
  return `
    <a class="card" style="--spine:${game.spine}" href="${game.path}">
      <span class="card__genre">${game.genre}</span>
      <h2 class="card__title">${game.title}</h2>
      <p class="card__blurb">${game.blurb}</p>
      <div class="card__tags">${game.tags.map(t => `<span>${t}</span>`).join('')}</div>
      <span class="card__load">LOAD</span>
    </a>
  `;
}

function render(list) {
  grid.innerHTML = list.map(cardHTML).join('');
  countEl.textContent = `${list.length} title${list.length === 1 ? '' : 's'}`;
  emptyEl.hidden = list.length !== 0;
}

function matches(game, term) {
  const haystack = [game.title, game.genre, ...game.tags].join(' ').toLowerCase();
  return haystack.includes(term.toLowerCase());
}

searchInput.addEventListener('input', () => {
  const term = searchInput.value.trim();
  if (!term) {
    render(GAMES);
    return;
  }
  const filtered = GAMES.filter(g => matches(g, term));
  emptyTermEl.textContent = term;
  render(filtered);
});

render(GAMES);
