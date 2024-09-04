<script lang="ts" setup>
import { ref, watch, computed, onMounted } from "vue";
import Table from "@/app/common/components/Table.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import Status from "@/app/common/components/Status.vue";
import { roleHeaders } from "@/components/dashboard/roles/utils";
import { Avatar2 } from "@/assets/images/users/utils";
import CreateEditRole from "@/components/dashboard/roles/CreateEditRole.vue";
import { RoleListingType } from "@/components/dashboard/roles/types";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import Swal from "sweetalert2";
import HttpService from "@/app/http/httpService";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const http = new HttpService();
const loading = ref(false);
const dialog = ref(false);
const roleData = ref<RoleListingType | any>(null);
const deleteDialog = ref(false);
const deletedId = ref<number | null>(null);
const alertMsg = ref();
const query = ref("");
const mappedData = ref<any>([]);
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const page = ref(1);
const isSuperAdmin = ref<boolean>(
  Number(localStorage.getItem("user_id")) === 1
);

const fetchData = async (page = 1) => {
  loading.value = true;
  try {
    const response = await http.get(`role/list?page=${page}`);
    mappedData.value = response.data.data.data;
    totalItems.value = response.data.data.total;
    currentPage.value = response.data.data.current_page;
    itemsPerPage.value = response.data.data.per_page;
    updatePagination();
  } catch (error) {
    console.log(error);
  }
  loading.value = false;
};

// Computed properties
const filteredData = computed(() => {
  const val = query.value.toLowerCase();
  return mappedData.value.filter((item: RoleListingType) =>
    item.role.toLowerCase().includes(val)
  );
});

const config = ref({
  page: currentPage.value,
  start: 0,
  end: 0,
  noOfItems: totalItems.value,
  itemsPerPage: itemsPerPage.value,
});

// Called on component mount
onMounted(() => {
  fetchData();
});

// Watchers
watch(page, () => fetchData(page.value));
watch(query, updatePagination);
watch(dialog, (newVal) => {
  if (!newVal) roleData.value = null;
});
watch(deleteDialog, (newVal) => {
  if (!newVal) deletedId.value = null;
});

// Function to create or edit a role
const onCreateEditClick = async (data: RoleListingType | null) => {
  if (!data) {
    roleData.value = {
      id: -1,
      role: "",
      status: 1,
      permissions: [],
      dashboard_id: null,
    };
  } else {
    const roleId = data.id;
    const response = await http.get(`role/${roleId}`);
    //send both data and response data as  roleData
    roleData.value = { ...data, ...response.data.data };
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

// Function to create or update a role
async function onCreateUpdate(data: RoleListingType) {
  const endpoint = data.id === -1 ? "role/create" : `role/update`;
  try {
    const response = await http.post(endpoint, data);
    alertMsg.value = response.data;
    const icon = alertMsg.value.status ? "success" : "error";
    const title = alertMsg.value.status ? t("t-success") : t("t-error");
    Swal.fire({ icon, title, text: alertMsg.value.message, timer: 2000 });

    if (data.id === -1) {
      filteredData.value.unshift(response.data);
    } else {
      const index = filteredData.value.findIndex(
        (item: RoleListingType) => item.id === data.id
      );
      if (index !== -1) {
        filteredData.value.splice(index, 1, response.data);
      }
    }
    fetchData();
  } catch (error) {
    console.log(error, "error coming");
  }
  dialog.value = false;
}

// Function to delete a role
const onDelete = async (item: any) => {
  if (item.users && item.users.length) {
    const text = t("t-role-has-assigned-users");
    const icon = "error";
    const title = t("t-error");
    Swal.fire({ icon, title, text, timer: 2000 });
  } else {
    deletedId.value = item.id;
    deleteDialog.value = true;
  }
};

// Confirm deletion of role
async function onConfirm() {
  try {
    const response = await http.post("role/delete", { id: deletedId.value });
    alertMsg.value = response.data;
    const icon = alertMsg.value.status ? "success" : "error";
    const title = alertMsg.value.status ? t("t-success") : t("t-error");
    Swal.fire({ icon, title, text: alertMsg.value.msg, timer: 2000 });
  } catch (error) {
    console.error(error);
  }
  deleteDialog.value = false;
  fetchData();
}

const getUserImagePath = (imageName: string) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  return `${apiUrl}user/image/${imageName}`;
};
</script>

<template>
  <div v-if="!isSuperAdmin" class="text-center my-10">
    <v-avatar size="80" color="primary" variant="tonal" class="mb-3">
      <i class="ph-lock-key" style="font-size: 30px" color="primary" />
    </v-avatar>
    <div class="font-weight-bold text-subtitle-1 mb-1">
      {{ $t("t-access-denied") }}
    </div>
    <div class="text-muted">
      {{ $t("t-access-denied-message") }}
    </div>
  </div>
  <Card v-else :title="`${$t('t-roles')} ${$t('t-list')}`">
    <template #title-action>
      <div>
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
        :headerItems="roleHeaders"
      >
        <template #body>
          <tr
            v-for="(item, index) in filteredData"
            :key="'role-list-item-' + index"
            height="50"
          >
            <td>
              {{ item.role }}
            </td>
            <td>
              <div v-if="item.users && item.users.length" class="d-flex">
                <div
                  class="position-relative"
                  v-for="(avatar, index) in item.users"
                  :key="avatar.id"
                >
                  <v-tooltip
                    v-if="index < 3"
                    :text="avatar.name"
                    location="top"
                  >
                    <template v-slot:activator="{ props }">
                      <v-avatar
                        v-bind="props"
                        size="30"
                        class="avatar-group-item curser-pointer"
                      >
                        <v-img
                          v-if="avatar.image"
                          :src="getUserImagePath(avatar.image)"
                        />
                        <v-img v-else :src="Avatar2" />
                      </v-avatar>
                    </template>
                  </v-tooltip>
                </div>
                <v-tooltip
                  v-if="item.users.length > 3"
                  :text="`+${item.users.length - 3} more`"
                  location="top"
                >
                  <template v-slot:activator="{ props }">
                    <v-avatar
                      v-bind="props"
                      size="30"
                      class="avatar-group-item curser-pointer"
                      color="primary"
                    >
                      +{{ item.users.length - 3 }}
                    </v-avatar>
                  </template>
                </v-tooltip>
              </div>
              <div v-else class="d-flex align-items-center">
                <span>{{ $t("t-no-assigned-users") }}</span>
              </div>
            </td>

            <td>
              <Status :status="item.status == 1 ? 'active' : 'inActive'" />
            </td>
            <td>
              <TableAction
                :deleteButton="item.id == 1 ? false : true"
                @onEdit="onCreateEditClick(item)"
                @onDelete="onDelete(item)"
              />
            </td>
          </tr>
        </template>
      </Table>
      <div v-if="!filteredData.length" class="text-center my-10">
        <v-avatar size="80" color="primary" variant="tonal" class="mb-3">
          <i
            class="ph-magnifying-glass"
            style="font-size: 30px"
            color="primary"
          />
        </v-avatar>
        <div class="font-weight-bold text-subtitle-1 mb-1">
          {{ $t("t-no-result-found") }}
        </div>
        <div class="text-muted">
          {{ $t("t-no-result-message") }}
        </div>
      </div>
    </v-card-text>
  </Card>
  <CreateEditRole
    v-if="roleData"
    :data="roleData"
    v-model="dialog"
    @onCreateUpdate="onCreateUpdate"
  />
  <RemoveItemConfirmationDialog
    v-if="deletedId"
    v-model="deleteDialog"
    @onConfirm="onConfirm"
  />
</template>
