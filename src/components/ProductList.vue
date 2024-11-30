<template>
  <div class="product-list-container">
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

    <div class="action-section">
      <router-link to="/products/create" class="add-product-btn">
        + Thêm Sản Phẩm Mới
      </router-link>
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
          <button @click="editProduct(product.id)" class="edit-btn">Sửa</button>
          <button @click="deleteProduct(product.id)" class="delete-btn">
            Xóa
          </button>
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
    searchProducts: debounce(function () {
      this.fetchProducts();
    }, 500),
    filterProducts() {
      this.fetchProducts();
    },
    formatPrice(price) {
      // Ensure the price is a number and format it with 3 decimal places
      const formattedPrice = parseFloat(price).toFixed(3);
      return `${formattedPrice} VND`; // Append 'VND' to the price
    },
    async deleteProduct(id) {
      if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
        try {
          await axios.delete(`http://127.0.0.1:8000/api/products/${id}`);
          this.products = this.products.filter((p) => p.id !== id);
        } catch (error) {
          console.error("Lỗi xóa sản phẩm:", error);
          alert("Không thể xóa sản phẩm");
        }
      }
    },
    editProduct(id) {
      this.$router.push(`/products/edit/${id}`);
    },
  },
};
</script>

<style scoped>
.product-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-filter-section {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.search-input,
.category-select {
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  flex-grow: 1;
}

.action-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.add-product-btn {
  background-color: #28a745;
  color: white;
  padding: 10px 15px;
  border-radius: 4px;
  text-decoration: none;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.product-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.product-image {
  height: 250px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details {
  padding: 15px;
  flex-grow: 1;
}

.product-actions {
  display: flex;
  margin-top: auto;
}

.edit-btn,
.delete-btn {
  flex-grow: 1;
  padding: 10px;
  border: none;
  color: white;
  cursor: pointer;
}

.edit-btn {
  background-color: #28a745;
}

.delete-btn {
  background-color: #dc3545;
}

.loading,
.no-products {
  text-align: center;
  margin-top: 50px;
  font-size: 18px;
}

.error-message {
  color: red;
  text-align: center;
}
</style>
