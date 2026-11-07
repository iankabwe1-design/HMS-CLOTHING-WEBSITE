// HMS Clothing Store - script.js
// One file for every page (home, new arrivals, cart, about, contact)
// so the whole website behaves the same way.


// ---------- SETTINGS ----------

// shop WhatsApp number (wa.me wants it without the + sign)
let shopNumber = "260766316514";

// the home page is outside the "pages" folder, so its paths are different
let inPages = window.location.pathname.toLowerCase().indexOf("/pages/") !== -1;
let imageFolder = "Media/Images/";
let homeLink = "index(shop).html";
let pagesFolder = "pages/";

if (inPages) {
    imageFolder = "../Media/Images/";
    homeLink = "../index(shop).html";
    pagesFolder = "";
}

// every product in the shop, the search bar looks inside this list.
// NOTE: if you add a new product in the html, add it here too.
let products = [
    { name: "Combo", price: 500, image: "IMG-20261006-WA0103.jpg", category: "Men's Fashion", page: "home" },
    { name: "Full Suit", price: 2000, image: "mensuit.jpg", category: "Men's Fashion", page: "home" },
    { name: "Brown Leather Shoes", price: 2000, image: "brownleather.jpg", category: "Men's Fashion", page: "home" },

    { name: "High Heels", price: 750, image: "IMG-20261006-WA0067.jpg", category: "Accessories", page: "home" },
    { name: "Wrist Watch", price: 500, image: "IMG-20261006-WA0091.jpg", category: "Accessories", page: "home" },
    { name: "Malachite Heart Necklace", price: 1000, image: "necklace.png", category: "Accessories", page: "home" },

    { name: "Dinner Dress", price: 650, image: "blue long dress.jpg", category: "Women's Fashion", page: "home" },
    { name: "Bottom Dress", price: 850, image: "blackwhitedress.jpg", category: "Women's Fashion", page: "home" },
    { name: "Flower Dress", price: 250, image: "flowerdress.jpg", category: "Women's Fashion", page: "home" },

    { name: "Vintage mini bags", price: 250, image: "IMAGE 1.jpeg", category: "Mini bags", page: "newarrivals" },
    { name: "French Mini bags", price: 300, image: "IMAGE 9.jpeg", category: "Mini bags", page: "newarrivals" },
    { name: "Kompak bags", price: 500, image: "blackkompak.jpg", category: "Mini bags", page: "newarrivals" },

    { name: "Vin jeans", price: 350, image: "IMAGE 2.jpeg", category: "Womens wear", page: "newarrivals" },
    { name: "Retro loose jeans", price: 400, image: "IMAGE 10.jpeg", category: "Womens wear", page: "newarrivals" },
    { name: "Off-the-shoulder dresses", price: 300, image: "IMAGE 12.jpeg", category: "Womens wear", page: "newarrivals" },

    { name: "Reginald loafer", price: 1000, image: "brownwhite.jpg", category: "Mens wear", page: "newarrivals" },
    { name: "Smart neck-ties", price: 150, image: "IMAGE 7.jpeg", category: "Mens wear", page: "newarrivals" },
    { name: "Combo", price: 750, image: "whitejacket.jpg", category: "Mens wear", page: "newarrivals" }
];


// ---------- SMALL HELPERS ----------

// 2000 becomes K2,000
function formatPrice(amount) {
    return "K" + amount.toLocaleString("en-US");
}

// takes "Buy = K2,000 " and gives back 2000
function getPriceNumber(text) {
    return Number(text.replace(/[^0-9]/g, ""));
}

// takes "../Media/Images/mensuit.jpg" and gives back "mensuit.jpg"
function getFileName(path) {
    let parts = path.split("/");
    return parts[parts.length - 1].trim();
}

// link to the page where a product lives
function getPageLink(page) {
    if (page === "home") {
        return homeLink;
    }
    return pagesFolder + "newarrivals.html";
}

// are we already on that page?
function isOnPage(page) {
    let path = window.location.pathname.toLowerCase();
    if (page === "newarrivals") {
        return path.indexOf("newarrivals") !== -1;
    }
    return inPages === false;
}

