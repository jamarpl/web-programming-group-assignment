let cart = JSON.parse(localStorage.getItem('skateprosCart')) || [];

// shared functions
function updateCartUI() {
  const cartCount = document.querySelector('.cart-count');
  if (cartCount) {
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
  }
}

function saveCart() {
  localStorage.setItem('skateprosCart', JSON.stringify(cart));
}

function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenu) {
    mobileMenu.style.display = mobileMenu.style.display === 'flex' ? 'none' : 'flex';
  } // toggles the if the mobile menu displays by swapping the attribute - 2.b
}

// cart management functions
function addToCart(productId, productName, productPrice, productImage) {
  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: productId,
      name: productName,
      image: productImage,
      price: productPrice,
      quantity: 1
    });
  }

  saveCart();
  updateCartUI();
  alert(`${productName} added to cart!`);

  // Adds an item to the cart if it doesn't exist. If it does, it increases the quantity py one - 2.d
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI(); // rremoves the item by it's id - 2.d
}

function updateQuantity(productId, newQuantity) {
  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity = parseInt(newQuantity);
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart();
      updateCartUI();
    }
  }

  // Updates the quantity to a new int value. if it's less than or equal to 0, it removes it from the cart - 2.d
}

function clearCart() {
  if (confirm('Are you sure you want to clear the cart?')) {
    cart = [];
    saveCart();
    updateCartUI();
    displayCart();
    updateCartSummary();
  } // saves the cart as an empty array - 2.b
}

// calculation functions
function calculateSubtotal() {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  //reduce simplifies an array to a single value. here, it sums the total price for each item and their quantity - 2.d
}

function calculateDiscount(subtotal) {
  return subtotal > 50000 ? subtotal * 0.10 : 0;
} // returns a 10% discount if the subtotal is over 50000 - 2.d

function calculateTax(subtotal, discount) {
  const taxableAmount = subtotal - discount;
  return taxableAmount * 0.15;
} // returns 15% tax from the taxable amount - 2.d

function calculateTotal() {
  const subtotal = calculateSubtotal();
  const discount = calculateDiscount(subtotal);
  const tax = calculateTax(subtotal, discount);
  return {
    subtotal: subtotal,
    discount: discount,
    tax: tax,
    total: subtotal - discount + tax
  };

  // returns the subtotal, discount, tax, and total - 2.d
}

// products page functions
function filterProducts(category) {
  const products = document.querySelectorAll('.product-card');

  products.forEach(product => {
    if (category === 'all' || product.getAttribute('data-category') === category) {
      product.style.display = 'block';
    } else {
      product.style.display = 'none';
    }
  });

  // toggles the display value for each product if it's the same as the entered value - 2.a, 2.d
}

// cart page functions
function displayCart() {
  const cartTableBody = document.getElementById('cartTableBody');

  if (cart.length === 0) {
    cartTableBody.innerHTML = '<tr id="emptyCart"><td colspan="5" style="text-align: center; padding: 2rem;">Your cart is empty. <a href="products.html">Continue shopping</a></td></tr>';
    return;
  }

  // returns an empty table with a message if there's no items in the cart - 2.a

  cartTableBody.innerHTML = ''; // initializes the table - 2.a

  cart.forEach(item => {
    const subtotal = item.price * item.quantity;
    const row = document.createElement('tr');
    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.value = item.quantity;
    quantityInput.min = 1;

    row.innerHTML = `
        <td>${item.name}</td>
        <td>$${item.price} JMD</td>
        <td id="quantity-${item.id}"></td>
        <td>$${subtotal} JMD</td>
        <td><button class="remove-btn" data-product-id="${item.id}">Remove</button></td>
    `;

    // generates a row for each item - 2.a

    const quantityCell = row.querySelector(`#quantity-${item.id}`);
    quantityCell.appendChild(quantityInput);

    // adds an input field for each row - 2.a

    quantityInput.addEventListener('change', function() {
      updateQuantity(item.id, this.value);
      displayCart();
      updateCartSummary();
    });

    // listens for input, update the quantity - 2.b

    const removeBtn = row.querySelector('.remove-btn');
    removeBtn.addEventListener('click', function() {
      removeFromCart(item.id);
      displayCart();
      updateCartSummary();
    });

    //listens for a click on the remove button, removes the item from the cart and displays it again - 2.b

    cartTableBody.appendChild(row);
  });
}

function updateCartSummary() {
  const totals = calculateTotal();

  document.getElementById('subtotal').textContent = `$${totals.subtotal} JMD`;
  document.getElementById('discount').textContent = `$${totals.discount} JMD`;
  document.getElementById('tax').textContent = `$${totals.tax} JMD`;
  document.getElementById('total').textContent = `$${totals.total} JMD`;

  // calculates the totals and sets them on the site - 2.a
}

