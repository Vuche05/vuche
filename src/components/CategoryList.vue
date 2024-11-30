<template>
  <div>
    <h1>Category List</h1>
    <button class="add-category" @click="openModal">Add Category</button>

    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="category in categories" :key="category.id">
          <td>{{ category.name }}</td>
          <td>{{ category.description }}</td>
          <td>
            <button @click="editCategory(category)">Edit</button>
            <button @click="deleteCategory(category.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal for adding/editing category -->
    <div v-if="showModal" class="modal">
      <div>
        <button class="close-button" @click="closeModal">&times;</button>
        <h2>{{ form.id ? "Edit" : "Add" }} Category</h2>
        <input v-model="form.name" placeholder="Name" type="text" />
        <textarea
          v-model="form.description"
          placeholder="Description"
        ></textarea>
        <div class="button-group">
          <button type="button" @click="closeModal">Cancel</button>
          <button type="submit" @click="saveCategory">
            {{ form.id ? "Update" : "Save" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      categories: [],
      showModal: false,
      form: { id: null, name: "", description: "" },
    };
  },
  created() {
    this.fetchCategories();
  },
  methods: {
    async fetchCategories() {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/categories"
        );
        this.categories = response.data;
      } catch (error) {
        console.error("Error fetching categories:", error);
        alert("Failed to load categories. Please try again.");
      }
    },
    async deleteCategory(id) {
      try {
        if (confirm("Are you sure you want to delete this category?")) {
          await axios.delete(`http://127.0.0.1:8000/api/categories/${id}`);
          this.fetchCategories(); // Refresh the category list
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Failed to delete category. Please try again.");
      }
    },
    openModal() {
      this.showModal = true;
      this.form = { id: null, name: "", description: "" }; // Reset form
    },
    closeModal() {
      this.showModal = false;
    },
    editCategory(category) {
      this.form = { ...category }; // Copy category data to form
      this.showModal = true;
    },
    async saveCategory() {
      if (!this.form.name.trim()) {
        alert("Category name is required");
        return;
      }

      try {
        if (this.form.id) {
          await axios.put(
            `http://127.0.0.1:8000/api/categories/${this.form.id}`,
            this.form
          );
        } else {
          await axios.post("http://127.0.0.1:8000/api/categories", this.form);
        }
        this.fetchCategories();
        this.closeModal();
      } catch (error) {
        console.error("Error saving category:", error);
        alert("Failed to save category. Please try again.");
      }
    },
  },
};
</script>

<style scoped>
/* Base Table and Layout Styles */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th,
td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f4f4f4;
  font-weight: bold;
}

/* Button Styles */
button {
  padding: 8px 12px;
  margin: 0 5px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}

button.add-category {
  background-color: #28a745;
}

button.add-category:hover {
  background-color: #218838;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal > div {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  position: relative;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.modal input,
.modal textarea {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.modal input:focus,
.modal textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.modal textarea {
  height: 150px;
  resize: vertical;
}

.modal .button-group {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.modal button {
  padding: 10px 20px;
  margin-left: 10px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
}

.modal button:hover {
  transform: translateY(-2px);
}

.modal button:active {
  transform: translateY(0);
}

.modal button[type="submit"] {
  background-color: #28a745;
  color: white;
}

.modal button[type="submit"]:hover {
  background-color: #218838;
}

.modal button[type="button"] {
  background-color: #6c757d;
  color: white;
}

.modal button[type="button"]:hover {
  background-color: #545b62;
}

.modal .close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #aaa;
  cursor: pointer;
  transition: color 0.3s ease;
  padding: 0;
  margin: 0;
}

.modal .close-button:hover {
  color: #333;
}
</style>
