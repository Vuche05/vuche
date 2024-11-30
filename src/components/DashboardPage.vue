<template>
  <div>
    <h1>Welcome to the Dashboard</h1>

    <p v-if="user">Hello, {{ user.name }}!</p>
    <p v-else-if="!error">Please log in to access your dashboard.</p>
    <p v-if="error" class="error">{{ errorMessage }}</p>

    <button v-if="user" @click="logout" class="logout-btn">Logout</button>
  </div>
</template>

<script>
import axios from "axios"; // Ensure axios is imported

export default {
  name: "DashboardPage",
  data() {
    return {
      user: null,
      error: false,
      errorMessage: "",
    };
  },
  created() {
    const token = localStorage.getItem("token");
    if (token) {
      this.fetchUserData(token);
    } else {
      this.error = true;
      this.errorMessage = "You are not logged in. Please log in to continue.";
      this.$router.push("/login");
    }
  },
  methods: {
    async fetchUserData(token) {
      try {
        // Log to check token and URL
        console.log("Fetching user data with token:", token);

        const apiClient = axios.create({
          baseURL: process.env.VUE_APP_API_BASE_URL, // Make sure your API URL is correct
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const response = await apiClient.get("/user"); // Fetch user data
        this.user = response.data;
        this.error = false;
      } catch (error) {
        // Log the error to debug
        console.error("Error fetching user data:", error);

        this.error = true;
        this.errorMessage = this.getErrorMessage(error);
        localStorage.removeItem("token");
        this.$router.push("/login");
      }
    },

    logout() {
      try {
        console.log("Logging out...");
        localStorage.removeItem("token");
        this.user = null;
        this.$router.push("/login");
      } catch (error) {
        console.error("Error logging out:", error);
        this.error = true;
        this.errorMessage = "An error occurred during logout.";
      }
    },

    getErrorMessage(error) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            return "Session expired. Please log in again.";
          case 403:
            return "You do not have permission to access this resource.";
          default:
            return (
              error.response.data.message || "An unexpected error occurred."
            );
        }
      } else if (error.request) {
        return "No response from server. Please check your network connection.";
      } else {
        return "An error occurred. Please try again.";
      }
    },
  },
};
</script>

<style scoped>
h1 {
  color: #333;
  font-size: 24px;
  margin-bottom: 20px;
}

p {
  font-size: 18px;
  margin: 10px 0;
}

p.error {
  color: red;
  font-weight: bold;
}

.logout-btn {
  cursor: pointer;
  padding: 10px 20px;
  border: none;
  background-color: #dc3545;
  color: white;
  border-radius: 5px;
  font-size: 16px;
}

.logout-btn:hover {
  background-color: #c82333;
}
</style>