// checkout page functions
function displayCheckoutSummary() {
  const checkoutTableBody = document.getElementById('checkoutTableBody');

  if (cart.length === 0) {
    checkoutTableBody.innerHTML = '<tr id="emptyCheckout"><td colspan="3" style="text-align: center; padding: 2rem;">No items in cart. <a href="products.html">Continue shopping</a></td></tr>';
    return;
  }

  checkoutTableBody.innerHTML = '';
  cart.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>$${(item.price * item.quantity)} JMD</td>
    `;
    checkoutTableBody.appendChild(row);
  });

  updateCheckoutSummary();

  // makes a row for each item, if not, returns an empty table - 2.a
}

function updateCheckoutSummary() {
  const totals = calculateTotal();

  document.getElementById('checkoutSubtotal').textContent = `$${totals.subtotal} JMD`;
  document.getElementById('checkoutDiscount').textContent = `$${totals.discount} JMD`;
  document.getElementById('checkoutTax').textContent = `$${totals.tax} JMD`;
  document.getElementById('checkoutTotal').textContent = `$${totals.total} JMD`;
}

// form validation functions
function validateEmail(email) {
  return email.includes('@') && email.includes('.') && email.lastIndexOf('@') < email.lastIndexOf('.');
}

function validateLoginForm(username, password) {
  let isValid = true;

  if (!username || username.trim() === '') {
    alert('Username or email is required.');
    isValid = false;
  } else if (!password || password.trim() === '') {
    alert('Password is required.');
    isValid = false;
  } else if (password.length < 6) {
    alert('Password must be at least 6 characters long.');
    isValid = false;
  }

  return isValid;

  // checks the login validity - 2.c, 2.d
}

function validateRegisterForm(fullName, dob, email, username, password, confirmPassword) {
  let isValid = true;

  if (!fullName || fullName.trim() === '') {
    alert('Full name is required.');
    isValid = false;
  } else if (!dob || dob.trim() === '') {
    alert('Date of birth is required.');
    isValid = false;
  } else if (!email || email.trim() === '') {
    alert('Email is required.');
    isValid = false;
  } else if (!validateEmail(email)) {
    alert('Please enter a valid email address.');
    isValid = false;
  } else if (!username || username.trim() === '') {
    alert('Username is required.');
    isValid = false;
  } else if (username.length < 3) {
    alert('Username must be at least 3 characters long.');
    isValid = false;
  } else if (!password || password.trim() === '') {
    alert('Password is required.');
    isValid = false;
  } else if (password.length < 6) {
    alert('Password must be at least 6 characters long.');
    isValid = false;
  } else if (!confirmPassword || confirmPassword.trim() === '') {
    alert('Please confirm your password.');
    isValid = false;
  } else if (password !== confirmPassword) {
    alert('Passwords do not match.');
    isValid = false;
  }

  return isValid;

  // validates the registration form. not that it's written anywhere though - 2.c, 2.d
}

// event listeners
document.addEventListener('DOMContentLoaded', function() {

  updateCartUI();

  const menuBtn = document.querySelector('.nav-menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', toggleMobileMenu);
  } // adds a listener to enable the toggle functionality - 2.b

  const addToCartButtons = document.querySelectorAll('.add-btn');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', function() {
      const productId = parseInt(this.getAttribute('data-product-id'));
      const productName = this.getAttribute('data-product-name');
      const productImage = this.getAttribute('data-product-image');
      const productPrice = parseInt(this.getAttribute('data-product-price'));

      if (productId && productName && productPrice) {
        addToCart(productId, productName, productPrice, productImage);
      }
    });
  }); // adds buttons for each product - 2.b

  const filterButtons = document.querySelectorAll('.sidebar li');
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      const category = this.getAttribute('data-category');
      filterProducts(category);
    });
  }); // adds an on-click listener to the sidebar. filters by category when clicked - 2.b

  const cartTableBody = document.getElementById('cartTableBody');
  if (cartTableBody) {
    displayCart();
    updateCartSummary();

    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', clearCart);
    }
  }

  const checkoutTableBody = document.getElementById('checkoutTableBody');
  if (checkoutTableBody) {
    displayCheckoutSummary();
  }

  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function(e) {
      e.preventDefault();
      cart = [];
      saveCart();
      updateCartUI();
      alert('Order confirmed! Thank you for your purchase.');
      checkoutForm.reset();
    });
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      if (validateLoginForm(username, password)) {
        alert('Login successful!');
        loginForm.reset();
      }
    });
  } // on-submit listener for the login form - 2.b, 2.c

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const fullName = document.getElementById('fullName').value;
      const dob = document.getElementById('dob').value;
      const email = document.getElementById('email').value;
      const username = document.getElementById('regUsername').value;
      const password = document.getElementById('regPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (validateRegisterForm(fullName, dob, email, username, password, confirmPassword)) {
        alert('Registration successful!');
        registerForm.reset();
      }
    });
  } // on-submit listener for the registration form. resets it after - 2.b, 2.c
});
