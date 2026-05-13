/* ── MENU DATA ─────────────────────────────────────────
   Replace emoji/gradient with real image paths once you
   have photos, e.g. img: 'assets/items/jollof.jpg'
   ───────────────────────────────────────────────────── */
const MENU = [
  // ── BITES ────────────────────────────────────────────
  { id:1, cat:'bites', name:'Peppersoup', desc:'Spicy catfish or goat meat broth with uziza leaves and spices', price:3500, emoji:'🍲', grad:'grad-6', featured:false },
  { id:2, cat:'bites', name:'Suya Platter', desc:'Skewered beef suya with sliced onions, tomatoes & yaji spice', price:5500, emoji:'🍢', grad:'grad-2', featured:true },
  { id:3, cat:'bites', name:'Asun', desc:'Fiery smoked peppered goat meat, a Nigerian classic', price:5000, emoji:'🥩', grad:'grad-6', featured:false },
  { id:4, cat:'bites', name:'Spring Rolls (6pcs)', desc:'Crispy golden rolls filled with seasoned vegetables & chicken', price:3000, emoji:'🥚', grad:'grad-5', featured:false },
  { id:5, cat:'bites', name:'Chicken Wings', desc:'Grilled or fried wings tossed in our house peri-peri sauce', price:4500, emoji:'🍗', grad:'grad-2', featured:false },
  { id:6, cat:'bites', name:'Samosa Platter', desc:'Eight crispy pastry triangles with spiced meat or veg filling', price:2500, emoji:'🥟', grad:'grad-5', featured:false },
  { id:7, cat:'bites', name:'Grilled Fish', desc:'Whole tilapia grilled with tomatoes, peppers & herbs', price:9500, emoji:'🐟', grad:'grad-3', featured:true },
  { id:8, cat:'bites', name:'Club Sandwich', desc:'Triple-decker with turkey, bacon, egg & avocado on toasted bread', price:5500, emoji:'🥪', grad:'grad-1', featured:false },

  // ── DRINKS ───────────────────────────────────────────
  { id:9,  cat:'drinks', name:'Glenfiddich 18yrs', desc:'Single malt Scotch whisky aged 18 years — oaky, rich & complex', price:250000, emoji:'🥃', grad:'grad-2', featured:true },
  { id:10, cat:'drinks', name:'Glenmorangie 10yrs', desc:'Highland single malt with citrus, vanilla and floral notes', price:110000, emoji:'🥃', grad:'grad-2', featured:true },
  { id:11, cat:'drinks', name:'Hennessy XO', desc:'Extra Old cognac with layers of fruit, spice and leather', price:180000, emoji:'🍾', grad:'grad-4', featured:false },
  { id:12, cat:'drinks', name:'Signature Cocktails', desc:'Ask your waiter for today\'s craft cocktail creations', price:6000, emoji:'🍹', grad:'grad-5', featured:true },
  { id:13, cat:'drinks', name:'Wine Selection', desc:'Curated red, white and rosé by the glass from our cellar', price:15000, emoji:'🍷', grad:'grad-4', featured:false },
  { id:14, cat:'drinks', name:'Champagne (bottle)', desc:'Premium brut champagne perfect for celebrations', price:85000, emoji:'🥂', grad:'grad-1', featured:false },
  { id:15, cat:'drinks', name:'Premium Lager', desc:'Cold-served craft and imported beers', price:2500, emoji:'🍺', grad:'grad-5', featured:false },
  { id:16, cat:'drinks', name:'Fresh Juice', desc:'Watermelon, orange, pineapple or seasonal blend', price:2000, emoji:'🧃', grad:'grad-5', featured:false },

  // ── ROOMS ────────────────────────────────────────────
  { id:17, cat:'rooms', name:'Standard Room', desc:'Comfortable room with king bed, AC, smart TV & en-suite bathroom', price:35000, emoji:'🛏️', grad:'grad-1', featured:false, isRoom:true },
  { id:18, cat:'rooms', name:'Deluxe Suite', desc:'Spacious suite with sitting area, minibar and city view balcony', price:65000, emoji:'🏨', grad:'grad-3', featured:false, isRoom:true },
  { id:19, cat:'rooms', name:'Executive Suite', desc:'Premium suite with jacuzzi, butler service and panoramic view', price:95000, emoji:'✨', grad:'grad-2', featured:false, isRoom:true },
  { id:20, cat:'rooms', name:'Presidential Suite', desc:'The ultimate stay — private lounge, dining room & rooftop access', price:150000, emoji:'👑', grad:'grad-4', featured:true, isRoom:true },
];

/* ── STATE ─────────────────────────────────────────────── */
let cart = [];
let activeTab = 'all';
let searchQuery = '';
let qrInstance = null;

