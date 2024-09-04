<script lang="ts" setup>
import { ref, watch, computed, onMounted } from "vue";
import Table from "@/app/common/components/Table.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import { customerHeaders } from "@/components/dashboard/customer/utils";
import { CustomerListingType } from "@/components/dashboard/customer/types";
import CreateEditCustomer from "@/components/dashboard/customer/CreateEditCustomer.vue";
import Swal from "sweetalert2";
import HttpService from "@/app/http/httpService";
import { useI18n } from "vue-i18n";
import eventBus from "@/components/layouts/topBar/eventBus";
import { getPermissions } from "@/app/http/services/permissionService";
import Unauthorized from "@/app/common/components/common/Unauthorized.vue";
import PageLoad from "@/app/common/components/common/PageLoad.vue";
import NoResult from "@/app/common/components/common/NoResult.vue";
import { formatCurrency } from "@/app/common/commonFunctions";

const { t } = useI18n();
const http = new HttpService();
const loading = ref(false);
const dialog = ref(false);
const customerData = ref<CustomerListingType | null>(null);
const deleteDialog = ref(false);
const deletedId = ref<number | null>(null);
const alertMsg = ref();
const query = ref("");
const mappedData = ref<any>([]);
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const page = ref(1);
const pageLoading = ref(false);
const userPermissions = ref<number[]>([]);
const unAuthorized = ref(false);

const fetchData = async (page = 1) => {
  loading.value = true;
  try {
    const response = await http.get(`customer/list?page=${page}`);
    mappedData.value = response.data.data.data;
    console.log(mappedData.value);
    totalItems.value = response.data.data.total;
    currentPage.value = response.data.data.current_page;
    itemsPerPage.value = response.data.data.per_page;

    updatePagination();
  } catch (error: any) {
    if (error.response.status === 403) {
      unAuthorized.value = true;
    }
  }
  loading.value = false;
};

// Computed properties
const filteredData = computed(() => {
  const val = query.value.toLowerCase();
  return mappedData.value.filter((item: CustomerListingType) =>
    item.first_name.toLowerCase().includes(val)
  );
});

const config = ref({
  page: currentPage.value,
  start: 0,
  end: 0,
  noOfItems: totalItems.value,
  itemsPerPage: itemsPerPage.value,
});

// Watchers
watch(page, () => fetchData(page.value));
watch(query, updatePagination);
watch(dialog, (newVal) => {
  if (!newVal) customerData.value = null;
});
watch(deleteDialog, (newVal) => {
  if (!newVal) deletedId.value = null;
});

// Function to create or edit a customer
const onCreateEditClick = (data: CustomerListingType | null) => {
  if (!data) {
    customerData.value = {
      id: -1,
      first_name: "",
      last_name: "",
      mobile_number: "",
      email: "",
    };
  } else {
    customerData.value = data;
  }
  dialog.value = true;
};

// Function to update pagination
function updatePagination() {
  config.value = {
    ...config.value,
    page: currentPage.value,
    noOfItems: totalItems.value,
    start: (currentPage.value - 1) * config.value.itemsPerPage,
    end: Math.min(
      currentPage.value * config.value.itemsPerPage,
      totalItems.value
    ),
  };
}

// Function to create or update a customer
async function onCreateUpdate(data: CustomerListingType) {
  const endpoint = data.id === -1 ? "customer/create" : `customer/update`;
  try {
    const response = await http.post(endpoint, data);
    alertMsg.value = response.data;
    const icon = alertMsg.value.status ? "success" : "error";
    const title = alertMsg.value.status ? t("t-success") : t("t-error");
    Swal.fire({ icon, title, text: alertMsg.value.message, timer: 2000 });

    fetchData(); // Refresh data after create or update
  } catch (error) {
    console.log(error, "error coming");
  }
  dialog.value = false;
}

// Function to delete a customer
const onDelete = async (id: number) => {
  deletedId.value = id;
  deleteDialog.value = true;
};

// Confirm deletion of user
async function onConfirm() {
  try {
    const response = await http.post("customer/delete", {
      id: deletedId.value,
    });
    alertMsg.value = response.data;
    const icon = alertMsg.value.status ? "success" : "error";
    const title = alertMsg.value.status ? t("t-success") : t("t-error");
    Swal.fire({ icon, title, text: alertMsg.value.msg, timer: 2000 });
  } catch (error) {
    console.error(error);
  }
  deleteDialog.value = false;
  fetchData(); // Refresh data after deletion
}
// Called on component mount
onMounted(async () => {
  pageLoading.value = true;
  try {
    // Fetch permissions
    userPermissions.value = await getPermissions();
    // Fetch other necessary data
    await fetchData();
    eventBus.on("branchChanged", () => {
      fetchData();
    });
  } catch (error) {
    console.error("Failed to fetch permissions:", error);
  }
  pageLoading.value = false;
});
</script>
<template>
  <PageLoad v-if="pageLoading" />
  <Unauthorized v-else-if="unAuthorized" />
  <v-card v-else flat>
    <Card title="Customer List ">
      <template #title-action>
        <!-- <v-card-text> -->
        <v-row justify="end">
          <v-col lg="3">
            <QuerySearch
              v-model="query"
              placeholder="Search name or email"
            />
          </v-col>
          <v-col cols="auto">
            <v-btn color="primary" @click="onCreateEditClick(null)">
              <i class="ph-plus-circle" /> Add new
            </v-btn>
          </v-col>
        </v-row>
        <!-- </v-card-text> -->
      </template>
      <v-card-text>
        <Table
          v-model="page"
          :headerItems="customerHeaders"
          :config="config"
          is-pagination
          :loading="loading"
        >
          <template #body>
            <tr v-for="(item, index) in filteredData" :key="index" height="40">
              <td>{{ item.first_name }} {{ item.last_name }}</td>
              <td>
                {{ item.mobile_number }}
              </td>
              <td>
                {{ item.email }}
              </td>
              <td>
                <TableAction
                  @onEdit="onCreateEditClick(item)"
                  @onDelete="onDelete(item.id)"
                />
              </td>
            </tr>
          </template>
        </Table>
        <NoResult v-if="!filteredData.length" />
      </v-card-text>
    </Card>
  </v-card>
  <CreateEditCustomer
    v-if="customerData"
    :data="customerData"
    v-model="dialog"
    @onCreateUpdate="onCreateUpdate"
  />
  <RemoveItemConfirmationDialog
    v-if="deletedId"
    v-model="deleteDialog"
    @onConfirm="onConfirm"
  />
</template>
