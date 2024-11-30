<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin" class="login-form">
      <h2>Đăng Nhập</h2>
      <div class="form-group">
        <label for="email">Email:</label>
        <input
          id="email"
          type="email"
          v-model="email"
          required
          placeholder="Nhập email"
        />
      </div>
      <div class="form-group">
        <label for="password">Mật khẩu:</label>
        <input
          id="password"
          type="password"
          v-model="password"
          required
          placeholder="Nhập mật khẩu"
        />
      </div>
      <button type="submit" class="login-button">Đăng Nhập</button>
      <p class="register-link">
        Chưa có tài khoản?
        <router-link to="/register">Đăng ký ngay</router-link>
      </p>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "UserLogin",
  data() {
    return {
      email: "",
      password: "",
      errorMessage: "", // Biến hiển thị lỗi
    };
  },
  methods: {
    async handleLogin() {
      try {
        // Gửi yêu cầu đăng nhập đến server
        const response = await axios.post("http://127.0.0.1:8000/api/login", {
          email: this.email,
          password: this.password,
        });

        // Kiểm tra phản hồi từ server
        if (response && response.data && response.data.token) {
          // Lưu token vào localStorage
          localStorage.setItem("token", response.data.token);

          // Lấy thông tin người dùng
          const userResponse = await axios.get(
            "http://127.0.0.1:8000/api/user",
            {
              headers: { Authorization: `Bearer ${response.data.token}` },
            }
          );

          // Kiểm tra id người dùng và điều hướng
          if (userResponse.data.id === 10) {
            this.$router.push("/productlist"); // Nếu id là 10, điều hướng đến productlist
          } else {
            this.$router.push("/"); // Nếu không phải id 10, về homepage
          }
        } else {
          throw new Error("Phản hồi từ server không hợp lệ.");
        }
      } catch (error) {
        // Hiển thị lỗi
        console.error("Lỗi đăng nhập:", error);
        this.errorMessage =
          error.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng thử lại.";
      }
    },
  },
};
</script>

<style scoped>
/* Container chính */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f8f9fa;
}

/* Form đăng nhập */
.login-form {
  width: 100%;
  max-width: 350px;
  padding: 20px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

/* Form group */
.form-group {
  margin-bottom: 15px;
}

/* Input */
input {
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

/* Button đăng nhập */
.login-button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-button:hover {
  background-color: #0056b3;
}

/* Link đăng ký */
.register-link {
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
}

.register-link a {
  color: #007bff;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}

/* Thông báo lỗi */
.error-message {
  margin-top: 15px;
  color: red;
  text-align: center;
  font-size: 14px;
}
</style>
