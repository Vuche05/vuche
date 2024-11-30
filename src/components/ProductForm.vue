<template>
  <div class="product-form-container">
    <h2>{{ isEditMode ? "Chỉnh Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới" }}</h2>

    <form @submit.prevent="submitForm" class="product-form">
      <div class="form-group">
        <label for="name">Tên Sản Phẩm</label>
        <input
          type="text"
          id="name"
          v-model="product.name"
          required
          placeholder="Nhập tên sản phẩm"
        />
      </div>

      <div class="form-group">
        <label for="category">Danh Mục</label>
        <select id="category" v-model="product.category_id" required>
          <option value="" disabled>Chọn danh mục</option>
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="price">Giá</label>
        <input
          type="number"
          id="price"
          v-model="product.price"
          required
          min="0"
          placeholder="Nhập giá sản phẩm"
        />
      </div>

      <div class="form-group">
        <label for="description">Mô Tả</label>
        <textarea
          id="description"
          v-model="product.description"
          required
          placeholder="Nhập mô tả sản phẩm"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="image">Hình Ảnh</label>
        <input
          type="file"
          id="image"
          @change="handleFileUpload"
          accept="image/*"
          required
        />

        <div v-if="imagePreview" class="image-preview">
          <img :src="imagePreview" alt="Xem trước hình ảnh" />
        </div>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="successMessage" class="success-message">
        <div class="success-modal">
          <div class="success-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                fill="#4CAF50"
              />
            </svg>
          </div>
          <h3>Thêm sản phẩm thành công!</h3>
        </div>
      </div>

      <button type="submit" class="submit-btn">
        {{ isEditMode ? "Cập Nhật" : "Thêm Sản Phẩm" }}
      </button>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      product: {
        id: null,
        name: "",
        category_id: "",
        price: "",
        description: "",
        image: null,
      },
      categories: [],
      imageFile: null,
      imagePreview: null,
      isEditMode: false,
      error: null,
      successMessage: false,
    };
  },
  async created() {
    await this.fetchCategories();

    // Kiểm tra nếu đang ở chế độ chỉnh sửa
    const productId = this.$route.params.id;
    if (productId) {
      this.isEditMode = true;
      await this.fetchProduct(productId);
    }
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
        this.error = "Không thể tải danh mục. Vui lòng thử lại.";
      }
    },
    async fetchProduct(id) {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/products/${id}`
        );
        this.product = response.data;

        // Nếu có ảnh, set preview
        if (this.product.image) {
          this.imagePreview = `http://127.0.0.1:8000/storage/${this.product.image}`;
        }
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
        this.error = "Không thể tải thông tin sản phẩm. Vui lòng thử lại.";
      }
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      this.imageFile = file;

      // Tạo preview cho ảnh mới
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    async submitForm() {
      // Kiểm tra nếu không có ảnh, báo lỗi
      if (!this.imageFile) {
        this.error = "Ảnh là bắt buộc.";
        return;
      }

      this.error = null;

      const formData = new FormData();

      // Thêm các trường dữ liệu
      formData.append("name", this.product.name);
      formData.append("category_id", this.product.category_id);
      formData.append("price", this.product.price);
      formData.append("description", this.product.description);

      // Thêm ảnh nếu có
      formData.append("image", this.imageFile);

      try {
        if (this.isEditMode) {
          // Chỉnh sửa sản phẩm
          formData.append("_method", "PUT");
          await axios.post(
            `http://127.0.0.1:8000/api/products/${this.product.id}`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
        } else {
          // Thêm sản phẩm mới
          await axios.post("http://127.0.0.1:8000/api/products", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        // Hiển thị thông báo thành công
        this.successMessage = true;

        // Điều hướng về trang danh sách sản phẩm sau 2 giây
        setTimeout(() => {
          this.$router.push("/products");
        }, 2000);
      } catch (error) {
        console.error("Lỗi:", error);
        this.error =
          error.response?.data?.message ||
          "Đã xảy ra lỗi trong quá trình xử lý.";
      }
    },
  },
};
</script>

<style scoped>
.product-form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.product-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input,
select,
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.image-preview {
  margin-top: 10px;
  max-width: 200px;
  max-height: 200px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.submit-btn {
  background-color: #28a745;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.error-message {
  color: red;
  margin-bottom: 15px;
}

.success-message {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.success-modal {
  background-color: white;
  padding: 40px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.success-icon svg {
  width: 60px;
  height: 60px;
  margin-bottom: 20px;
}

.success-modal h3 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.success-modal p {
  font-size: 16px;
}
</style>