/* ── INIT ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderFeatured();
  renderMenu();
  setupSearch();
  setupNavHighlight();
});

/* ── FEATURED ──────────────────────────────────────────── */
function renderFeatured() {
  const featured = MENU.filter(i => i.featured);
  const grid = document.getElementById('featuredGrid');
  grid.innerHTML = featured.map(item => `
    <div class="menu-card ${item.isRoom ? 'room-card' : ''}" onclick="handleCardClick(${item.id})">
      <div class="card-img-wrap ${item.grad}">
        ${item.img
          ? `<img src="${item.img}" alt="${item.name}" loading="lazy">`
          : `<div class="card-placeholder">${item.emoji}</div>`}
        <span class="card-badge">Featured</span>
      </div>
      <div class="card-body">
        <div class="card-name">${item.name}</div>
        <div class="card-desc">${item.desc}</div>
        <div class="card-footer">
          <div class="card-price">${formatPrice(item.price, item.isRoom)}</div>
          <button class="card-add" id="add-f-${item.id}" onclick="event.stopPropagation(); addToCart(${item.id})">${item.isRoom ? 'Book' : '+'}</button>
        </div>
      </div>
    </div>
  `).join('');
}

/* ── MENU GRID ─────────────────────────────────────────── */
function renderMenu() {
  let items = MENU;
  if (activeTab !== 'all') items = items.filter(i => i.cat === activeTab);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    items = items.filter(i => i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q));
  }

  const grid = document.getElementById('menuGrid');
  const noRes = document.getElementById('noResults');
  const count = document.getElementById('resultsCount');

  if (items.length === 0) {
    grid.innerHTML = '';
    noRes.style.display = 'block';
    count.textContent = '';
    return;
  }
  noRes.style.display = 'none';

  if (searchQuery || activeTab !== 'all') {
    count.textContent = `${items.length} item${items.length !== 1 ? 's' : ''} found`;
  } else {
    count.textContent = '';
  }

  grid.innerHTML = items.map(item => `
    <div class="menu-card ${item.isRoom ? 'room-card' : ''}" onclick="handleCardClick(${item.id})">
      <div class="card-img-wrap ${item.grad}">
        ${item.img
          ? `<img src="${item.img}" alt="${item.name}" loading="lazy">`
          : `<div class="card-placeholder">${item.emoji}</div>`}
      </div>
      <div class="card-body">
        <div class="card-name">${item.name}</div>
        <div class="card-desc">${item.desc}</div>
        <div class="card-footer">
          <div class="card-price">${formatPrice(item.price, item.isRoom)}</div>
          <button class="card-add ${cartHasItem(item.id) ? 'added' : ''}" id="add-${item.id}" onclick="event.stopPropagation(); addToCart(${item.id})">${item.isRoom ? 'Book' : (cartHasItem(item.id) ? '✓' : '+')}</button>
        </div>
      </div>
    </div>
  `).join('');
}

/* ── SEARCH ────────────────────────────────────────────── */
function setupSearch() {
  const input = document.getElementById('searchInput');
  const clear = document.getElementById('searchClear');

  input.addEventListener('input', e => {
    searchQuery = e.target.value.trim();
    clear.style.display = searchQuery ? 'block' : 'none';
    renderMenu();
  });

  clear.addEventListener('click', () => {
    input.value = '';
    searchQuery = '';
    clear.style.display = 'none';
    renderMenu();
    input.focus();
  });
}