// little black message at the bottom of the screen
let toastTimer = null;

function showMessage(text) {
    let toast = document.getElementById("toast");
    if (toast === null) {
        toast = document.createElement("div");
        toast.id = "toast";
        document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 2500);
}


// ---------- CART ----------

// the cart is saved in the browser so it stays when the customer changes pages
function getCart() {
    let saved = localStorage.getItem("hmsCart");
    if (saved === null) {
        return [];
    }
    try {
        return JSON.parse(saved);
    } catch (error) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem("hmsCart", JSON.stringify(cart));
}

function addToCart(name, price, image) {
    let cart = getCart();
    let found = false;

    // if it's already in the cart just add one more
    for (let i = 0; i < cart.length; i++) {
        if (cart[i].name === name && cart[i].price === price) {
            cart[i].qty = cart[i].qty + 1;
            found = true;
        }
    }

    if (found === false) {
        cart.push({ name: name, price: price, image: image, qty: 1 });
    }

    saveCart(cart);
    updateCartCount();
    showCart();
    showMessage(name + " added to cart");
}

function changeQty(index, change) {
    let cart = getCart();
    cart[index].qty = cart[index].qty + change;

    // if it goes to 0 take it out of the cart
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }

    saveCart(cart);
    updateCartCount();
    showCart();
}

function removeItem(index) {
    let cart = getCart();
    let removed = cart[index].name;
    cart.splice(index, 1);

    saveCart(cart);
    updateCartCount();
    showCart();
    showMessage(removed + " removed");
}

function clearCart() {
    let cart = getCart();
    if (cart.length === 0) {
        showMessage("Your cart is already empty");
        return;
    }

    let sure = confirm("Do you want to remove everything from your cart?");
    if (sure) {
        localStorage.removeItem("hmsCart");
        updateCartCount();
        showCart();
        showMessage("Cart cleared");
    }
}

// shows "Cart (3)" in the menu on every page
function updateCartCount() {
    let cart = getCart();
    let totalItems = 0;
    for (let i = 0; i < cart.length; i++) {
        totalItems = totalItems + cart[i].qty;
    }

    let links = document.querySelectorAll(".nav-links a");
    for (let i = 0; i < links.length; i++) {
        let href = links[i].getAttribute("href");
        if (href !== null && href.indexOf("cart.html") !== -1) {
            if (totalItems > 0) {
                links[i].textContent = "Cart (" + totalItems + ")";
            } else {
                links[i].textContent = "Cart";
            }
        }
    }
}

// draws the items on the cart page and works out the totals
function showCart() {
    let box = document.getElementById("cart-items");
    if (box === null) {
        return; // not on the cart page
    }

    let cart = getCart();
    let html = "";
    let totalItems = 0;
    let totalAmount = 0;

    if (cart.length === 0) {
        html = '<p class="empty-cart">Your cart is empty. <a href="' + homeLink + '">Go and pick something nice</a></p>';
    }

    for (let i = 0; i < cart.length; i++) {
        let lineTotal = cart[i].price * cart[i].qty;
        totalItems = totalItems + cart[i].qty;
        totalAmount = totalAmount + lineTotal;

        html = html + '<div class="cart-item">';
        html = html + '<img src="' + imageFolder + cart[i].image + '" alt="' + cart[i].name + '">';
        html = html + '<div class="cart-item-info">';
        html = html + '<strong>' + cart[i].name + '</strong>';
        html = html + '<span>' + formatPrice(cart[i].price) + ' each</span>';
        html = html + '</div>';
        html = html + '<div class="cart-item-qty">';
        html = html + '<button type="button" onclick="changeQty(' + i + ', -1)">-</button>';
        html = html + '<span>' + cart[i].qty + '</span>';
        html = html + '<button type="button" onclick="changeQty(' + i + ', 1)">+</button>';
        html = html + '</div>';
        html = html + '<div class="cart-item-total">' + formatPrice(lineTotal) + '</div>';
        html = html + '<button type="button" class="remove-btn" onclick="removeItem(' + i + ')">Remove</button>';
        html = html + '</div>';
    }

    box.innerHTML = html;
    document.getElementById("cart-count").textContent = totalItems;
    document.getElementById("cart-total").textContent = formatPrice(totalAmount);
}

