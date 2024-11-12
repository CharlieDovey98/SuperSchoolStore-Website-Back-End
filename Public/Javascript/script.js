// JavaScript for the S3 Website.

// Const elements by id within the website.
const scrollToTop = document.getElementById("scrollToTop");
const landingPage = document.getElementById("landingPage");
const shoppingPage = document.getElementById("shoppingPage");
const headerContainer = document.getElementById("headerContainer");
const checkoutPage = document.getElementById("checkoutPage");

// This function toggles the display of the Shopping Page section to 'block', making it visible. Need to change to vue.js code
function toggleShoppingPage() {
  landingPage.style.display = "none";
  checkoutPage.style.display = "none";
  shoppingPage.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// This function toggles the display of the About Us Page section to 'block', making it visible. Need to change to vue.js code
function toggleAboutUs() {
  shoppingPage.style.display = "none";
  checkoutPage.style.display = "none";
  landingPage.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// This function toggles the display of the checkout Page section to 'block', making it visible. Need to change to vue.js code
function toggleCheckoutPage() {
  shoppingPage.style.display = "none";
  landingPage.style.display = "none";
  checkoutPage.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
