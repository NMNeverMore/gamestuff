// ---------------------------------------------------------------
// Config
// ---------------------------------------------------------------
const GAME_ID = 'arena-breakout-infinite';
const BUILDS_BUCKET = 'build-images';
const BUILDS_TABLE = 'builds';

const isConfigured =
  window.SUPABASE_URL &&
  window.SUPABASE_ANON_KEY &&
  !window.SUPABASE_URL.includes('YOUR_SUPABASE') &&
  !window.SUPABASE_ANON_KEY.includes('YOUR_SUPABASE');

let sb = null;
if (isConfigured) {
  sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
} else {
  document.getElementById('config-warning').hidden = false;
}

// ---------------------------------------------------------------
// Elements
// ---------------------------------------------------------------
const grid = document.getElementById('builds-grid');
const statusLine = document.getElementById('builds-status');
const searchInput = document.getElementById('build-search');

const modal = document.getElementById('post-modal');
const openModalBtn = document.getElementById('open-post-modal');
const closeModalBtn = document.getElementById('close-post-modal');
const cancelBtn = document.getElementById('cancel-post');
const form = document.getElementById('post-form');
const submitBtn = document.getElementById('submit-post');
const postError = document.getElementById('post-error');

const fieldTitle = document.getElementById('field-title');
const fieldDescription = document.getElementById('field-description');
const fieldImage = document.getElementById('field-image');
const imagePreview = document.getElementById('image-preview');
const fieldCode = document.getElementById('field-code');
const fieldAuthor = document.getElementById('field-author');

let allBuilds = [];

// ---------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function buildCardHTML(b) {
  const imageBlock = b.image_url
    ? `<div class="build-card__image-wrap"><img src="${escapeHTML(b.image_url)}" alt="${escapeHTML(b.title)} screenshot" loading="lazy" /></div>`
    : `<div class="build-card__image-wrap no-image">NO SCREENSHOT</div>`;

  return `
    <article class="build-card" data-id="${b.id}">
      ${imageBlock}
      <div class="build-card__body">
        <h3 class="build-card__title">${escapeHTML(b.title)}</h3>
        ${b.description ? `<p class="build-card__desc">${escapeHTML(b.description)}</p>` : ''}
        <div class="build-card__code-box">
          <span class="build-card__code-label">Build Code</span>
          <button class="build-card__copy-btn" data-code="${escapeHTML(b.build_code)}">Copy</button>
        </div>
        <div class="build-card__meta">
          <span>${escapeHTML(b.author || 'Anonymous')}</span>
          <span>${timeAgo(b.created_at)}</span>
        </div>
      </div>
    </article>
  `;
}

function render(list) {
  if (list.length === 0) {
    grid.innerHTML = '';
    statusLine.textContent = allBuilds.length === 0
      ? 'No builds posted yet. Be the first.'
      : 'No builds match your search.';
    return;
  }
  statusLine.textContent = `${list.length} build${list.length === 1 ? '' : 's'}`;
  grid.innerHTML = list.map(buildCardHTML).join('');
}

grid.addEventListener('click', async (e) => {
  const btn = e.target.closest('.build-card__copy-btn');
  if (!btn) return;
  try {
    await navigator.clipboard.writeText(btn.dataset.code);
    const original = btn.textContent;
    btn.textContent = 'Copied';
    setTimeout(() => { btn.textContent = original; }, 1500);
  } catch {
    alert('Could not copy automatically. Build code:\n\n' + btn.dataset.code);
  }
});

// ---------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------
async function loadBuilds() {
  if (!sb) return;
  statusLine.textContent = 'Loading builds…';
  const { data, error } = await sb
    .from(BUILDS_TABLE)
    .select('*')
    .eq('game_id', GAME_ID)
    .order('created_at', { ascending: false });

  if (error) {
    statusLine.textContent = 'Could not load builds — check your Supabase setup.';
    console.error(error);
    return;
  }
  allBuilds = data;
  render(allBuilds);
}

searchInput.addEventListener('input', () => {
  const term = searchInput.value.trim().toLowerCase();
  if (!term) { render(allBuilds); return; }
  render(allBuilds.filter(b =>
    (b.title || '').toLowerCase().includes(term) ||
    (b.description || '').toLowerCase().includes(term)
  ));
});

// ---------------------------------------------------------------
// Modal open / close
// ---------------------------------------------------------------
function openModal() {
  postError.hidden = true;
  form.reset();
  imagePreview.hidden = true;
  modal.showModal();
}
function closeModal() { modal.close(); }

openModalBtn.addEventListener('click', () => {
  if (!sb) {
    alert('Connect Supabase first — see the config warning banner and README.');
    return;
  }
  openModal();
});
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

fieldImage.addEventListener('change', () => {
  const file = fieldImage.files[0];
  if (!file) { imagePreview.hidden = true; return; }
  imagePreview.src = URL.createObjectURL(file);
  imagePreview.hidden = false;
});

// ---------------------------------------------------------------
// Submit
// ---------------------------------------------------------------
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  postError.hidden = true;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Publishing…';

  try {
    let imageUrl = null;
    const file = fieldImage.files[0];

    if (file) {
      const path = `${GAME_ID}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { error: uploadError } = await sb.storage.from(BUILDS_BUCKET).upload(path, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = sb.storage.from(BUILDS_BUCKET).getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    const { error: insertError } = await sb.from(BUILDS_TABLE).insert({
      game_id: GAME_ID,
      title: fieldTitle.value.trim(),
      description: fieldDescription.value.trim(),
      image_url: imageUrl,
      build_code: fieldCode.value.trim(),
      author: fieldAuthor.value.trim() || 'Anonymous',
    });
    if (insertError) throw insertError;

    closeModal();
    await loadBuilds();
  } catch (err) {
    console.error(err);
    postError.textContent = 'Something went wrong publishing this build. Check the console for details and try again.';
    postError.hidden = false;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Publish Build';
  }
});

// ---------------------------------------------------------------
// Init
// ---------------------------------------------------------------
loadBuilds();