// sends the order to the shop on WhatsApp
function checkout() {
    let cart = getCart();
    if (cart.length === 0) {
        showMessage("Your cart is empty, add something first");
        return;
    }

    let total = 0;
    let message = "Hello HMS Clothing Store, I would like to order:\n\n";

    for (let i = 0; i < cart.length; i++) {
        let lineTotal = cart[i].price * cart[i].qty;
        total = total + lineTotal;
        message = message + (i + 1) + ". " + cart[i].name + " x" + cart[i].qty + " = " + formatPrice(lineTotal) + "\n";
    }

    message = message + "\nTotal: " + formatPrice(total);
    message = message + "\n\nPlease confirm if these are available and how I can pay and get them. Thank you!";

    window.open("https://wa.me/" + shopNumber + "?text=" + encodeURIComponent(message), "_blank");
}


// ---------- CLICKABLE PRICES ----------

// clicking a price button puts that product in the cart
function setupPrices() {
    let prices = document.querySelectorAll(".product-section .price");

    for (let i = 0; i < prices.length; i++) {
        prices[i].title = "Click to add to cart";

        prices[i].addEventListener("click", function () {
            let nameTag = prices[i].previousElementSibling;
            let picture = nameTag.previousElementSibling;

            let name = nameTag.textContent.trim();
            let price = getPriceNumber(prices[i].textContent);
            let image = getFileName(picture.getAttribute("src"));

            addToCart(name, price, image);
        });
    }
}


// ---------- SEARCH ----------

// checks one typed word against the product text
// (also tries it without the "s" so "dresses" finds "dress")
function wordMatches(text, word) {
    if (text.indexOf(word) !== -1) {
        return true;
    }
    if (word.length > 3 && word.slice(-2) === "es" && text.indexOf(word.slice(0, -2)) !== -1) {
        return true;
    }
    if (word.length > 3 && word.slice(-1) === "s" && text.indexOf(word.slice(0, -1)) !== -1) {
        return true;
    }
    return false;
}

// finds the product on the page and puts a gold border on it for a few seconds
function highlightProduct(name, price) {
    let prices = document.querySelectorAll(".product-section .price");

    for (let i = 0; i < prices.length; i++) {
        let nameTag = prices[i].previousElementSibling;
        let itemName = nameTag.textContent.trim();
        let itemPrice = getPriceNumber(prices[i].textContent);

        if (itemName === name && itemPrice === price) {
            let picture = nameTag.previousElementSibling;
            picture.scrollIntoView({ behavior: "smooth", block: "center" });
            picture.classList.add("found");
            prices[i].classList.add("found");

            setTimeout(function () {
                picture.classList.remove("found");
                prices[i].classList.remove("found");
            }, 4000);
            return;
        }
    }
}

// when we arrive from a search result the link has ?find=name&price=500
function highlightFromUrl() {
    let params = new URLSearchParams(window.location.search);
    let name = params.get("find");
    let price = Number(params.get("price"));

    if (name !== null) {
        highlightProduct(name, price);
    }
}