/* ── TAB SWITCHING ─────────────────────────────────────── */
function switchTab(tab) {
  activeTab = tab;
  // update nav
  document.querySelectorAll('.nav-item[data-tab]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  // scroll to menu section (except rooms — stay on featured)
  if (tab !== 'all') {
    document.getElementById('menuSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  renderMenu();
}

function setupNavHighlight() {
  const sections = [
    { id: 'home', tab: 'all' },
    { id: 'featured', tab: 'all' },
    { id: 'menuSection', tab: activeTab },
  ];
  // simple scroll-based highlight omitted for brevity — tab clicks handle state
}

/* ── CART ──────────────────────────────────────────────── */
function handleCardClick(id) { /* expand detail if needed later */ }

function addToCart(id) {
  const item = MENU.find(i => i.id === id);
  if (!item) return;
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  updateCartBadge();
  renderMenu();
  renderFeatured();
  // brief feedback on button
  const btn = document.getElementById(`add-${id}`);
  if (btn) { btn.classList.add('added'); btn.textContent = '✓'; }
}

function removeFromCart(id) {
  const idx = cart.findIndex(c => c.id === id);
  if (idx === -1) return;
  if (cart[idx].qty > 1) {
    cart[idx].qty--;
  } else {
    cart.splice(idx, 1);
  }
  updateCartBadge();
  renderCartItems();
  renderMenu();
}

function cartHasItem(id) { return cart.some(c => c.id === id); }

function updateCartBadge() {
  const total = cart.reduce((s, c) => s + c.qty, 0);
  const badge = document.getElementById('cartBadge');
  badge.style.display = total > 0 ? 'flex' : 'none';
  badge.textContent = total;
}

function openCart() {
  renderCartItems();
  document.getElementById('cartDrawer').classList.add('show');
  document.getElementById('cartOverlay').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartDrawer').classList.remove('show');
  document.getElementById('cartOverlay').classList.remove('show');
  document.body.style.overflow = '';
}

function renderCartItems() {
  const empty = document.getElementById('cartEmpty');
  const list = document.getElementById('cartList');
  const footer = document.getElementById('cartFooter');

  if (cart.length === 0) {
    empty.style.display = 'block';
    list.style.display = 'none';
    footer.style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  list.style.display = 'flex';
  footer.style.display = 'flex';

  list.innerHTML = cart.map(item => `
    <li class="cart-item">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatPrice(item.price * item.qty, item.isRoom)}</div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="removeFromCart(${item.id})">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="addToCart(${item.id})">+</button>
      </div>
    </li>
  `).join('');

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const service = subtotal * 0.1;
  const total = subtotal + service;

  document.getElementById('cartSubtotal').textContent = formatPrice(subtotal);
  document.getElementById('cartService').textContent = formatPrice(service);
  document.getElementById('cartTotal').textContent = formatPrice(total);
}

function placeOrder() {
  const room = document.getElementById('roomNumber').value.trim();
  if (!room) {
    document.getElementById('roomNumber').focus();
    document.getElementById('roomNumber').style.borderColor = 'rgba(201,164,58,0.6)';
    return;
  }
  closeCart();
  cart = [];
  updateCartBadge();
  renderMenu();
  renderFeatured();
  document.getElementById('confirmTitle').textContent = 'Order Placed!';
  document.getElementById('confirmMsg').textContent = `Your order has been sent. Room/Table ${room} will be attended to shortly.`;
  openModal('confirmModal', 'confirmOverlay');
}

/* ── BOOKING ───────────────────────────────────────────── */
function openBooking() {
  openModal('bookingModal', 'bookingOverlay');
}
function closeBooking() {
  closeModal('bookingModal', 'bookingOverlay');
}
function submitBooking() {
  const name = document.getElementById('bookName').value.trim();
  const phone = document.getElementById('bookPhone').value.trim();
  if (!name || !phone) return;
  closeBooking();
  document.getElementById('confirmTitle').textContent = 'Reservation Confirmed!';
  document.getElementById('confirmMsg').textContent = `Thank you ${name}. We'll call ${phone} to confirm your booking.`;
  openModal('confirmModal', 'confirmOverlay');
}
function closeConfirm() { closeModal('confirmModal', 'confirmOverlay'); }

/* ── QR CODE ───────────────────────────────────────────── */
function openQr() {
  const box = document.getElementById('qrBox');
  const url = window.location.href;
  document.getElementById('qrUrl').textContent = url;
  if (!qrInstance) {
    box.innerHTML = '';
    qrInstance = new QRCode(box, {
      text: url,
      width: 200, height: 200,
      colorDark: '#0a1628',
      colorLight: '#c9a43a',
      correctLevel: QRCode.CorrectLevel.H,
    });
  }
  openModal('qrModal', 'qrOverlay');
}
function closeQr() { closeModal('qrModal', 'qrOverlay'); }
function downloadQr() {
  const img = document.querySelector('#qrBox img') || document.querySelector('#qrBox canvas');
  if (!img) return;
  const a = document.createElement('a');
  a.href = img.tagName === 'CANVAS' ? img.toDataURL() : img.src;
  a.download = 'ivotel-menu-qr.png';
  a.click();
}

/* ── MODAL HELPERS ─────────────────────────────────────── */
function openModal(modalId, overlayId) {
  document.getElementById(modalId).classList.add('show');
  document.getElementById(overlayId).classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeModal(modalId, overlayId) {
  document.getElementById(modalId).classList.remove('show');
  document.getElementById(overlayId).classList.remove('show');
  document.body.style.overflow = '';
}

/* ── FORMAT PRICE ──────────────────────────────────────── */
function formatPrice(amount, isRoom = false) {
  const fmt = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });
  const str = fmt.format(amount).replace('NGN', '₦');
  return isRoom ? `${str}/night` : str;
}
