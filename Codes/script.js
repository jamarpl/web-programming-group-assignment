// Current logged-in user
let currentUser = null;

// Save AllProducts to localStorage on page load
function initializeAllProducts() {
  localStorage.setItem('AllProducts', JSON.stringify(products));
}

// Initialize RegistrationData in localStorage if it doesn't exist
function initializeRegistrationData() {
  if (!localStorage.getItem('RegistrationData')) {
    localStorage.setItem('RegistrationData', JSON.stringify([]));
  }
}

// User Management Functions
function getUserByTRN(trn) {
  const registrationData = JSON.parse(localStorage.getItem('RegistrationData')) || [];
  return registrationData.find(user => user.trn === trn);
}

function trnExists(trn) {
  return getUserByTRN(trn) !== undefined;
}

function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function validateTRNFormat(trn) {
  const trnRegex = /^\d{3}-\d{3}-\d{3}$/;
  return trnRegex.test(trn);
}

// Registration Functions
function validateRegistrationFormData(formData) {
  const errors = [];

  if (!formData.firstName || formData.firstName.trim() === '') {
    errors.push('First name is required.');
  }

  if (!formData.lastName || formData.lastName.trim() === '') {
    errors.push('Last name is required.');
  }

  if (!formData.dob || formData.dob.trim() === '') {
    errors.push('Date of birth is required.');
  } else if (calculateAge(formData.dob) < 18) {
    errors.push('You must be at least 18 years old to register.');
  }

  if (!formData.gender || formData.gender.trim() === '') {
    errors.push('Gender is required.');
  }

  if (!formData.phone || formData.phone.trim() === '') {
    errors.push('Phone number is required.');
  }

  if (!formData.email || formData.email.trim() === '') {
    errors.push('Email is required.');
  } else if (!validateEmail(formData.email)) {
    errors.push('Please enter a valid email address.');
  }

  if (!formData.trn || formData.trn.trim() === '') {
    errors.push('TRN is required.');
  } else if (!validateTRNFormat(formData.trn)) {
    errors.push('TRN must be in the format 000-000-000.');
  } else if (trnExists(formData.trn)) {
    errors.push('This TRN is already registered.');
  }

  if (!formData.password || formData.password.trim() === '') {
    errors.push('Password is required.');
  } else if (formData.password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }

  if (!formData.confirmPassword || formData.confirmPassword.trim() === '') {
    errors.push('Please confirm your password.');
  } else if (formData.password !== formData.confirmPassword) {
    errors.push('Passwords do not match.');
  }

  return errors;
}

function registerUser(formData) {
  const registrationData = JSON.parse(localStorage.getItem('RegistrationData')) || [];

  const newUser = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    dob: formData.dob,
    gender: formData.gender,
    phone: formData.phone,
    email: formData.email,
    trn: formData.trn,
    password: formData.password,
    dateOfRegistration: new Date().toISOString().split('T')[0],
    cart: {},
    invoices: [],
    loginAttempts: 0,
    accountLocked: false
  };

  registrationData.push(newUser);
  localStorage.setItem('RegistrationData', JSON.stringify(registrationData));
  return newUser;
}

// Login & Authentication Functions
function validateLoginCredentials(trn, password) {
  const user = getUserByTRN(trn);
  if (!user) {
    return false;
  }
  return user.password === password;
}

function incrementLoginAttempts(trn) {
  const registrationData = JSON.parse(localStorage.getItem('RegistrationData')) || [];
  const user = registrationData.find(u => u.trn === trn);
  if (user) {
    user.loginAttempts = (user.loginAttempts || 0) + 1;
    localStorage.setItem('RegistrationData', JSON.stringify(registrationData));
  }
  return user ? user.loginAttempts : 0;
}

function resetLoginAttempts(trn) {
  const registrationData = JSON.parse(localStorage.getItem('RegistrationData')) || [];
  const user = registrationData.find(u => u.trn === trn);
  if (user) {
    user.loginAttempts = 0;
    localStorage.setItem('RegistrationData', JSON.stringify(registrationData));
  }
}

function loginUser(trn) {
  const user = getUserByTRN(trn);
  if (user) {
    // Load full user object (including cart) into currentUser
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    resetLoginAttempts(trn);
    updateCartUI();
    return true;
  }
  return false;
}

