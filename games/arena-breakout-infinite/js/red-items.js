// Note: `sb`, `GAME_ID`, and `escapeHTML` are already declared by builds.js,
// which loads before this file. We reuse them rather than redefining.

const ITEMS_BUCKET = 'red-item-images';
const ITEMS_TABLE = 'red_items';

// ---------------------------------------------------------------
// Elements
// ---------------------------------------------------------------
const itemsGrid = document.getElementById('items-grid');
const itemsStatus = document.getElementById('items-status');
const itemSearchInput = document.getElementById('item-search');
const filterBtns = document.querySelectorAll('.filter-btn');

const itemModal = document.getElementById('item-modal');
const openItemModalBtn = document.getElementById('open-item-modal');
const closeItemModalBtn = document.getElementById('close-item-modal');
const cancelItemBtn = document.getElementById('cancel-item');
const itemForm = document.getElementById('item-form');
const submitItemBtn = document.getElementById('submit-item');
const itemError = document.getElementById('item-error');

const itemFieldName = document.getElementById('item-field-name');
const itemFieldImage = document.getElementById('item-field-image');
const itemImagePreview = document.getElementById('item-image-preview');
const itemFieldValue = document.getElementById('item-field-value');

let allItems = [];
let activeFilter = 'all';

// ---------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------
function tagLabel(tag) {
  return tag === 'seasonal' ? 'Seasonal Item' : 'Permanent Item';
}

function itemCardHTML(item) {
  const imageBlock = item.image_url
    ? `<div class="build-card__image-wrap"><img src="${escapeHTML(item.image_url)}" alt="${escapeHTML(item.name)}" loading="lazy" /></div>`
    : `<div class="build-card__image-wrap no-image">NO IMAGE</div>`;

  return `
    <article class="build-card" data-id="${item.id}">
      ${imageBlock}
      <div class="build-card__body">
        <h3 class="build-card__title">${escapeHTML(item.name)}</h3>
        <div>
          <span class="item-card__value-label">Value</span>
          <span class="item-card__value">${Number(item.value).toLocaleString()}</span>
        </div>
        <span class="item-tag item-tag--${item.tag}">${tagLabel(item.tag)}</span>
      </div>
    </article>
  `;
}

function renderItems(list) {
  if (list.length === 0) {
    itemsGrid.innerHTML = '';
    itemsStatus.textContent = allItems.length === 0
      ? 'No red items added yet.'
      : 'No red items match your search/filter.';
    return;
  }
  itemsStatus.textContent = `${list.length} item${list.length === 1 ? '' : 's'}`;
  itemsGrid.innerHTML = list.map(itemCardHTML).join('');
}

function applyFilters() {
  const term = itemSearchInput.value.trim().toLowerCase();
  let list = allItems;
  if (activeFilter !== 'all') {
    list = list.filter(i => i.tag === activeFilter);
  }
  if (term) {
    list = list.filter(i => (i.name || '').toLowerCase().includes(term));
  }
  renderItems(list);
}

itemSearchInput.addEventListener('input', applyFilters);

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
    btn.classList.add('filter-btn--active');
    activeFilter = btn.dataset.filter;
    applyFilters();
  });
});

// ---------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------
async function loadItems() {
  if (!sb) return;
  itemsStatus.textContent = 'Loading red items…';
  const { data, error } = await sb
    .from(ITEMS_TABLE)
    .select('*')
    .eq('game_id', GAME_ID)
    .order('value', { ascending: false });

  if (error) {
    itemsStatus.textContent = 'Could not load red items — check your Supabase setup.';
    console.error(error);
    return;
  }
  allItems = data;
  applyFilters();
}

// ---------------------------------------------------------------
// Modal open / close
// ---------------------------------------------------------------
function openItemModal() {
  itemError.hidden = true;
  itemForm.reset();
  itemImagePreview.hidden = true;
  itemModal.showModal();
}
function closeItemModal() { itemModal.close(); }

openItemModalBtn.addEventListener('click', () => {
  if (!sb) {
    alert('Connect Supabase first — see the config warning banner and README.');
    return;
  }
  openItemModal();
});
closeItemModalBtn.addEventListener('click', closeItemModal);
cancelItemBtn.addEventListener('click', closeItemModal);
itemModal.addEventListener('click', (e) => { if (e.target === itemModal) closeItemModal(); });

itemFieldImage.addEventListener('change', () => {
  const file = itemFieldImage.files[0];
  if (!file) { itemImagePreview.hidden = true; return; }
  itemImagePreview.src = URL.createObjectURL(file);
  itemImagePreview.hidden = false;
});

// ---------------------------------------------------------------
// Submit
// ---------------------------------------------------------------
itemForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  itemError.hidden = true;
  submitItemBtn.disabled = true;
  submitItemBtn.textContent = 'Adding…';

  try {
    let imageUrl = null;
    const file = itemFieldImage.files[0];

    if (file) {
      const path = `${GAME_ID}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const { error: uploadError } = await sb.storage.from(ITEMS_BUCKET).upload(path, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = sb.storage.from(ITEMS_BUCKET).getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    const tag = itemForm.querySelector('input[name="item-tag"]:checked').value;

    const { error: insertError } = await sb.from(ITEMS_TABLE).insert({
      game_id: GAME_ID,
      name: itemFieldName.value.trim(),
      image_url: imageUrl,
      value: Number(itemFieldValue.value),
      tag,
    });
    if (insertError) throw insertError;

    closeItemModal();
    await loadItems();
  } catch (err) {
    console.error(err);
    itemError.textContent = 'Something went wrong adding this item. Check the console for details and try again.';
    itemError.hidden = false;
  } finally {
    submitItemBtn.disabled = false;
    submitItemBtn.textContent = 'Add Item';
  }
});

// ---------------------------------------------------------------
// Init
// ---------------------------------------------------------------
loadItems();
