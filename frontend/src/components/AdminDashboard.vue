<template>
  <v-app>
    <!-- Sidebar -->
    <v-navigation-drawer color="blue-grey-darken-4" app>
      <v-list>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="text-h6 font-weight-bold">Customer Dashboard</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider />
        <v-list-item link>
          <v-list-item-title class="font-weight-medium"> Database</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main content -->
    <v-main>
      <v-container>
        <!-- Action Buttons -->
        <v-card class="pa-4 mb-4" color="grey-lighten-5">
          <v-card-title class="text-h5">Operations</v-card-title>
          <v-card-actions>
            <v-btn prepend-icon="mdi-refresh" variant="outlined" color="primary" @click="fetchCustomers" :loading="loading">Refresh</v-btn>
            <v-btn prepend-icon="mdi-plus" variant="outlined" color="success" @click="openDialog('add')">Add</v-btn>
            <v-btn prepend-icon="mdi-pencil" variant="outlined" color="warning" @click="openDialog('edit')" :disabled="!selected.length">Edit</v-btn>
            <v-btn prepend-icon="mdi-delete" variant="outlined" color="error" @click="confirmDeleteDialog = true" :disabled="!selected.length">Delete</v-btn>
          </v-card-actions>
        </v-card>

        <!-- Customers Table -->
        <v-data-table
        v-model:items-per-page="itemsPerPage"
        :items="customers"
        :search="search"
        item-value="_id"
        v-model="selected"
        show-select
        class="elevation-1"
        >
        <template #top>
        <v-toolbar flat>
          <v-toolbar-title>Customers</v-toolbar-title>
          <v-spacer />
          <v-text-field
            v-model="search"
            label="Search"
            hide-details
            clearable
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
          />
        </v-toolbar>
      </template>
        </v-data-table>
      </v-container>
    </v-main>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card>
        <v-card-title>{{ dialogMode === 'add' ? 'Add Customer' : 'Edit Customer' }}</v-card-title>
        <v-card-text>
          <v-form ref="formRef" v-model="formValid">
            <v-text-field v-model="form.name" label="Name" :rules="[rules.required]" required />
            <v-text-field v-model="form.email" label="Email" :rules="[rules.required, rules.email]" required />
            <v-text-field v-model="form.phone_number" label="Phone Number" :rules="[rules.required]" required />
            <v-text-field v-model="form.company" label="Company" required/>
            <v-select
              v-model="form.tier"
              :items="['Basic', 'Pro', 'Enterprise']"
              label="Tier"
              :rules="[rules.required]"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveCustomer" :disabled="!formValid">{{ dialogMode === 'add' ? 'Add' : 'Save' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :timeout="3000">{{ snackbarText }}</v-snackbar>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="confirmDeleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h6">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="confirmDeleteDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } from '@/api/customers';

export default {
  name: 'AdminDashboard',
  data() {
    return {
      customers: [],
      selected: [],
      search: '',
      loading: false,
      snackbar: false,
      snackbarText: '',
      dialog: false,
      dialogMode: 'add',
      formValid: false,
      itemsPerPage: 30,
      confirmDeleteDialog: false,
      form: {
        name: '',
        email: '',
        phone_number: '',
        company: '',
        tier: '',
      },
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Email', value: 'email' },
        { text: 'Phone', value: 'phone_number' },
        { text: 'Company', value: 'company' },
        { text: 'Tier', value: 'tier' },
      ],
      rules: {
        required: v => !!v || 'Required.',
        email: v => /.+@.+\..+/.test(v) || 'E-mail must be valid.',
      },
    };
  },
  methods: {
    async fetchCustomers() {
      this.loading = true;
      try {
        const response = await getCustomers();
        console.log('Fetched customers:', response.data);
        this.customers = response.data;
      } catch (err) {
        console.error('Error fetching customers:', err);
      } finally {
        this.loading = false;
      }
    },
    async openDialog(mode) {
  this.dialogMode = mode;
  if (mode === 'edit' && this.selected.length) {
    const customerId = this.selected[0];
    console.log("Selected Customer ID: ", customerId);

    try {
      const response = await getCustomerById(customerId)
      const customer = response.data;

      Object.assign(this.form, customer);
      console.log("Form data after assignment:", this.form);

    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  } else {
    this.resetForm();
  }
  this.dialog = true;
},
    async saveCustomer() {
  const isValid = await this.$refs.formRef.validate();
  if (!isValid) {
    this.snackbarText = '❌ Please fill in the required fields';
    this.snackbar = true;
    return;
  }

  try {
    let updatedCustomer;

    if (this.dialogMode === 'add') {
      updatedCustomer = await createCustomer(this.form);
      if (!updatedCustomer) {
        throw new Error('Failed to create customer.');
      }
      this.snackbarText = '✅ Customer added successfully!';
    } else {
      // Updating an existing customer
      updatedCustomer = await updateCustomer(this.form._id, this.form);
      console.log("this.form", this.form);
      if (!updatedCustomer) {
        throw new Error('Failed to update customer.');
      }
      this.snackbarText = '✅ Customer updated successfully!';
    }

    this.snackbar = true;
    this.dialog = false;
    await this.fetchCustomers(); // Refresh customer list

  } catch (err) {
    console.error('Error saving customer:', err);
    this.snackbarText = '❌ Error saving customer. Please try again later.';
    this.snackbar = true;
  }
},
    async confirmDelete() {
  // Check if there are selected customers
  if (!this.selected || this.selected.length === 0) {
    this.snackbarText = '❌ No customers selected';
    this.snackbar = true;
    return;
  }

  // Iterate through each selected customer
  for (const customer of this.selected) {
    try {
      await deleteCustomer(customer); // Delete each selected customer
      this.snackbarText = '✅ Customer successfully deleted!';
      this.snackbar = true;
    } catch (err) {
      console.error('Error deleting customer:', err);
      this.snackbarText = '❌ Error deleting customer';
      this.snackbar = true;
    }
  }

  // Refresh the customer list after all deletions
  await this.fetchCustomers();

  // Close the confirmation dialog
  this.confirmDeleteDialog = false;
},
    resetForm() {
      this.form = {
        name: '',
        email: '',
        phone_number: '',
        company: '',
        tier: '',
      };
    },
  },
  mounted() {
    this.fetchCustomers(); // Fetch customers on mount
  },
};
</script>

<style scoped>
.v-navigation-drawer {
  width: 240px;
}
.v-icon {
  visibility: visible !important;
  opacity: 1 !important;
}

.v-text-field .v-input__append-inner .v-icon {
  opacity: 1 !important;
}
</style>
