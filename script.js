// Загрузка данных из JSON
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentPage = 1;
const productsPerPage = 25;

async function loadData() {
  const response = await fetch('data.json');
  products = await response.json();
  renderProducts(products);
  updateCartUI();
  const prices = products.map(item => item.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  document.getElementById('price-range').min = minPrice;
  document.getElementById('price-range').max = maxPrice;
  updateMenu();
}

// Рендеринг товаров с пагинацией
function renderProducts(filteredProducts) {
  const productsContainer = document.getElementById('products');
  productsContainer.innerHTML = '';

  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  paginatedProducts.forEach(product => {
    const productElement = document.createElement('div');
    productElement.classList.add('product');
    productElement.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>Цена: ${product.price} руб.</p>
      <button class="add-to-cart" data-id="${product.id}">Добавить в корзину</button>
    `;
    productElement.querySelector('img').addEventListener('click', () => openModal(product));
    productElement.querySelector('.add-to-cart').addEventListener('click', () => addToCart(product));
    productsContainer.appendChild(productElement);
  });

  updatePagination(filteredProducts.length);
}

// Обновление пагинации
function updatePagination(totalProducts) {
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const pageInfo = document.getElementById('page-info');
  pageInfo.textContent = `Страница ${currentPage} из ${totalPages}`;

  const prevButton = document.getElementById('prev-page');
  const nextButton = document.getElementById('next-page');

  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;
}

// Фильтрация по категории
function filterByCategory(category) {
  const filtered = products.filter(product => product.category === category);
  currentPage = 1;
  renderProducts(filtered);
}

// Фильтрация товаров
function filterProducts() {
  const searchQuery = document.getElementById('search').value.toLowerCase();
  const priceRange = document.getElementById('price-range').value;
  const minPriceInput = document.getElementById('minPrice');
  const maxPriceInput = document.getElementById('maxPrice');
  const priceMin = 0;
  const priceMax = parseInt(priceRange);


  const filtered = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery);
    let matchesPrice = product.price >= priceMin && product.price <= priceMax;
    return matchesSearch && matchesPrice;
  });

  currentPage = 1;
  renderProducts(filtered);
}

// Сортировка товаров
function sortProducts() {
  const sortBy = document.getElementById('sort').value;
  let sortedProducts = [...products];

  if (sortBy === 'price-asc') {
    sortedProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    sortedProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'name-asc') {
    sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'name-desc') {
    sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
  }

  renderProducts(sortedProducts);
}

// Открытие модального окна с деталями товара
function openModal(product) {
  const modal = document.getElementById('modal');
  const modalDetails = document.getElementById('modal-details');
  modalDetails.innerHTML = `
    <h2>${product.name}</h2>
    <img src="${product.image}" alt="${product.name}">
    <p>${product.description}</p>
    <p>Цена: ${product.price} руб.</p>
    <p>Категория: ${product.category}</p>
  `;
  modal.style.display = 'block';
}

// Закрытие модального окна
document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('modal').style.display = 'none';
});

// Добавление товара в корзину
function addToCart(product) {
  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
}

// Обновление интерфейса корзины
function updateCartUI() {
  const cartCount = document.getElementById('cart-count');
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');

  cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartItems.innerHTML = cart.map(item => `
    <li>
      ${item.name} - ${item.price} руб. x ${item.quantity}
    </li>
  `).join('');
  cartTotal.textContent = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Открытие корзины
document.getElementById('cart-button').addEventListener('click', () => {
  document.getElementById('cart-modal').style.display = 'block';
});

// Закрытие корзины
document.querySelector('#cart-modal .close').addEventListener('click', () => {
  document.getElementById('cart-modal').style.display = 'none';
});

// Оформление заказа
document.getElementById('checkout-button').addEventListener('click', () => {
  document.getElementById('cart-modal').style.display = 'none';
  document.getElementById('order-modal').style.display = 'block';
});

// Закрытие модального окна оформления заказа
document.querySelector('#order-modal .close').addEventListener('click', () => {
  document.getElementById('order-modal').style.display = 'none';
});

// Обработка формы оформления заказа
document.getElementById('order-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;

  if (name && phone && address) {
    alert(`Заказ оформлен!\nИмя: ${name}\nТелефон: ${phone}\nАдрес: ${address}`);
    cart = [];
    localStorage.removeItem('cart');
    updateCartUI();
    document.getElementById('order-modal').style.display = 'none';
  } else {
    alert('Пожалуйста, заполните все поля!');
  }
});

// Обработчики событий для подменю

document.querySelectorAll('details a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const category = link.getAttribute('data-category');
    filterByCategory(category);
  });
});

// Обработчики событий для фильтрации
document.getElementById('search').addEventListener('input', filterProducts);
const priceRange = document.getElementById('price-range');
const minPriceInput = document.getElementById('minPrice');
const maxPriceInput = document.getElementById('maxPrice');
document.getElementById('price-range').addEventListener('input', () => {
  const priceRangeValue = document.getElementById('price-range').value;
  document.getElementById('price-range-value').textContent = `${priceRangeValue} руб.`;
  filterProducts();
});
////////////////////////////////////////

priceRange.addEventListener('input', function() {
  minPriceInput.value = 0;
  maxPriceInput.value = priceRange.value;
  filterProducts();
});

maxPriceInput.addEventListener('input', function() {
  minPriceInput.value = 0;
  priceRange.value = maxPriceInput.value;
  const priceRangeValue = document.getElementById('price-range').value;
  document.getElementById('price-range-value').textContent = `${priceRangeValue}`;
  filterProducts();
});

minPriceInput.addEventListener('input', filterProducts);
maxPriceInput.addEventListener('input', filterProducts);
////////////////////////////////////////
document.getElementById('sort').addEventListener('change', sortProducts);

// Обработчики событий для пагинации
document.getElementById('prev-page').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderProducts(products);
  }
});

document.getElementById('next-page').addEventListener('click', () => {
  const totalPages = Math.ceil(products.length / productsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderProducts(products);
  }
});


// Фильтрация по категории
function updateMenu(category) {

  currentPage = 1;
  let element = document.querySelectorAll('.item');
  // Перебираем NodeList
  const elements = document.querySelectorAll('[data-category]');
  const prod = document.getElementById('products');

  let count = 0;
  elements.forEach(element => {
    const filtr = products.filter(product => product.category === element.dataset.category);
    element.innerHTML += ` &nbsp;&nbsp;<span style="color:rgb(14, 13, 14)">${filtr.length}</span>`
  }
  )
};

// Загрузка данных при запуске
loadData();

//Показать все категории товаров
document.getElementById('all_tov').addEventListener('click', () => {
  window.location.reload();
});

//показать панель сортировки и подбора товаров
const podbor = document.getElementById('podbor');
const filt = document.getElementById('filters');
const header = document.querySelector('header');
const originalText = podbor.textContent;
const newText = "Скрыть панель сортировки и подбора товаров";

podbor.addEventListener('click', () => {
  if (podbor.textContent === originalText) {
        podbor.textContent = newText;
        filt.style.visibility = "visible";
        podbor.style.color = "#ff5722";
        header.style.height = "auto";
        header.style.margin = "0 auto";
  } else {
        podbor.textContent = originalText;
        filt.style.visibility = "hidden";
        podbor.style.color = "#fff";
        header.style.height = "300px"
        header.style.display = "flex";
        header.style.margin = "0 auto";

  }
  });
