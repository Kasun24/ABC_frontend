<script lang="ts" setup>
import { ref, watch, computed, onMounted } from "vue";
import Table from "@/app/common/components/Table.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import { queryHeaders } from "@/components/dashboard/queries/utils";
import { QueryListingType } from "@/components/dashboard/queries/types";
import CreateEditQuery from "@/components/dashboard/queries/CreateEditQuery.vue";
import Swal from "sweetalert2";
import HttpService from "@/app/http/httpService";
import { useI18n } from "vue-i18n";
import eventBus from "@/components/layouts/topBar/eventBus";
import { getPermissions } from "@/app/http/services/permissionService";
import Unauthorized from "@/app/common/components/common/Unauthorized.vue";
import PageLoad from "@/app/common/components/common/PageLoad.vue";
import NoResult from "@/app/common/components/common/NoResult.vue";

const { t } = useI18n();
const http = new HttpService();
const loading = ref(false);
const dialog = ref(false);
const queryData = ref<QueryListingType | null>(null);
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
    const response = await http.get(`query/list?page=${page}`);
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
  return mappedData.value.filter((item: QueryListingType) =>
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
  if (!newVal) queryData.value = null;
});
watch(deleteDialog, (newVal) => {
  if (!newVal) deletedId.value = null;
});

// Function to create or edit a query
const onCreateEditClick = (data: QueryListingType | null) => {
  if (!data) {
    queryData.value = {
      id: -1,
      name: "",
    };
  } else {
    queryData.value = data;
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

// Function to create or update a query
async function onCreateUpdate(data: QueryListingType) {
  const endpoint = data.id === -1 ? "query/create" : `query/update`;
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

// Function to delete a query
const onDelete = async (id: number) => {
  deletedId.value = id;
  deleteDialog.value = true;
};

// Confirm deletion of user
async function onConfirm() {
  try {
    const response = await http.post("query/delete", { id: deletedId.value });
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
  <Unauthorized v-else-if="unAuthorized || !userPermissions.includes(32)" />
  <Card v-else :title="`${$t('t-queries')} ${$t('t-list')}`">
    <template #title-action>
      <div v-if="userPermissions.includes(33)">
        <v-btn color="primary" @click="onCreateEditClick(null)">
          <i class="ph-plus-circle me-1" /> {{ $t("t-add-new") }}
        </v-btn>
      </div>
    </template>
    <v-card-text>
      <Table
        v-model="page"
        is-pagination
        :config="config"
        :loading="loading"
        :headerItems="queryHeaders"
      >
        <template #body>
          <tr
            v-for="(item, index) in filteredData"
            :key="'query-list-item-' + index"
            height="50"
          >
            <td>
              {{ item.name }}
            </td>
            <td>
              <TableAction
                :editButton="userPermissions.includes(34)"
                :deleteButton="userPermissions.includes(35)"
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
  <CreateEditQuery
    v-if="queryData"
    :data="queryData"
    v-model="dialog"
    @onCreateUpdate="onCreateUpdate"
  />
  <RemoveItemConfirmationDialog
    v-if="deletedId"
    v-model="deleteDialog"
    @onConfirm="onConfirm"
  />
</template>