function logoutUser() {
  // Save currentUser back to RegistrationData before logout
  if (currentUser) {
    saveCurrentUser();
  }

  // Clear current user
  currentUser = null;
  localStorage.removeItem('currentUser');

  updateCartUI();
}

function isUserLoggedIn() {
  return localStorage.getItem('currentUser') !== null;
}

function getCurrentUser() {
  // Return currentUser if it exists, otherwise parse from localStorage
  if (currentUser) {
    return currentUser;
  }
  const stored = localStorage.getItem('currentUser');
  if (stored) {
    currentUser = JSON.parse(stored);
    return currentUser;
  }
  return null;
}

// Password Reset Functions
function resetPassword(trn, newPassword) {
  const registrationData = JSON.parse(localStorage.getItem('RegistrationData')) || [];
  const user = registrationData.find(u => u.trn === trn);
  if (user) {
    user.password = newPassword;
    user.loginAttempts = 0;
    user.accountLocked = false;  // Reset login attempts to unlock the account
    localStorage.setItem('RegistrationData', JSON.stringify(registrationData));
    return true;
  }
  return false;
}

// Save currentUser back to RegistrationData
function saveCurrentUser() {
  if (!currentUser) return;
  const registrationData = JSON.parse(localStorage.getItem('RegistrationData')) || [];
  const userIndex = registrationData.findIndex(u => u.trn === currentUser.trn);
  if (userIndex !== -1) {
    registrationData[userIndex] = currentUser;
    localStorage.setItem('RegistrationData', JSON.stringify(registrationData));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }
}

// Products data
const products = [
  {
    id: 1,
    name: "Skate Deck Pro",
    price: 13500,
    description: "Professional-grade skateboard deck with superior grip and durability. Ideal for advanced skaters.",
    image: "../Assets/deck1.webp",
    category: "decks"
  },
  {
    id: 2,
    name: "Wheel Set",
    price: 7500,
    description: "High-quality wheels designed for smooth rides. Perfect for street skating.",
    image: "../Assets/wheels1.webp",
    category: "wheels"
  },
  {
    id: 3,
    name: "Grip Tape",
    price: 3000,
    description: "Premium grip tape to keep your feet secure on your deck.",
    image: "../Assets/tape1.webp",
    category: "parts"
  },
  {
    id: 4,
    name: "Classic Maple Deck",
    price: 11500,
    description: "Traditional maple wood deck with classic design. Great for beginners and intermediate skaters.",
    image: "../Assets/deck2.webp",
    category: "decks"
  },
  {
    id: 5,
    name: "Street King Deck",
    price: 14000,
    description: "Street-focused deck with enhanced pop and control. Perfect for tricks and stunts.",
    image: "../Assets/deck3.webp",
    category: "decks"
  },
  {
    id: 6,
    name: "High Performance Wheels",
    price: 8500,
    description: "Advanced wheel technology for maximum speed and control on any surface.",
    image: "../Assets/wheels2.webp",
    category: "wheels"
  },
  {
    id: 7,
    name: "Soft Cruiser Wheels",
    price: 6500,
    description: "Soft wheels designed for comfortable cruising on rough surfaces.",
    image: "../Assets/wheels3.webp",
    category: "wheels"
  },
  {
    id: 8,
    name: "Truck Set",
    price: 12000,
    description: "Durable aluminum truck set for responsive turning and stability.",
    image: "../Assets/trucks1.webp",
    category: "parts"
  },
  {
    id: 9,
    name: "Bearings Kit",
    price: 5400,
    description: "Precision ABEC bearings for smooth wheel rotation and speed.",
    image: "../Assets/bearings1.webp",
    category: "parts"
  },
  {
    id: 10,
    name: "Hardware Pack",
    price: 1950,
    description: "Complete hardware set including bolts and screws for deck assembly.",
    image: "../Assets/hardware1.webp",
    category: "parts"
  },
  {
    id: 11,
    name: "Bushing Set",
    price: 4200,
    description: "Replacement bushings for improved turning and ride comfort.",
    image: "../Assets/bushings1.webp",
    category: "parts"
  }
];

