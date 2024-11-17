// JavaScript for the S3 Website using Vue.js

let app = new Vue({
  el: "#App",
  data: {
    currentPage: "aboutUs", // currentPage sets the landing page to be presented on website interaction and allows tracking of the current page.
    products: [], // Procucts is inicialised empty and will attain the lessons from mongoDB database products collection.
    searchQuery: "", // A string for keyword searching.
    selectedSort: "", // Selected key for sorting (location, price, length, availability, subject).
    sortOrder: "", // Ascending, descending or no sorting order.
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
    // A computed method to filter and sort the lessons on the shopping page by a keyword search of filter options.
    filterAndSortProducts() {
      let filteredProducts = this.products; // Initialise an array with the products from the database.

      // Filter products by keyword search.
      if (this.searchQuery) {
        // If a Keyword is searched for.
        const query = this.searchQuery.toLowerCase();
        // Filter lowercased keyword query through lesson title, description, category and location for a match.
        filteredProducts = filteredProducts.filter( (product) =>
            product.title.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            product.location.toLowerCase().includes(query)
        );
      }

      // If statement to sort products by selected attribute and order.
      if (this.selectedSort) { // If a sort attribute is selected.
        // Copy and sort the array based on the comparison of the selected attribute.
        filteredProducts = filteredProducts.slice().sort((a, b) => {
          let valueOne = a[this.selectedSort];
          let valueTwo = b[this.selectedSort];

          // If the type of the first value is a string, make both values lowercased for equal comparison.
          if (typeof valueOne === "string") {
            valueOne = valueOne.toLowerCase();
            valueTwo = valueTwo.toLowerCase();
          }

          // Compare and return the values based on the selected sort order.
          if (this.sortOrder === "ascending") {
            return valueOne > valueTwo ? 1 : valueOne < valueTwo ? -1 : 0; // Ternary operator to move values based on the condition of ascending or descending.
          } else if (this.sortOrder === "descending") {
            return valueOne < valueTwo ? 1 : valueOne > valueTwo ? -1 : 0;
          } else {
            return 0; // If no sort order is selected, return the products as they are.
          }
        });
      }

      return filteredProducts; // Return the filtered products list.
    },

    // A computed method to update the display at the top right of the website, showing the amount of items in the cart.
    itemsInTheCart: function () {
      if (this.cart.length == 0) {
        return "";
      } else if (this.cart.length == 1) {
        return `${this.cart.length} item`;
      } else {
        return `${this.cart.length} items`;
      }
    },
    
    // A computed method to check whether a user can complete checkout.
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

    // A method to clear the keyword searching, filters and sorting options.
    resetFilters() {
      this.selectedSort = "";
      this.sortOrder = "";
      this.searchQuery = "";
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
