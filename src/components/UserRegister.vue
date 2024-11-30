<template>
  <div class="register-container">
    <form @submit.prevent="handleRegister" class="register-form">
      <h2>Đăng Ký</h2>
      <div class="form-group">
        <label for="name">Tên:</label>
        <input
          id="name"
          type="text"
          v-model="name"
          required
          placeholder="Nhập tên"
        />
      </div>
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
      <div class="form-group">
        <label for="confirmPassword">Xác nhận mật khẩu:</label>
        <input
          id="confirmPassword"
          type="password"
          v-model="confirmPassword"
          required
          placeholder="Nhập lại mật khẩu"
        />
      </div>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <button type="submit" class="register-button" :disabled="isLoading">
        {{ isLoading ? "Đang đăng ký..." : "Đăng Ký" }}
      </button>
      <p class="login-link">
        Đã có tài khoản? <router-link to="/login">Đăng nhập</router-link>
      </p>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "UserRegister",
  data() {
    return {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      errorMessage: "",
      isLoading: false,
    };
  },
  methods: {
    validateForm() {
      if (this.password !== this.confirmPassword) {
        this.errorMessage = "Mật khẩu không khớp.";
        return false;
      }

      if (this.password.length < 6) {
        this.errorMessage = "Mật khẩu phải có ít nhất 6 ký tự.";
        return false;
      }

      this.errorMessage = "";
      return true;
    },
    async handleRegister() {
      if (!this.validateForm()) {
        return;
      }

      this.isLoading = true;
      this.errorMessage = "";

      try {
        await axios.post("http://127.0.0.1:8000/api/register", {
          name: this.name,
          email: this.email,
          password: this.password,
          confirmPassword: this.confirmPassword,
        });

        // Lưu tên người dùng vào localStorage
        localStorage.setItem("userName", this.name);

        alert("Đăng ký thành công!");
        this.$router.push("/login");
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message ||
          "Đăng ký thất bại. Vui lòng thử lại.";
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}

.register-form {
  width: 350px;
  padding: 25px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #333;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.register-button {
  width: 100%;
  padding: 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.register-button:hover {
  background-color: #218838;
}

.register-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.error-message {
  color: red;
  margin-bottom: 15px;
  text-align: center;
}

.login-link {
  text-align: center;
  margin-top: 15px;
  color: #666;
}

.login-link a {
  color: #007bff;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
