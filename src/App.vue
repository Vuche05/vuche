<template>
  <div id="app">
    <nav :class="{ scrolled: isScrolled }">
      <ul :class="{ active: menuActive }">
        <!-- Trang Chủ -->
        <li><router-link to="/">Trang Chủ</router-link></li>

        <!-- Hiển thị tùy chọn đăng nhập/đăng ký hoặc thông tin người dùng -->
        <li v-if="!isLoggedIn">
          <router-link to="/login">Đăng Nhập</router-link>
        </li>
        <li v-if="!isLoggedIn">
          <router-link to="/register">Đăng Ký</router-link>
        </li>
        <li v-else>
          <span>Xin chào, {{ userName }}</span>
          <button @click="logout">Đăng Xuất</button>
        </li>

        <!-- Liên kết tới danh mục và sản phẩm -->
        <li><router-link to="/categories">Danh mục</router-link></li>
        <li><router-link to="/products">Sản phẩm</router-link></li>
      </ul>

      <!-- Nút hamburger cho màn hình nhỏ -->
      <div class="hamburger" @click="toggleMenu">☰</div>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      isLoggedIn: false,
      userName: null,
      menuActive: false,
      isScrolled: false,
    };
  },
  watch: {
    // Watch for changes to the login status and react accordingly
    isLoggedIn(newVal) {
      if (newVal) {
        this.fetchUserData();
      } else {
        this.userName = null;
      }
    },
  },
  created() {
    // Check if token exists in localStorage and set isLoggedIn accordingly
    const token = localStorage.getItem("token");
    if (token) {
      this.isLoggedIn = true; // User is logged in
      this.fetchUserData();
    } else {
      this.isLoggedIn = false; // User is not logged in
    }
  },
  methods: {
    async logout() {
      try {
        // Ensure the user is logged in before attempting to log out
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Bạn chưa đăng nhập.");
          return;
        }

        // Make an API request to log out the user
        await this.$axios.post(
          "/api/logout",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Remove token and set isLoggedIn to false
        localStorage.removeItem("token");
        this.isLoggedIn = false;
        this.userName = null;

        // Redirect to login page
        this.$router.push("/login");
        alert("Đăng xuất thành công");
      } catch (error) {
        console.error("Đăng xuất thất bại:", error);
        alert("Đăng xuất thất bại. Vui lòng thử lại!");
      }
    },

    async fetchUserData() {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token không tồn tại.");

        // Fetch user data from API
        const response = await this.$axios.get("/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.userName = response.data.name;
      } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        this.logout(); // Logout if there's an error fetching user data
      }
    },

    toggleMenu() {
      this.menuActive = !this.menuActive;
    },

    handleScroll() {
      if (window.scrollY > 50) {
        this.isScrolled = true;
      } else {
        this.isScrolled = false;
      }
    },
  },
  mounted() {
    // Listen to scroll events
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeUnmount() {
    // Remove scroll event listener before component is destroyed
    window.removeEventListener("scroll", this.handleScroll);
  },
};
</script>

<style scoped>
/* Định dạng thanh điều hướng */
nav {
  background-color: #343a40; /* Màu nền đậm */
  color: white;
  border-bottom: 2px solid #007bff;
  padding: 10px 20px;
  position: sticky; /* Thanh điều hướng cố định */
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease; /* Hiệu ứng khi thay đổi */
}

/* Thay đổi màu thanh điều hướng khi cuộn */
nav.scrolled {
  background-color: #007bff;
  color: white;
}

/* Định dạng danh sách trong thanh điều hướng */
nav ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Các mục trong danh sách */
nav li {
  margin: 0 15px;
}

nav li a {
  text-decoration: none;
  color: #ffffff;
  font-weight: 500;
  font-size: 16px;
  transition: color 0.3s ease;
}

nav li a:hover {
  color: #ffc107; /* Đổi màu chữ khi hover */
}

/* Nút đăng xuất */
button {
  cursor: pointer;
  padding: 8px 15px;
  border: none;
  background-color: #dc3545;
  color: white;
  font-size: 14px;
  font-weight: bold;
  border-radius: 4px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

button:hover {
  background-color: #c82333;
  transform: scale(1.05);
}

/* Căn chỉnh thông báo chào mừng */
nav span {
  font-size: 14px;
  font-weight: 500;
  margin-right: 10px;
  color: #ffc107;
}

/* Responsive */
@media (max-width: 768px) {
  nav ul {
    display: none; /* Ẩn menu mặc định */
    flex-direction: column;
    background-color: #343a40;
    padding: 10px;
    width: 100%;
    border-top: 2px solid #007bff;
  }

  nav ul.active {
    display: flex; /* Hiển thị menu khi menuActive = true */
  }

  nav li {
    margin: 10px 0;
  }

  .hamburger {
    display: block;
    font-size: 24px;
    color: white;
    cursor: pointer;
  }
}
</style>
