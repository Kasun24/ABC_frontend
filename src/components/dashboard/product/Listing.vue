<script lang="ts" setup>
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import Status from "@/app/common/components/Status.vue";
import Table from "@/app/common/components/Table.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import HttpService from "@/app/http/httpService";
import CreateEditProduct from "@/components/dashboard/product/CreateEditProduct.vue";
import { ProductListingType } from "@/components/dashboard/product/types";
import { productHeaders } from "@/components/dashboard/product/utils";
import Swal from "sweetalert2";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import eventBus from "@/components/layouts/topBar/eventBus";
import { getPermissions } from "@/app/http/services/permissionService";
import Unauthorized from "@/app/common/components/common/Unauthorized.vue";
import PageLoad from "@/app/common/components/common/PageLoad.vue";
import NoResult from "@/app/common/components/common/NoResult.vue";

const { t } = useI18n();
const dialog = ref(false);
const productData = ref<ProductListingType | null>(null);
const deleteDialog = ref(false);
const deletedId = ref<number | null>(null);
const page = ref(1);
const loading = ref(false);
const http = new HttpService();
const alertMsg = ref();
const query = ref("");
const mappedData = ref<any>([]);
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const pageLoading = ref(false);
const userPermissions = ref<number[]>([]);
const unAuthorized = ref(false);

const fetchData = async (page = 1) => {
  loading.value = true;
  try {
    const response = await http.get(`product/list?page=${page}`);
    mappedData.value = response.data.data.data;
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
  return mappedData.value.filter((item: ProductListingType) =>
    item.name.toLowerCase().includes(val)
  );
});

// Define ref for config with page, start, end, noOfItems, and itemsPerPage
const config = ref({
  page: page.value,
  start: 0,
  end: 0,
  noOfItems: totalItems.value,
  itemsPerPage: itemsPerPage.value,
});

// Watchers
watch(page, () => fetchData(page.value));
watch(query, updatePagination);
watch(dialog, (newVal) => {
  if (!newVal) productData.value = null;
});
watch(deleteDialog, (newVal) => {
  if (!newVal) deletedId.value = null;
});
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
// Function to create or edit a product
const onCreateEditClick = (data: ProductListingType | null) => {
  if (!data) {
    // send new data
  } else {
    productData.value = data;
  }
  dialog.value = true;
};

// Function to create or update a product
const onCreateUpdate = (data: ProductListingType) => {
  if (data.id === -1) {
    // if new one
  } else {
    // if existing one
  }

  dialog.value = false;
};

// Function to delete a product
const onDelete = (id: number) => {
  deletedId.value = id;
  deleteDialog.value = true;
};

// Function to confirm the deletion of a product
const onConfirm = () => {
  // send delete request
  deleteDialog.value = false;
};
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
  <Unauthorized v-else-if="unAuthorized || !userPermissions.includes(9)" />
  <Card v-else :title="`${$t('t-product')} ${$t('t-list')}`">
    <template #title-action>
      <v-row justify="end" align="center">
        <v-col lg="3">
          <QuerySearch
            v-model="query"
            placeholder="`${$t('t-search-name-email')}`"
          />
        </v-col>
        <v-col v-if="userPermissions.includes(10)" cols="auto">
          <v-btn color="primary" @click="onCreateEditClick(null)">
            <i class="ph-plus-circle me-1" /> Add new
          </v-btn>
        </v-col>
      </v-row>
    </template>
    <v-card-text>
      <Table
        v-model="page"
        is-pagination
        :config="config"
        :loading="loading"
        :headerItems="productHeaders"
      >
        <template #body>
          <tr
            v-for="(item, index) in filteredData"
            :key="'product-list-item-' + index"
            height="50"
          >
            <td>
              {{ item.position }}
            </td>
            <td>
              {{ item.dish_number }}
            </td>
            <td>{{ item.name }}</td>
            <td>{{ item.tax ?? "Tax free" }}</td>
            <td>
              <Status :status="item.status == 'true' ? 'active' : 'inActive'" />
            </td>
            <td>
              <TableAction
                :editButton="userPermissions.includes(11)"
                :deleteButton="userPermissions.includes(12)"
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
  <CreateEditProduct
    v-if="productData"
    :data="productData"
    v-model="dialog"
    @onCreateUpdate="onCreateUpdate"
  />
  <RemoveItemConfirmationDialog
    v-if="deletedId"
    v-model="deleteDialog"
    @onConfirm="onConfirm"
  />
</template>
