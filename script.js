/* ===== EDIT YOUR MENU HERE =====
   id must be unique. price is a number. image can be any image URL or a local file like "images/burger.jpg" */
const MENU = [
  { id: 1,  cat: "Burgers", name: "Big G Burger", desc: "Beef patty, cheese, lettuce, tomato and house sauce.", price: 80,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=70" },
  { id: 2,  cat: "Burgers", name: "Crispy Chicken Burger", desc: "Crunchy chicken fillet, slaw and spicy mayo.", price: 70,
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=600&q=70" },
  { id: 3,  cat: "Mains", name: "Grilled Chicken Plate", desc: "Flame-grilled chicken with rice and seasonal veg.", price: 95,
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=70" },
  { id: 4,  cat: "Mains", name: "Creamy Pasta", desc: "Penne in a creamy garlic sauce with herbs.", price: 85,
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=600&q=70" },
  { id: 5,  cat: "Sides", name: "Hand-cut Chips", desc: "Golden, crispy and lightly salted.", price: 30,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=70" },
  { id: 6,  cat: "Sides", name: "Garden Salad", desc: "Fresh greens, cucumber, tomato and vinaigrette.", price: 40,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=70" },
  { id: 7,  cat: "Drinks", name: "Fresh Lemonade", desc: "Squeezed daily, lightly sweetened.", price: 25,
    image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=600&q=70" },
  { id: 8,  cat: "Desserts", name: "Chocolate Brownie", desc: "Warm, gooey brownie with ice cream.", price: 45,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=70" }
];

const CURRENCY = "R";
const cart = {}; // { itemId: quantity }
let activeCat = "All";

const $ = (id) => document.getElementById(id);
const money = (n) => CURRENCY + n.toFixed(2);

/* ---------- Menu ---------- */
function renderFilters() {
  const cats = ["All", ...new Set(MENU.map((m) => m.cat))];
  $("filters").innerHTML = cats
    .map((c) => `<button class="${c === activeCat ? "active" : ""}" data-cat="${c}">${c}</button>`)
    .join("");
}

function renderMenu() {
  const items = MENU.filter((m) => activeCat === "All" || m.cat === activeCat);
  $("menuGrid").innerHTML = items
    .map((m) => `
      <article class="item">
        <img src="${m.image}" alt="${m.name}" loading="lazy">
        <div class="item-body">
          <h3>${m.name}</h3>
          <p>${m.desc}</p>
          <div class="item-foot">
            <span class="price">${money(m.price)}</span>
            <button class="btn btn-small" data-add="${m.id}">Add</button>
          </div>
        </div>
      </article>`)
    .join("");
}

/* ---------- Cart ---------- */
function cartLines() {
  return Object.entries(cart).map(([id, qty]) => {
    const item = MENU.find((m) => m.id === Number(id));
    return { ...item, qty, line: item.price * qty };
  });
}

function renderCart() {
  const lines = cartLines();
  const total = lines.reduce((s, l) => s + l.line, 0);
  const count = lines.reduce((s, l) => s + l.qty, 0);

  $("cartItems").innerHTML = lines.length
    ? lines.map((l) => `
        <div class="cart-row">
          <div>${l.name}<small>${money(l.price)} each</small></div>
          <div class="qty">
            <button type="button" data-dec="${l.id}" aria-label="Remove one">&minus;</button>
            <span>${l.qty}</span>
            <button type="button" data-inc="${l.id}" aria-label="Add one">+</button>
          </div>
          <strong>${money(l.line)}</strong>
        </div>`).join("")
    : '<p class="muted">Your cart is empty. Add something from the menu.</p>';

  $("cartTotal").textContent = money(total);
  $("navCount").textContent = count;
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  renderCart();
}

/* ---------- Events ---------- */
$("filters").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-cat]");
  if (!btn) return;
  activeCat = btn.dataset.cat;
  renderFilters();
  renderMenu();
});

$("menuGrid").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-add]");
  if (!btn) return;
  changeQty(Number(btn.dataset.add), 1);
  btn.textContent = "Added ✓";
  setTimeout(() => (btn.textContent = "Add"), 800);
});

$("cartItems").addEventListener("click", (e) => {
  const inc = e.target.closest("[data-inc]");
  const dec = e.target.closest("[data-dec]");
  if (inc) changeQty(Number(inc.dataset.inc), 1);
  if (dec) changeQty(Number(dec.dataset.dec), -1);
});

// Show the address box only for delivery
document.querySelectorAll('input[name="order_type"]').forEach((r) =>
  r.addEventListener("change", () => {
    const delivery = document.querySelector('input[name="order_type"]:checked').value === "Delivery";
    $("addressField").hidden = !delivery;
    $("addressField").querySelector("textarea").required = delivery;
  })
);

// Build the order text and send the form to your email
$("orderForm").addEventListener("submit", (e) => {
  const lines = cartLines();
  if (!lines.length) {
    e.preventDefault();
    $("formError").textContent = "Please add at least one item to your order.";
    return;
  }
  $("formError").textContent = "";
  const total = lines.reduce((s, l) => s + l.line, 0);
  $("orderDetails").value = lines.map((l) => `${l.qty} x ${l.name} (${money(l.line)})`).join("\n");
  $("orderTotal").value = money(total);
});

/* ---------- Start ---------- */
$("year").textContent = new Date().getFullYear();
renderFilters();
renderMenu();
renderCart();
