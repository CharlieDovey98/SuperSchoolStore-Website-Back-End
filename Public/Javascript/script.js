// JavaScript for the S3 Website using Vue.js

let app = new Vue({
  el: "#App",
  data: {
    currentPage: "aboutUs", // currentPage sets the landing page to be presented on website interaction and allows tracking of the current page.
    lessons: [], // Procucts is inicialised empty and will attain the lessons from mongoDB database lessons collection.
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
    filterAndSortLessons() {
      let filteredLessons = this.lessons; // Initialise an array with the lessons from the database.

      // Filter lessons by keyword search.
      if (this.searchQuery) {
        // If a Keyword is searched for.
        const query = this.searchQuery.toLowerCase();
        // Filter lowercased keyword query through lesson title, description, subject and location for a match.
        filteredLessons = filteredLessons.filter(
          (lesson) =>
            lesson.title.toLowerCase().includes(query) ||
            lesson.description.toLowerCase().includes(query) ||
            lesson.subject.toLowerCase().includes(query) ||
            lesson.location.toLowerCase().includes(query)
        );
      }

      // If statement to sort lessons by selected attribute and order.
      if (this.selectedSort) {
        // If a sort attribute is selected.
        // Copy and sort the array based on the comparison of the selected attribute.
        filteredLessons = filteredLessons.slice().sort((a, b) => {
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
            return 0; // If no sort order is selected, return the lessons as they are.
          }
        });
      }

      return filteredLessons; // Return the filtered lessons list.
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
    // A try catch to populate lessons with MongoDB database lessons collection.
    async fetchLessons() {
      try {
        const response = await fetch("/collections/lessons");
        const data = await response.json();
        this.lessons = data;
        console.log("Fetched lessons:", this.lessons);
      } catch (error) {
        console.error("Error fetching lessons from Database:", this.lessons);
      }
    },

    // Fetch filtered and sorted lessons
    async fetchFilteredAndSortedLessons() {
      try {
        const sortAspect = this.selectedSort || "subject"; // Default sort by 'subject'
        const sortOrder = this.sortOrder || "ascending"; // Default order is ascending

        const response = await fetch(
          `/collections/lessons/${sortAspect}/${sortOrder}`
        );
        const data = await response.json();
        this.lessons = data; // Update local array with the filtered/sorted lessons
        console.log("Fetched filtered and sorted lessons:", this.lessons);
      } catch (error) {
        console.error("Error fetching filtered and sorted lessons:", error);
      }
    },

    // A method to clear the keyword searching, filters and sorting options.
    resetFilters() {
      this.selectedSort = "";
      this.sortOrder = "";
      this.searchQuery = "";
    },

    // A method to add lessons from the shopping page to the users 'Cart'.
    addToCart(lesson) {
      // If there is space available, add the lesson to the cart and reduce the spaces left.
      if (lesson.spacesAvailable > 0) {
        this.cart.push(lesson);
        lesson.spacesAvailable -= 1;
        console.log(
          `${lesson.title} added to cart. Spaces remaining: ${lesson.spacesAvailable}`
        );
      } else {
      }
    },

    // A method to remove lessons from the users 'Cart'.
    removeFromCart(lessonIndex) {
      // Remove the lesson from the cart and update the spaces available.
      const lesson = this.cart[lessonIndex];
      lesson.spacesAvailable += 1;
      this.cart.splice(lessonIndex, 1);
      console.log(
        `${lesson.title} removed from cart. Spaces remaining: ${lesson.spacesAvailable}`
      );
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

        // Clear all user inputs in the checkout page.
        this.user = {
          firstName: "",
          lastName: "",
          email: "",
          confirmEmail: "",
          password: "",
          confirmPassword: "",
          termsAccepted: false,
        };
        this.payment = {
          cardNumber: "",
          expiryDate: "",
          cvv: "",
        };

        // Clear the cart of purchased items.
        this.cart = [];
      } else {
        alert(
          "Please fill out all required fields correctly and accept the Terms and Conditions."
        );
      }
    },
  },
  created() {
    this.fetchLessons(); // Call fetchLessons() method when the Vue instance is created.
  },
});
