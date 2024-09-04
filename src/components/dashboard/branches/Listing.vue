<script lang="ts" setup>
import { ref, watch, computed, onMounted } from "vue";
import Table from "@/app/common/components/Table.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import SyncConfirmationDialog from "@/app/common/components/SyncConfirmationDialog.vue";
import { branchHeaders } from "@/components/dashboard/branches/utils";
import {
  BranchListingType,
  ApiBranchListingType,
} from "@/components/dashboard/branches/types";
import CreateEditBranch from "@/components/dashboard/branches/CreateEditBranch.vue";
import Swal from "sweetalert2";
import HttpService from "@/app/http/httpService";
// import { useI18n } from "vue-i18n";
import { getPermissions } from "@/app/http/services/permissionService";
import PageLoad from "@/app/common/components/common/PageLoad.vue";
import Unauthorized from "@/app/common/components/common/Unauthorized.vue";
import NoResult from "@/app/common/components/common/NoResult.vue";

// const { t } = useI18n();
const http = new HttpService();
const loading = ref(false);
const dialog = ref(false);
const branchData = ref<BranchListingType | null>(null);
const deleteDialog = ref(false);
const deletedId = ref<number | null>(null);
const alertMsg = ref();
const query = ref("");
const mappedData = ref<any>([]);
const apiBranchData = ref<ApiBranchListingType[] | undefined>();
const syncDialog = ref(false);
const syncId = ref<number | null>(null);
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const page = ref(1);
const isRetated = ref(false);
const relatedMessage = ref("");
const pageLoading = ref(false);
const userPermissions = ref<number[]>([]);
const unAuthorized = ref(false);

const fetchData = async (page = 1) => {
  loading.value = true;
  try {
    const response = await http.get(`branch/list?page=${page}`);
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
  // Get API branch info if available
  try {
    const response = await http.get("branches/get-api-branches");
    apiBranchData.value = response.data.data;
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
};

// Computed properties
const filteredData = computed(() => {
  const val = query.value.toLowerCase();
  return mappedData.value.filter((item: BranchListingType) =>
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
  if (!newVal) branchData.value = null;
});
watch(deleteDialog, (newVal) => {
  if (!newVal) deletedId.value = null;
});

// Function to create or edit a branch
const onCreateEditClick = (data: BranchListingType | null) => {
  if (!data) {
    branchData.value = {
      id: -1,
      name: "",
      gm_id: null,
      bill_split: false,
    };
  } else {
    branchData.value = data;
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

// Function to create or update a branch
async function onCreateUpdate(data: BranchListingType) {
  const endpoint = data.id === -1 ? "branch/create" : `branch/update`;
  try {
    const response = await http.post(endpoint, data);
    if (response?.data?.status) {
      if (data.id === -1) {
        filteredData.value.unshift(response.data);
      } else {
        const index = filteredData.value.findIndex(
          (item: BranchListingType) => item.id === data.id
        );
        if (index !== -1) {
          filteredData.value.splice(index, 1, response.data);
        }
      }
      fetchData();
    }
    alertMsg.value = response.data;
    const icon = alertMsg.value.status ? "success" : "error";
    const title = alertMsg.value.status ? "success" : "error";
    ({ icon, title, text: alertMsg.value.message });
    Swal.fire({ icon, title, text: alertMsg.value.message, timer: 2000 });
  } catch (error) {
    console.log(error, "error coming");
  }
  dialog.value = false;
}

// Function to delete a branch
const onDelete = async (id: number) => {
  deletedId.value = id;
  try {
    const response = await http.post("branch/retated/list", {
      id: deletedId.value,
    });
    isRetated.value = response.data.isRetated;
    relatedMessage.value = response.data.message;
  } catch (error) {
    console.error(error);
  }
  deleteDialog.value = true;
};

// Function to confirm deletion of a branch
async function onConfirm() {
  try {
    const response = await http.post("branch/delete", { id: deletedId.value });
    alertMsg.value = response.data;
    const icon = alertMsg.value.status ? "success" : "error";
    const title = alertMsg.value.status ? "success" : "error";
    Swal.fire({ icon, title, text: alertMsg.value.msg, timer: 2000 });
  } catch (error) {
    console.error(error);
  }
  deleteDialog.value = false;
  fetchData();
}

// Function to sync a branch
const onSync = async (id: number) => {
  syncId.value = id;
  syncDialog.value = true;
};

// Function to confirm branch synchronization
const onSyncConfirm = async () => {
  loading.value = true;
  try {
    const response = await http.get("branch/sync/" + syncId.value);
    console.log(response);
    loading.value = false;
    alertMsg.value = response.data;
    const icon = alertMsg.value.status ? "success" : "error";
    const title = alertMsg.value.status ? "success" : "error";
    Swal.fire({ icon, title, text: alertMsg.value.msg, timer: 2000 });
    syncDialog.value = false;
  } catch (error) {
    console.error(error);
  }
};
// Called on component mount
onMounted(async () => {
  pageLoading.value = true;
  try {
    // Fetch permissions
    userPermissions.value = await getPermissions();
    // Fetch other necessary data
    await fetchData();
  } catch (error) {
    console.error("Failed to fetch permissions:", error);
  }
  pageLoading.value = false;
});
</script>

<template>
  <PageLoad v-if="pageLoading" />
  <Unauthorized v-else-if="unAuthorized || !userPermissions.includes(23)" />
  <Card v-else :title="`${$t('t-branch')} ${$t('t-list')}`">
    <template #title-action>
      <div v-if="userPermissions.includes(24)">
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
        :headerItems="branchHeaders"
      >
        <template #body>
          <tr
            v-for="(item, index) in filteredData"
            :key="'branch-list-item-' + index"
            height="50"
          >
            <td>
              {{ item.name }}
            </td>
            <td>
              <TableAction
                :editButton="userPermissions.includes(25)"
                :deleteButton="userPermissions.includes(27)"
                :syncButton="
                  userPermissions.includes(26) && item.gm_id ? true : false
                "
                @onSync="onSync(item.id)"
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
  <CreateEditBranch
    v-if="branchData"
    :data="branchData"
    :apiBranchData="apiBranchData"
    v-model="dialog"
    @onCreateUpdate="onCreateUpdate"
  />
  <RemoveItemConfirmationDialog
    v-if="deletedId"
    v-model="deleteDialog"
    :is-related="isRetated"
    :message="relatedMessage"
    @onConfirm="onConfirm"
  />

  <SyncConfirmationDialog
    v-if="syncDialog"
    :loading="loading"
    v-model="syncDialog"
    @onConfirm="onSyncConfirm"
  />
</template>
