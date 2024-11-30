<template>
  <div class="homepage-container">
    <h2>Danh Sách Sản Phẩm</h2>

    <div class="search-filter-section">
      <input
        type="text"
        v-model="searchQuery"
        @input="searchProducts"
        placeholder="Tìm kiếm sản phẩm..."
        class="search-input"
      />
      <select
        v-model="selectedCategory"
        @change="filterProducts"
        class="category-select"
      >
        <option value="">Tất cả danh mục</option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }}
        </option>
      </select>
    </div>

    <div v-if="loading" class="loading">Đang tải...</div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="products.length === 0" class="no-products">
      Không có sản phẩm nào
    </div>

    <div v-else class="product-grid">
      <div v-for="product in products" :key="product.id" class="product-card">
        <div class="product-image">
          <img
            :src="
              product.image
                ? `http://127.0.0.1:8000/storage/${product.image}`
                : '/default-product.png'
            "
            :alt="product.name"
          />
        </div>
        <div class="product-details">
          <h3>{{ product.name }}</h3>
          <p class="price">Giá: {{ formatPrice(product.price) }}</p>
          <p class="category">
            Danh mục:
            {{ product.category ? product.category.name : "Chưa phân loại" }}
          </p>
          <p class="description">Mô tả: {{ product.description }}</p>
        </div>
        <div class="product-actions">
          <button @click="addToCart(product)" class="buy-btn">Mua</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import debounce from "lodash/debounce";

export default {
  data() {
    return {
      products: [],
      categories: [],
      selectedCategory: "",
      searchQuery: "",
      loading: true,
      error: null,
    };
  },
  created() {
    this.fetchCategories();
    this.fetchProducts();
  },
  methods: {
    // Lấy danh mục sản phẩm
    async fetchCategories() {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/categories"
        );
        this.categories = response.data;
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      }
    },

    // Thêm sản phẩm vào giỏ hàng
    addToCart(product) {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existingProductIndex = cart.findIndex(
        (item) => item.id === product.id
      );

      if (existingProductIndex >= 0) {
        // Nếu sản phẩm đã có trong giỏ hàng, chỉ cập nhật số lượng
        cart[existingProductIndex].quantity += 1;
      } else {
        // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới với số lượng 1
        cart.push({ ...product, quantity: 1 });
      }

      localStorage.setItem("cart", JSON.stringify(cart));

      // Thông báo và chuyển hướng đến trang giỏ hàng
      alert(`Đã thêm sản phẩm "${product.name}" vào giỏ hàng.`);
      this.$router.push("/cart");
    },

    // Lấy danh sách sản phẩm
    async fetchProducts() {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get("http://127.0.0.1:8000/api/products", {
          params: {
            search: this.searchQuery,
            category: this.selectedCategory,
          },
        });
        this.products = response.data;
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
        this.error = "Không thể tải danh sách sản phẩm";
      } finally {
        this.loading = false;
      }
    },

    // Tìm kiếm sản phẩm
    searchProducts: debounce(function () {
      this.fetchProducts();
    }, 500),

    // Lọc sản phẩm theo danh mục
    filterProducts() {
      this.fetchProducts();
    },

    // Định dạng giá sản phẩm
    formatPrice(price) {
      const formattedPrice = parseFloat(price).toFixed(3);
      return `${formattedPrice} VND`;
    },
  },
};
</script>

<style scoped>
/* Container chính */
.product-list-container {
  padding: 20px;
  max-width: 1200px;
  margin: auto;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 1.8rem;
  color: #333;
}

/* Phần tìm kiếm và bộ lọc */
.search-filter-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-input,
.category-select {
  width: 48%;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-input:focus,
.category-select:focus {
  border-color: #007bff;
  outline: none;
}

/* Lưới sản phẩm */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4 sản phẩm trên 1 hàng */
  gap: 20px;
}

.product-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

/* Ảnh sản phẩm */
.product-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

/* Thông tin sản phẩm */
.product-details {
  padding: 15px;
}

.product-details h3 {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #333;
}

.product-details .price {
  font-size: 1.1rem;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 8px;
}

.product-details .category,
.product-details .description {
  font-size: 0.9rem;
  color: #666;
}

/* Hành động sản phẩm */
.product-actions {
  margin-top: auto;
  padding: 15px;
  text-align: center;
}

.product-actions .buy-btn {
  display: block;
  width: 100%;
  padding: 10px;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.product-actions .buy-btn {
  background-color: #28a745;
  color: #fff;
}

.product-actions .buy-btn:hover {
  background-color: #218838;
}

/* Responsive cho màn hình nhỏ hơn */
@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr); /* 2 sản phẩm trên 1 hàng */
  }
}

@media (max-width: 576px) {
  .product-grid {
    grid-template-columns: 1fr; /* 1 sản phẩm trên 1 hàng */
  }

  .search-filter-section {
    flex-direction: column;
  }

  .search-input,
  .category-select {
    width: 100%;
    margin-bottom: 10px;
  }
}
</style>
