<script lang="ts" setup>
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import Status from "@/app/common/components/Status.vue";
import Table from "@/app/common/components/Table.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import CreateEditCategory from "@/components/dashboard/category/CreateEditCategory.vue";
import { CategoryListingType } from "@/components/dashboard/category/types";
import { categoryHeaders } from "@/components/dashboard/category/utils";
import { computed, onMounted, ref, watch } from "vue";
import HttpService from "@/app/http/httpService";
import Swal from "sweetalert2";
import { useI18n } from "vue-i18n";
import eventBus from "@/components/layouts/topBar/eventBus";
import { getPermissions } from "@/app/http/services/permissionService";
import Unauthorized from "@/app/common/components/common/Unauthorized.vue";
import PageLoad from "@/app/common/components/common/PageLoad.vue";
import NoResult from "@/app/common/components/common/NoResult.vue";

const { t } = useI18n();
const dialog = ref(false);
const categoryData = ref<CategoryListingType | null>(null);
const deleteDialog = ref(false);
const deletedId = ref<number | null>(null);
const loading = ref(false);
const alertMsg = ref();
const query = ref("");
const mappedData = ref<any>([]);
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const page = ref(1);
const http = new HttpService();
const pageLoading = ref(false);
const userPermissions = ref<number[]>([]);
const unAuthorized = ref(false);

const fetchData = async (page = 1) => {
  loading.value = true;
  try {
    const response = await http.get(`menu-category/list?page=${page}`);
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
  return mappedData.value.filter((item: CategoryListingType) =>
    item.name.toLowerCase().includes(val)
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
  if (!newVal) categoryData.value = null;
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
// Function to create or edit a category
const onCreateEditClick = (data: CategoryListingType | null) => {
  if (!data) {
    // send new data
  } else {
    categoryData.value = data;
  }
  dialog.value = true;
};

// Function to create or update a category
const onCreateUpdate = (data: CategoryListingType) => {
  if (data.id === -1) {
  } else {
  }
  dialog.value = false;
};

// Function to delete a category
const onDelete = (id: number) => {
  deletedId.value = id;
  deleteDialog.value = true;
};

// Function to confirm the deletion of a category
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
  <Unauthorized v-else-if="unAuthorized || !userPermissions.includes(5)" />
  <Card v-else title="Categories">
    <template #title-action>
      <div v-if="userPermissions.includes(6)">
        <v-btn color="primary" @click="onCreateEditClick(null)">
          <i class="ph-plus-circle me-1" /> Add new
        </v-btn>
      </div>
    </template>
    <v-card-text>
      <Table
        v-model="page"
        is-pagination
        :config="config"
        :loading="loading"
        :headerItems="categoryHeaders"
      >
        <template #body>
          <tr
            v-for="(item, index) in filteredData"
            :key="'category-list-item-' + index"
            height="50"
          >
            <td>
              {{ item.id }}
            </td>
            <td>
              {{ item.name }}
            </td>
            <td>
              <Status :status="item.status == 'true' ? 'active' : 'inActive'" />
            </td>
            <td>
              <TableAction
                :editButton="userPermissions.includes(7)"
                :deleteButton="userPermissions.includes(8)"
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
  <CreateEditCategory
    v-if="categoryData"
    :data="categoryData"
    v-model="dialog"
    @onCreateUpdate="onCreateUpdate"
  />
  <RemoveItemConfirmationDialog
    v-if="deletedId"
    v-model="deleteDialog"
    @onConfirm="onConfirm"
  />
</template>
