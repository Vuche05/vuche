<template>
  <div class="cart-container">
    <h2>Giỏ Hàng</h2>

    <div v-if="loading" class="loading">Đang tải...</div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="cartItems.length === 0" class="no-products">
      Giỏ hàng của bạn trống.
    </div>

    <div v-else class="cart-items">
      <div v-for="item in cartItems" :key="item.id" class="cart-item">
        <div class="cart-item-details">
          <img
            :src="
              item.product.image
                ? `http://127.0.0.1:8000/storage/${item.product.image}`
                : '/default-product.png'
            "
            :alt="item.product.name"
            class="cart-item-image"
          />
          <div class="cart-item-info">
            <h3>{{ item.product.name }}</h3>
            <p class="price">{{ formatPrice(item.product.price) }}</p>
            <p>
              Số lượng:
              <button @click="updateQuantity(item, -1)">-</button>
              {{ item.quantity }}
              <button @click="updateQuantity(item, 1)">+</button>
            </p>
            <p class="total-price">
              Tổng tiền: {{ formatPrice(item.product.price * item.quantity) }}
            </p>
          </div>
        </div>
        <button @click="removeFromCart(item)" class="remove-btn">Xóa</button>
      </div>
      <div class="cart-total">
        <p>Tổng cộng: {{ formatPrice(totalPrice) }}</p>
        <button @click="checkout" class="checkout-btn">Thanh Toán</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      cartItems: [],
      loading: true,
      error: null,
      userId: 1, // Replace with the actual logged-in user ID
      authToken: "", // This should be fetched from localStorage or Vuex if using auth
    };
  },
  created() {
    this.authToken = localStorage.getItem("authToken"); // Assuming token is saved in localStorage
    this.fetchCartItems();
  },
  computed: {
    totalPrice() {
      return this.cartItems.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );
    },
  },
  methods: {
    fetchCartItems() {
      this.loading = true;
      this.error = null;

      axios
        .get(`http://127.0.0.1:8000/api/cart`, {
          params: { user_id: this.userId },
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        })
        .then((response) => {
          this.cartItems = response.data.map((item) => ({
            ...item,
            totalPrice: item.product.price * item.quantity,
          }));
        })
        .catch((error) => {
          // Enhanced error handling
          if (error.response) {
            switch (error.response.status) {
              case 401:
                this.error = "Phiên đăng nhập hết hạn";
                break;
              case 404:
                this.error = "Không tìm thấy giỏ hàng";
                break;
              case 500:
                this.error = "Lỗi máy chủ, vui lòng thử lại sau.";
                break;
              default:
                this.error = "Không thể tải giỏ hàng từ MySQL";
            }
          } else if (error.request) {
            this.error = "Lỗi kết nối mạng. Vui lòng kiểm tra lại.";
          } else {
            this.error = "Lỗi không xác định: " + error.message;
          }
          console.error(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },

    updateQuantity(item, change) {
      const updatedQuantity = Math.max(1, item.quantity + change);

      // Update the cart item quantity
      axios
        .put(
          `http://127.0.0.1:8000/api/cart/${item.id}`,
          { quantity: updatedQuantity },
          {
            headers: {
              Authorization: `Bearer ${this.authToken}`,
            },
          }
        )
        .then(() => {
          // Update the local cartItems list
          item.quantity = updatedQuantity;
          item.totalPrice = item.product.price * updatedQuantity;
        })
        .catch((error) => {
          console.error("Failed to update cart item quantity", error);
        });
    },

    removeFromCart(item) {
      axios
        .delete(`http://127.0.0.1:8000/api/cart/${item.id}`, {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        })
        .then(() => {
          // Remove the item from the cartItems list
          this.cartItems = this.cartItems.filter(
            (cartItem) => cartItem.id !== item.id
          );
        })
        .catch((error) => {
          console.error("Failed to remove item from cart", error);
        });
    },

    formatPrice(price) {
      return `${price.toFixed(3)} VND`;
    },

    checkout() {
      alert("Thanh toán thành công!");
    },
  },
};
</script>

<style scoped>
/* Add your CSS styles here */
.cart-container {
  max-width: 1200px;
  margin: auto;
  padding: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.cart-item-details {
  display: flex;
}

.cart-item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin-right: 20px;
}

.cart-item-info h3 {
  margin: 0;
  font-size: 18px;
}

.price {
  color: #ff5722;
}

.total-price {
  font-weight: bold;
  color: #ff5722;
}

.cart-total {
  margin-top: 20px;
  text-align: right;
  font-size: 20px;
}

.checkout-btn {
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
}

.checkout-btn:hover {
  background-color: #45a049;
}

.error-message {
  color: red;
}

.loading {
  text-align: center;
}

.no-products {
  text-align: center;
}
</style>
