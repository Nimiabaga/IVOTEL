/* ── SHARED CART LOGIC (loaded on every page) ──────── */

let cart = JSON.parse(localStorage.getItem('ivotel_cart') || '[]');

function saveCart() {
  localStorage.setItem('ivotel_cart', JSON.stringify(cart));
}

function addToCart(name, emoji, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, emoji, price, qty: 1 });
  }
  saveCart();
  updateCartFab();
  renderCartItems();
  // flash the add button
  const btn = document.getElementById('ab-' + name.replace(/\s+/g,'').toLowerCase());
  if (btn) {
    const orig = btn.textContent;
    btn.classList.add('added');
    btn.textContent = '✓';
    setTimeout(() => { btn.classList.remove('added'); btn.textContent = orig || '+'; }, 1200);
  }
}

function removeFromCart(name) {
  const idx = cart.findIndex(i => i.name === name);
  if (idx === -1) return;
  if (cart[idx].qty > 1) cart[idx].qty--;
  else cart.splice(idx, 1);
  saveCart();
  updateCartFab();
  renderCartItems();
}

function updateCartFab() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const fab = document.getElementById('cartFab');
  const badge = document.getElementById('cartCount');
  if (!fab) return;
  if (total > 0) { fab.classList.add('visible'); badge.textContent = total; }
  else { fab.classList.remove('visible'); }
}

function openCart() {
  renderCartItems();
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

function renderCartItems() {
  const empty  = document.getElementById('cartEmpty');
  const list   = document.getElementById('cartItems');
  const footer = document.getElementById('drawerFoot');
  if (!list) return;

  if (cart.length === 0) {
    empty.style.display = 'block';
    list.style.display  = 'none';
    footer.style.display = 'none';
    return;
  }
  empty.style.display  = 'none';
  list.style.display   = 'flex';
  footer.style.display = 'flex';

  list.innerHTML = cart.map(item => `
    <li class="ci">
      <div class="ci-emoji">${item.emoji}</div>
      <div class="ci-info">
        <div class="ci-name">${item.name}</div>
        <div class="ci-price">${fmt(item.price * item.qty)}</div>
      </div>
      <div class="ci-qty">
        <button class="qb" onclick="removeFromCart('${item.name}')">−</button>
        <span class="qn">${item.qty}</span>
        <button class="qb" onclick="addToCart('${item.name}','${item.emoji}',${item.price})">+</button>
      </div>
    </li>
  `).join('');

  const sub = cart.reduce((s,i) => s + i.price * i.qty, 0);
  const svc = sub * 0.1;
  document.getElementById('sumSub').textContent   = fmt(sub);
  document.getElementById('sumSvc').textContent   = fmt(svc);
  document.getElementById('sumTotal').textContent = fmt(sub + svc);
}

function placeOrder() {
  const room = document.getElementById('roomNo')?.value.trim();
  if (!room) {
    const input = document.getElementById('roomNo');
    if (input) { input.focus(); input.style.borderColor = 'rgba(201,164,58,0.7)'; }
    return;
  }
  closeCart();
  cart = [];
  saveCart();
  updateCartFab();
  document.getElementById('confirmMsg').textContent =
    `Your order has been sent to Room / Table ${room}. We'll be with you shortly.`;
  document.getElementById('confirmModal')?.classList.add('open');
  document.getElementById('confirmOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeConfirm() {
  document.getElementById('confirmModal')?.classList.remove('open');
  document.getElementById('confirmOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

function fmt(amount) {
  return '₦' + new Intl.NumberFormat('en-NG').format(Math.round(amount));
}

/* ── INNER PAGE: render card grid from data array ───── */
function renderPageItems(items, containerId = 'cardGrid') {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  grid.innerHTML = items.map(item => {
    const btnId = 'ab-' + item.name.replace(/\s+/g,'').toLowerCase();
    return `
      <div class="card">
        <div class="card-img ${item.grad || 'g1'}" onclick="addToCart('${item.name}','${item.emoji}',${item.price})">
          ${item.img ? `<img src="${item.img}" alt="${item.name}" loading="lazy">` : `<div class="card-placeholder">${item.emoji}</div>`}
          <button class="add-btn" id="${btnId}" onclick="event.stopPropagation();addToCart('${item.name}','${item.emoji}',${item.price})">+</button>
        </div>
        <div class="card-body">
          <div class="card-name">${item.name}</div>
          <div class="card-price">${item.price ? fmt(item.price) : item.priceLabel || ''}</div>
        </div>
      </div>
    `;
  }).join('');
}

/* ── SEARCH ──────────────────────────────────────────── */
function setupSearch(allItems, renderFn) {
  const input = document.getElementById('searchInput');
  const clear = document.getElementById('sClear');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    clear.style.display = q ? 'block' : 'none';
    const filtered = q ? allItems.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.desc && i.desc.toLowerCase().includes(q))
    ) : allItems;
    renderFn(filtered);
    document.getElementById('noResults').style.display = filtered.length ? 'none' : 'block';
    document.getElementById('cardGrid').style.display  = filtered.length ? 'grid' : 'none';
  });

  clear.addEventListener('click', () => {
    input.value = '';
    clear.style.display = 'none';
    renderFn(allItems);
    document.getElementById('noResults').style.display = 'none';
    document.getElementById('cardGrid').style.display  = 'grid';
  });
}

/* ── CATEGORY CHIPS ──────────────────────────────────── */
function setupCatChips(allItems, renderFn) {
  const chips = document.querySelectorAll('.cat-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const cat = chip.dataset.cat;
      const filtered = cat === 'all' ? allItems : allItems.filter(i => i.cat === cat);
      renderFn(filtered);
      document.getElementById('noResults').style.display = filtered.length ? 'none' : 'block';
      document.getElementById('cardGrid').style.display  = filtered.length ? 'grid' : 'none';
      // reset search
      const input = document.getElementById('searchInput');
      if (input) { input.value = ''; document.getElementById('sClear').style.display = 'none'; }
    });
  });
}

/* Init on load */
document.addEventListener('DOMContentLoaded', () => {
  updateCartFab();
});
