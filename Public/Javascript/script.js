// JavaScript for the S3 Website using Vue.js

let app = new Vue({
  el: "#App",
  data: {
    currentPage: "aboutUs", // currentPage sets the landing page to be presented on website interaction and allows tracking of the current page.
    products: [], // Procucts is inicialised empty ad will attain the lessons from mongoDB database products collectoin.
    cart: [], // Cart is inicialised to empty and will update when the user adds lessons to their cart or removes them.
    sales: { customerPurchases: 101 },
    user: {
      //
      firstName: "",
      lastName: "",
      email: "",
      confirmEmail: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
    payment: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  },
  computed: {
    itemsInTheCart: function () {
      if (this.cart.length == 0) {
        return "";
      } else if (this.cart.length == 1) {
        return `${this.cart.length} item`;
      } else {
        return `${this.cart.length} items`;
      }
    },
    canCheckout() {
      return (
        this.user.firstName &&
        this.user.lastName &&
        this.user.email === this.user.confirmEmail &&
        this.user.password === this.user.confirmPassword &&
        this.user.termsAccepted
      );
    },
  },
  methods: {
    // A try catch to populate products with MongoDB database products collection.
    async fetchProducts() {
      try {
        const response = await fetch("/collections/products");
        const data = await response.json();
        this.products = data;
        console.log("Fetched products:", this.products);
      } catch (error) {
        console.error("Error fetching products from Database:", this.products);
      }
    },

    // A method to add lessons from the shopping page to the users 'Cart'.
    addToCart(product) {
      this.cart.push(product);
      console.log(`${product.title} added to cart.`);
    },

    // A method to remove lessons from the users 'Cart'.
    removeFromCart(index) {
      this.cart.splice(index, 1);
    },

    // A method to scroll to the top of the page.
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    // A method to change the layout of the website to 'about us page'.
    showAboutUs() {
      this.currentPage = "aboutUs";
    },

    // A method to change the layout of the website to 'shopping page'.
    showShoppingPage() {
      this.currentPage = "shopping";
    },

    // A method to change the layout of the website to the 'checkout page'.
    showCheckoutPage() {
      if (this.cart.length == 0) {
        alert("Please add lessons to the cart before proceeding to checkout");
      } else if (this.cart.length > 0) {
        this.currentPage = "checkout";
      }
    },

    // A method to confirm checkout and purchase lessons the user has in their cart. Confirmed with an alert.
    submitCheckout() {
      if (this.canCheckout) {
        alert("Purchase complete, Thank you for shopping with S3!");
      } else {
        alert(
          "Please fill out all required fields correctly and accept the Terms and Conditions."
        );
      }
    },
  },
  created() {
    this.fetchProducts(); // Call fetchProducts() method when the Vue instance is created.
  },
});
