const API = 'http://localhost/dimcum-asam/api.php';

let menu = [];
let cart = [];

// ================= LOAD MENU =================
async function loadMenu() {
  try {
    const res = await fetch(API + '?action=menu&active=1');
    const data = await res.json();
    
    if (data.status === 'success') {
      menu = data.data;
      renderFilter();
      renderMenu(menu);
    } else {
      // Fallback ke data contoh jika API error
      useSampleData();
    }
  } catch (error) {
    console.error('Error loading menu:', error);
    useSampleData();
  }
}

// Data contoh jika API tidak tersedia
function useSampleData() {
  menu = [
    { id: 1, name: "Wonton Kuah Seblak", description: "Wonton dengan isian daging ayam yang disajikan dengan kuah seblak", price: 15000, emoji: "🍜", category: "Wonton" },
    { id: 2, name: "Wonton Chili Oil", description: "Wonton dengan isian daging ayam padat yang disiram chili oil pedas", price: 13000, emoji: "🌶️", category: "Wonton" },
    { id: 3, name: "Dimsum Ayam", description: "Dimsum lembut dengan isian daging ayam pilihan", price: 12000, emoji: "🥟", category: "Dimsum" },
    { id: 4, name: "Dimsum Udang", description: "Dimsum dengan isian udang segar", price: 18000, emoji: "🦐", category: "Dimsum" },
    { id: 5, name: "Mentai Chicken", description: "Topping saus mentai premium di atas ayam crispy", price: 20000, emoji: "🍗", category: "Mentai" },
    { id: 6, name: "Lumpia Udang", description: "Lumpia renyah dengan isian udang utuh", price: 14000, emoji: "🌯", category: "Lumpia" }
  ];
  renderFilter();
  renderMenu(menu);
}

// ================= FILTER =================
function renderFilter() {
  const cats = [...new Set(menu.map(m => m.category))];
  const el = document.getElementById('filters');
  
  if (!el) return;

  el.innerHTML = `
    <button class="active" data-filter="all" onclick="filter('all', this)">Semua</button>
    ${cats.map(c => `<button data-filter="${c}" onclick="filter('${c}', this)">${c}</button>`).join('')}
  `;
}

function filter(cat, btn) {
  document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  if (cat === 'all') {
    renderMenu(menu);
  } else {
    renderMenu(menu.filter(m => m.category === cat));
  }
}

// ================= RENDER MENU =================
function renderMenu(data) {
  const menuContainer = document.getElementById('menu');
  if (!menuContainer) return;

  menuContainer.innerHTML = data.map(m => `
    <div class="card menu-card">
      <div class="menu-emoji">${m.emoji || '🥟'}</div>
      <h3 class="menu-name">${m.name}</h3>
      <p class="menu-desc">${m.description || ''}</p>
      <div class="menu-price">Rp ${m.price.toLocaleString('id-ID')}</div>
      <button class="btn-add" onclick="addToCart(${m.id})">➕ Tambah</button>
    </div>
  `).join('');
}

// ================= CART FUNCTIONS =================
function addToCart(id) {
  const item = menu.find(m => m.id == id);
  if (!item) return;

  const exist = cart.find(c => c.id == id);
  
  if (exist) {
    exist.qty++;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  
  renderCart();
}

function renderCart() {
  let total = 0;
  const cartContainer = document.getElementById('cart-list');
  const cartBadge = document.getElementById('cart-badge');
  const cartSummary = document.getElementById('cart-summary');
  const cartTotalVal = document.getElementById('cart-total-val');
  const cartSubtotalVal = document.getElementById('cart-subtotal-val');

  if (!cartContainer) return;

  // Update badge
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  if (cartBadge) cartBadge.textContent = totalItems;

  if (cart.length === 0) {
    cartContainer.innerHTML = '<div class="cart-empty-msg">Belum ada item<br><small>Yuk pilih menu!</small></div>';
    if (cartSummary) cartSummary.style.display = 'none';
    return;
  }

  if (cartSummary) cartSummary.style.display = 'block';

  // Render cart items
  cartContainer.innerHTML = cart.map(c => {
    total += c.qty * c.price;
    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${c.name}</div>
          <div class="cart-item-price">Rp ${c.price.toLocaleString('id-ID')}</div>
        </div>
        <div class="cart-item-actions">
          <button class="cart-qty-btn" onclick="updateQuantity(${c.id}, -1)">−</button>
          <span class="cart-qty">${c.qty}</span>
          <button class="cart-qty-btn" onclick="updateQuantity(${c.id}, 1)">+</button>
          <button class="cart-delete-btn" onclick="removeItem(${c.id})">🗑️</button>
        </div>
      </div>
    `;
  }).join('');

  // Update total
  if (cartSubtotalVal) cartSubtotalVal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
  if (cartTotalVal) cartTotalVal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

function updateQuantity(id, change) {
  const item = cart.find(c => c.id == id);
  if (!item) return;

  const newQty = item.qty + change;
  
  if (newQty <= 0) {
    cart = cart.filter(c => c.id != id);
  } else {
    item.qty = newQty;
  }
  
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(c => c.id != id);
  renderCart();
}

// ================= CHECKOUT =================
function doCheckout() {
  const nameInput = document.getElementById('cart-cust-name');
  const name = nameInput ? nameInput.value.trim() : '';
  
  if (!name) {
    alert('⚠️ Nama pemesan wajib diisi!');
    if (nameInput) nameInput.focus();
    return;
  }

  if (cart.length === 0) {
    alert('⚠️ Keranjang masih kosong! Yuk pilih menu dulu!');
    return;
  }

  // Build WhatsApp message
  let waMessage = '🍜 *DIMSUM MENTAI - PESANAN BARU* 🍜\n\n';
  waMessage += `👤 *Nama Pemesan:* ${name}\n`;
  waMessage += `🕐 *Waktu:* ${new Date().toLocaleString('id-ID')}\n\n`;
  waMessage += `📋 *Detail Pesanan:*\n`;
  
  let total = 0;
  cart.forEach((item, index) => {
    const subtotal = item.qty * item.price;
    total += subtotal;
    waMessage += `${index + 1}. ${item.name} - ${item.qty} x Rp ${item.price.toLocaleString('id-ID')} = Rp ${subtotal.toLocaleString('id-ID')}\n`;
  });
  
  waMessage += `\n💰 *Total:* Rp ${total.toLocaleString('id-ID')}\n\n`;
  waMessage += `📦 *Catatan:* -\n\n`;
  waMessage += `_Terima kasih! Pesanan akan segera diproses._`;

  // Nomor WhatsApp tujuan (ganti dengan nomor toko)
  const waNumber = '6282234250818';
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  // Buka WhatsApp
  window.open(waUrl, '_blank');
  
  // Optional: Reset cart setelah checkout
  // cart = [];
  // renderCart();
  // if (nameInput) nameInput.value = '';
}

// ================= INITIALIZE =================
document.addEventListener('DOMContentLoaded', () => {
  loadMenu();
  
  // Attach checkout event
  const checkoutBtn = document.getElementById('btn-checkout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', doCheckout);
  }
});