// Load products dynamically
function loadProducts(productsToRender) {
  const contentDiv = document.querySelector('.content');
  if (!contentDiv) return;

  contentDiv.innerHTML = '';

  productsToRender.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.setAttribute('data-category', product.category);
    productCard.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" class="product-img">
      </div>
      <div class="product-name">${product.name}</div>
      <div class="product-price">$${product.price} JMD</div>
      <button class="add-btn" data-product-id="${product.id}">Add to Cart</button>
    `;
    contentDiv.appendChild(productCard);
  });
}

// shared functions
function updateCartUI() {
  const cartCount = document.querySelector('.cart-count');
  if (cartCount) {
    const currentUser = getCurrentUser();
    const userCart = currentUser && currentUser.cart ? currentUser.cart : {};
    const totalItems = Object.values(userCart).reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
  }
}

function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenu) {
    mobileMenu.style.display = mobileMenu.style.display === 'flex' ? 'none' : 'flex';
  } // toggles the if the mobile menu displays by swapping the attribute - 2.b
}

// cart management functions
function addToCart(productId) {
  // Check if user is logged in
  if (!isUserLoggedIn()) {
    alert('Please login to add items to your cart.');
    window.location.href = 'login.html';
    return;
  }

  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.cart) {
    alert('Error accessing your cart.');
    return;
  }

  // Find product from products array
  const product = products.find(p => p.id === productId);

  if (!product) {
    alert('Product not found');
    return;
  }

  // Add or update item in cart object
  if (currentUser.cart[productId]) {
    currentUser.cart[productId].quantity += 1;
  } else {
    currentUser.cart[productId] = {
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      description: product.description,
      quantity: 1
    };
  }

  saveCurrentUser();
  updateCartUI();
  alert(`${product.name} added to cart!`);

  // Adds an item to the cart if it doesn't exist. If it does, it increases the quantity by one - 2.d
}

function removeFromCart(productId) {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.cart) return;

  delete currentUser.cart[productId];
  saveCurrentUser();
  updateCartUI(); // removes the item by its id - 2.d
}

function updateQuantity(productId, newQuantity) {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.cart) return;

  const item = currentUser.cart[productId];
  if (item) {
    item.quantity = parseInt(newQuantity);
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCurrentUser();
      updateCartUI();
    }
  }

  // Updates the quantity to a new int value. if it's less than or equal to 0, it removes it from the cart - 2.d
}

function clearCart() {
  if (confirm('Are you sure you want to clear the cart?')) {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.cart) {
      currentUser.cart = {};
      saveCurrentUser();
      updateCartUI();
      displayCart();
      updateCartSummary();
    }
  } // clears the cart object - 2.b
}

// calculation functions
function calculateSubtotal() {
  const currentUser = getCurrentUser();
  const userCart = currentUser && currentUser.cart ? currentUser.cart : {};
  return Object.values(userCart).reduce((total, item) => total + (item.price * item.quantity), 0);

  //reduce simplifies an object to a single value. here, it sums the total price for each item and their quantity - 2.d
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
  const currentUser = getCurrentUser();
  const userCart = currentUser && currentUser.cart ? currentUser.cart : {};

  if (Object.keys(userCart).length === 0) {
    cartTableBody.innerHTML = '<tr id="emptyCart"><td colspan="5" style="text-align: center; padding: 2rem;">Your cart is empty. <a href="products.html">Continue shopping</a></td></tr>';
    return;
  }

  // returns an empty table with a message if there's no items in the cart - 2.a

  cartTableBody.innerHTML = ''; // initializes the table - 2.a

  Object.values(userCart).forEach(item => {
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
  const currentUser = getCurrentUser();
  const userCart = currentUser && currentUser.cart ? currentUser.cart : {};

  if (Object.keys(userCart).length === 0) {
    checkoutTableBody.innerHTML = '<tr id="emptyCheckout"><td colspan="3" style="text-align: center; padding: 2rem;">No items in cart. <a href="products.html">Continue shopping</a></td></tr>';
    return;
  }

  checkoutTableBody.innerHTML = '';
  Object.values(userCart).forEach(item => {
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

  // Initialize authentication and products data
  initializeRegistrationData();
  initializeAllProducts();

  // Update cart UI with current user's cart
  updateCartUI();

  // Load products on products page
  const contentDiv = document.querySelector('.content');
  if (contentDiv && contentDiv.children.length === 0) {
    loadProducts(products);
  }

  const menuBtn = document.querySelector('.nav-menu-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', toggleMobileMenu);
  } // adds a listener to enable the toggle functionality - 2.b

  const addToCartButtons = document.querySelectorAll('.add-btn');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', function() {
      const productId = parseInt(this.getAttribute('data-product-id'));

      if (productId) {
        addToCart(productId);
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
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.cart) {
        currentUser.cart = {};
        saveCurrentUser();
        updateCartUI();
        alert('Order confirmed! Thank you for your purchase.');
        checkoutForm.reset();
      }
    });
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const trn = document.getElementById('trn').value;
      const password = document.getElementById('password').value;

      // Validate that fields are filled
      if (!trn || !password) {
        alert('Please enter both TRN and password.');
        return;
      }

      // Check if user exists
      const user = getUserByTRN(trn);
      if (!user) {
        alert('TRN not found. Please register or try again.');
        return;
      }

      // Check if account is already locked
      if (user.loginAttempts >= 3) {
        alert('Your account is locked due to too many failed login attempts. Please reset your password to unlock your account.');
        window.location.href = 'account-locked.html';
        return;
      }

      // Check if credentials are valid
      if (validateLoginCredentials(trn, password)) {
        // Successful login
        loginUser(trn);
        alert('Login successful! Redirecting to products...');
        window.location.href = 'products.html';
      } else {
        // Failed login attempt
        const attempts = incrementLoginAttempts(trn);
        if (attempts >= 3) {
          alert('You have exceeded the maximum number of login attempts (3). Your account is now locked.');
          window.location.href = 'account-locked.html';
        } else {
          alert(`Login failed. Incorrect TRN or password.\nYou have ${3 - attempts} attempt(s) remaining.`);
        }
      }
    });
  }

  // Password reset link handler - redirect to reset password page
  const resetPasswordLink = document.getElementById('resetPasswordLink');
  if (resetPasswordLink) {
    resetPasswordLink.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = 'reset-password.html';
    });
  }

  // Reset password form handler
  const resetPasswordForm = document.getElementById('resetPasswordForm');
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const trn = document.getElementById('resetTrn').value.trim();
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmResetPassword').value;

      const errors = [];

      // Validate TRN is not empty
      if (!trn) {
        errors.push('TRN is required.');
      } else if (!validateTRNFormat(trn)) {
        errors.push('TRN must be in the format 000-000-000.');
      } else if (!trnExists(trn)) {
        errors.push('TRN not found in our records.');
      }

      // Validate new password
      if (!newPassword) {
        errors.push('New password is required.');
      } else if (newPassword.length < 8) {
        errors.push('Password must be at least 8 characters long.');
      }

      // Validate confirm password
      if (!confirmPassword) {
        errors.push('Please confirm your password.');
      } else if (newPassword !== confirmPassword) {
        errors.push('Passwords do not match.');
      }

      // Show all errors at once
      if (errors.length > 0) {
        alert('Password reset failed:\n\n' + errors.join('\n'));
        return;
      }

      // Reset password and unlock account
      if (resetPassword(trn, newPassword)) {
        alert('Password reset successful! Your account has been unlocked. You can now login with your new password.');
        resetPasswordForm.reset();
        window.location.href = 'login.html';
      } else {
        alert('An error occurred. Please try again.');
      }
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        dob: document.getElementById('dob').value,
        gender: document.getElementById('gender').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        trn: document.getElementById('trn').value,
        password: document.getElementById('regPassword').value,
        confirmPassword: document.getElementById('confirmPassword').value
      };

      // Validate form data
      const errors = validateRegistrationFormData(formData);

      if (errors.length > 0) {
        alert('Registration failed:\n\n' + errors.join('\n'));
        return;
      }

      // Register user
      try {
        registerUser(formData);
        alert('Registration successful! You can now login with your TRN and password.');
        registerForm.reset();
        window.location.href = 'login.html';
      } catch (error) {
        alert('An error occurred during registration. Please try again.');
      }
    });
  }
});
