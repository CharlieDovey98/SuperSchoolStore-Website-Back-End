// JavaScript for the S3 Website.

// Const elements by id within the website.
const scrollToTop = document.getElementById("scrollToTop");
const landingPage = document.getElementById("landingPage");
const shoppingPage = document.getElementById("shoppingPage");
const headerContainer = document.getElementById("headerContainer");
const checkoutPage = document.getElementById("checkoutPage");

// This function adds the ability for the user to scroll to the top of the page instantly rather than scrolling up manually.
scrollToTop.addEventListener("click", function (e) {
  e.preventDefault(); // Prevent the URL being updated or page refresh.
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// This function toggles the display of the Shopping Page section to 'block', making it visible.
function toggleShoppingPage() {
  landingPage.style.display = "none";
  checkoutPage.style.display = "none";
  shoppingPage.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// This function toggles the display of the About Us Page section to 'block', making it visible.
function toggleAboutUs() {
  shoppingPage.style.display = "none";
  checkoutPage.style.display = "none";
  landingPage.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// This function toggles the display of the checkout Page section to 'block', making it visible.
function toggleCheckoutPage() {
  shoppingPage.style.display = "none";
  landingPage.style.display = "none";
  checkoutPage.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