function setupSearch() {
    let input = document.getElementById("search-input");
    let button = document.getElementById("search-btn");
    let results = document.getElementById("search-results");

    if (input === null) {
        return;
    }

    let matches = []; // what the last search found

    function closeResults() {
        results.classList.remove("open");
    }

    // go to the product (or just highlight it if we're already on that page)
    function openProduct(product) {
        closeResults();
        if (isOnPage(product.page)) {
            highlightProduct(product.name, product.price);
        } else {
            window.location.href = getPageLink(product.page) + "?find=" + encodeURIComponent(product.name) + "&price=" + product.price;
        }
    }

    function doSearch() {
        let text = input.value.trim().toLowerCase();
        matches = [];

        if (text === "") {
            closeResults();
            return;
        }

        let words = text.split(" ");

        for (let i = 0; i < products.length; i++) {
            let productText = (products[i].name + " " + products[i].category).toLowerCase();
            let allWordsFound = true;

            for (let j = 0; j < words.length; j++) {
                if (words[j] !== "" && wordMatches(productText, words[j]) === false) {
                    allWordsFound = false;
                }
            }

            if (allWordsFound) {
                matches.push(products[i]);
            }
        }

        if (matches.length === 0) {
            results.innerHTML = '<div class="no-result"></div>';
            results.firstChild.textContent = 'No products found for "' + input.value.trim() + '"';
        } else {
            let html = "";
            for (let i = 0; i < matches.length; i++) {
                html = html + '<div class="result-row" data-index="' + i + '">';
                html = html + '<img src="' + imageFolder + matches[i].image + '" alt="' + matches[i].name + '">';
                html = html + '<div class="result-info">';
                html = html + '<strong>' + matches[i].name + '</strong>';
                html = html + '<small>' + matches[i].category + ' - ' + formatPrice(matches[i].price) + '</small>';
                html = html + '</div>';
                html = html + '<button type="button" class="result-add" data-index="' + i + '">Add</button>';
                html = html + '</div>';
            }
            results.innerHTML = html;
        }

        results.classList.add("open");
    }

    // search while typing
    input.addEventListener("input", doSearch);

    // Enter opens the first match, Escape closes the list
    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            doSearch();
            if (matches.length > 0) {
                openProduct(matches[0]);
            }
        }
        if (event.key === "Escape") {
            closeResults();
        }
    });

    // the Search button
    button.addEventListener("click", function () {
        if (input.value.trim() === "") {
            showMessage("Type what you are looking for first");
            input.focus();
            return;
        }
        doSearch();
        if (matches.length > 0) {
            openProduct(matches[0]);
        }
    });

    // clicks inside the results list (Add button or the row itself)
    results.addEventListener("click", function (event) {
        let addButton = event.target.closest(".result-add");
        let row = event.target.closest(".result-row");

        if (addButton !== null) {
            let item = matches[addButton.getAttribute("data-index")];
            addToCart(item.name, item.price, item.image);
        } else if (row !== null) {
            openProduct(matches[row.getAttribute("data-index")]);
        }
    });

    // click anywhere else and the list closes
    document.addEventListener("click", function (event) {
        if (event.target.closest(".search-bar") === null) {
            closeResults();
        }
    });
}


// ---------- CONTACT FORM ----------

// instead of sending the form, we open WhatsApp with the message already typed
function setupContactForm() {
    let form = document.querySelector(".contact-form form");
    if (form === null) {
        return; // not on the contact page
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        let name = document.getElementById("name").value.trim();
        let email = document.getElementById("email").value.trim();
        let phone = document.getElementById("phone").value.trim();
        let message = document.getElementById("message").value.trim();
        let rating = document.getElementById("rating");

        // quick checks
        if (name === "" || email === "" || phone === "") {
            showMessage("Please fill in your name, email and phone number");
            return;
        }
        if (phone.replace(/[^0-9]/g, "").length < 9) {
            showMessage("That phone number looks too short");
            return;
        }
        if (message === "") {
            showMessage("Please write your message first");
            document.getElementById("message").focus();
            return;
        }

        let text = "Hello HMS Clothing Store,\n\n";
        text = text + "Name: " + name + "\n";
        text = text + "Email: " + email + "\n";
        text = text + "Phone: " + phone + "\n\n";
        text = text + "Message: " + message + "\n";

        // rating is optional
        if (rating.value !== "") {
            text = text + "\nMy experience: " + rating.options[rating.selectedIndex].text + " (" + rating.value + "/5)";
        }

        window.open("https://wa.me/" + shopNumber + "?text=" + encodeURIComponent(text), "_blank");
        showMessage("Opening WhatsApp...");
        form.reset();
    });
}


// ---------- START EVERYTHING ----------

updateCartCount();
setupPrices();
setupSearch();
showCart();
setupContactForm();
highlightFromUrl();
