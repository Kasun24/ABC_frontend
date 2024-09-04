<script lang="ts" setup>
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import Status from "@/app/common/components/Status.vue";
import Table from "@/app/common/components/Table.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import HttpService from "@/app/http/httpService";
import { Avatar2 } from "@/assets/images/users/utils";
import CreateEditUser from "@/components/dashboard/users/CreateEditUser.vue";
import { UserListingType } from "@/components/dashboard/users/types";
import { userHeaders } from "@/components/dashboard/users/utils";
import Swal from "sweetalert2";
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { getPermissions } from "@/app/http/services/permissionService";
import { useRouter } from "vue-router";
import PageLoad from "@/app/common/components/common/PageLoad.vue";
import Unauthorized from "@/app/common/components/common/Unauthorized.vue";
import NoResult from "@/app/common/components/common/NoResult.vue";

const { t } = useI18n();
const http = new HttpService();
const dialog = ref(false);
const userData = ref<UserListingType | null>(null);
const deleteDialog = ref(false);
const deletedId = ref<number | null>(null);
const page = ref(1);
const mappedData = ref<UserListingType[]>([]);
const loading = ref(false);
const pageLoading = ref(false);
const alertMsg = ref();
const query = ref("");
const tab = ref(0);
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const unAuthorized = ref(false);
const userPermissions = ref<number[]>([]);
const userId = localStorage.getItem("user_id");
const profileData = ref<UserListingType>();
const loggedInUserId = ref<number | null>(null);
const router = useRouter();

// Define available tabs
const tabs = ref<{ id: number; name: string }[]>([{ id: 0, name: "All" }]);

const fetchData = async (page = 1, role_id = 0) => {
  loading.value = true;
  try {
    const roleParam = role_id !== 0 ? `&role_id=${role_id}` : "";
    const response = await http.get(`user/list?page=${page}${roleParam}`);
    mappedData.value = response.data.data.data;
    totalItems.value = response.data.data.total;
    currentPage.value = response.data.data.current_page;
    itemsPerPage.value = response.data.data.per_page;

    if (userId) {
      loggedInUserId.value = parseInt(userId);
      const userResponse = await http.get(`getuser/${userId}`);
      profileData.value = userResponse.data.data;
    }
    updatePagination();
  } catch (error: any) {
    if (error.response.status === 403) {
      unAuthorized.value = true;
    }
  }
  loading.value = false;
};

const fetchRoles = async () => {
  try {
    const response = await http.get("role/list");
    const roleData = response.data.data.data;
    tabs.value = [
      { id: 0, name: "All" },
      ...roleData.map((role: any) => ({ id: role.id, name: role.role })),
    ];
  } catch (error) {
    console.log(error);
  }
};

// Computed properties
const filteredData = computed(() => {
  const val = query.value.toLowerCase();
  return mappedData.value.filter(
    (item: UserListingType) =>
      item.name.toLowerCase().includes(val) ||
      item.email.toLowerCase().includes(val)
  );
});

// Pagination config
const config = ref({
  page: currentPage.value,
  start: 0,
  end: 0,
  noOfItems: totalItems.value,
  itemsPerPage: itemsPerPage.value,
});

//logout function
const Logout = (): void => {
  console.log("Logout function called"); // Debugging line
  localStorage.removeItem("user_name");
  localStorage.removeItem("access_token");
  localStorage.removeItem("selectedBranchLabel");
  localStorage.removeItem("selectedBranchID");
  localStorage.removeItem("user_id"); // Ensure user_id is also removed
  router
    .push("/login")
    .then(() => {
      console.log("Redirected to login page"); // Debugging line
    })
    .catch((error) => {
      console.error("Failed to redirect:", error); // Debugging line
    });
};

// Watchers
watch(page, () => fetchData(page.value, tab.value));
watch(query, updatePagination);
watch(dialog, (newVal) => {
  if (!newVal) userData.value = null;
});
watch(deleteDialog, (newVal) => {
  if (!newVal) deletedId.value = null;
});
watch(tab, (newVal) => {
  page.value = 1;
  currentPage.value = 1;
  fetchData(1, newVal);
  updatePagination();
});

// Function to create or edit a user
const onCreateEditClick = (data: UserListingType | null) => {
  if (!data) {
    userData.value = {
      id: -1,
      role_id: null,
      branches: JSON.stringify([]),
      image: "",
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      status: 1,
    };
  } else {
    userData.value = data;
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

// Create or update user
async function onCreateUpdate(data: UserListingType) {
  const endpoint = data.id === -1 ? "user/create" : `user/update`;
  try {
    const response = await http.post(endpoint, data);
    alertMsg.value = response.data;
    const icon = alertMsg.value.status ? "success" : "error";
    const title = alertMsg.value.status ? t("t-success") : t("t-error");
    Swal.fire({ icon, title, text: alertMsg.value.message, timer: 2000 });

    if (data.id === -1) {
      // Add new user
      filteredData.value.unshift(response.data);
    } else {
      // Update existing user
      const index = filteredData.value.findIndex(
        (item: UserListingType) => item.id === data.id
      );
      if (index !== -1) {
        filteredData.value.splice(index, 1, response.data);
      }
    }
    fetchData();
    // Check if status is changing to "inactive" and it's the logged-in user's own profile
    if (data.status === 0 && data.id.toString() === userId) {
      // Show success alert and then call logout
      Swal.fire({
        icon: "success",
        title: t("t-success"),
        text: t("t-your-account-has-been-deleted"),
        timer: 2000,
      }).then(() => {
        Logout();
      });
    }
    fetchData(currentPage.value, tab.value);
  } catch (error: any) {
    if (error.response.status === 403) {
      const message = t("t-action_blocked_message");
      const icon = "error";
      const title = t("t-error");
      Swal.fire({ icon, title, text: message, timer: 2000 });
    } else {
      console.log(error);
    }
  }
  dialog.value = false;
}

// Delete user
async function onDelete(id: number) {
  deletedId.value = id;
  deleteDialog.value = true;
}

// Confirm deletion of user
// async function onConfirm() {
//   try {
//     const response = await http.post("user/delete", { id: deletedId.value });
//     alertMsg.value = response.data;
//     const icon = alertMsg.value.status ? "success" : "error";
//     const title = alertMsg.value.status ? t("t-success") : t("t-error");
//     Swal.fire({ icon, title, text: alertMsg.value.msg, timer: 2000 });
//   } catch (error: any) {
//     if (error.response.status === 403) {
//       const message = t("t-action_blocked_message");
//       const icon = "error";
//       const title = t("t-error");
//       Swal.fire({ icon, title, text: message, timer: 2000 });
//     } else {
//       console.log(error);
//     }
//   }
//   deleteDialog.value = false;
//   fetchData();
// }

// Confirm deletion of user
async function onConfirm() {
  try {
    const response = await http.post("user/delete", { id: deletedId.value });
    alertMsg.value = response.data;
    const icon = alertMsg.value.status ? "success" : "error";
    const title = alertMsg.value.status ? t("t-success") : t("t-error");

    if (deletedId.value === loggedInUserId.value) {
      // User is deleting their own account
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: t("t-do-you-really-want-to-delete-your-own-account"),
        showCancelButton: true,
        confirmButtonText: t("t-yes"),
        cancelButtonText: t("t-no"),
      }).then((result) => {
        if (result.isConfirmed) {
          // Show success alert and then call logout
          Swal.fire({
            icon: "success",
            title: t("t-success"),
            text: t("t-your-account-has-been-deleted"),
            timer: 2000,
          }).then(() => {
            Logout(); // Call logout after success alert
          });
        } else {
          deleteDialog.value = false; // Close the dialog if canceled
        }
      });
    } else {
      // User is deleting another user's account
      Swal.fire({ icon, title, text: alertMsg.value.msg, timer: 2000 }).then(
        () => {
          fetchData(currentPage.value, tab.value);
        }
      );
    }
  } catch (error: any) {
    if (error.response?.status === 403) {
      const message = t("t-action_blocked_message");
      const icon = "error";
      const title = t("t-error");
      Swal.fire({ icon, title, text: message, timer: 2000 });
    } else {
      console.log(error);
    }
  }
  deleteDialog.value = false;
  fetchData(currentPage.value, tab.value);
}

const getUserImagePath = (imageName: string) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  return `${apiUrl}user/image/${imageName}`;
};

// Called on component mount
onMounted(async () => {
  pageLoading.value = true;
  try {
    // Fetch permissions
    userPermissions.value = await getPermissions();
    // Fetch other necessary data
    await fetchData();
    await fetchRoles();
  } catch (error) {
    console.error("Failed to fetch permissions:", error);
  }
  pageLoading.value = false;
});
</script>

<template>
  <PageLoad v-if="pageLoading" />
  <Unauthorized v-else-if="unAuthorized || !userPermissions.includes(1)" />
  <Card v-else :title="`${t('t-user')} ${t('t-list')}`">
    <template #title-action>
      <v-row justify="end" align="center">
        <v-col lg="3">
          <QuerySearch
            v-model="query"
            placeholder="`${$t('t-search-name-email')}`"
          />
        </v-col>
        <v-col v-if="userPermissions.includes(2)" cols="auto">
          <v-btn color="primary" @click="onCreateEditClick(null)">
            <i class="ph-plus-circle me-1" /> Add new
          </v-btn>
        </v-col>
      </v-row>
    </template>

    <v-card-text>
      <v-tabs v-model="tab" class="bg-primary-subtle">
        <v-tab v-for="item in tabs" :key="'tab-' + item.id" :value="item.id">
          {{ item.name }}
        </v-tab>
      </v-tabs>

      <v-divider />

      <Table
        v-model="page"
        is-pagination
        :config="config"
        :loading="loading"
        :headerItems="userHeaders"
      >
        <template #body>
          <tr
            v-for="(item, index) in filteredData"
            :key="'user-list-item-' + index"
            height="50"
          >
            <td>
              <div class="d-flex align-center">
                <div class="d-flex align-center">
                  <v-avatar density="compact" class="mx-2">
                    <v-img
                      v-if="item.image"
                      :src="getUserImagePath(item.image)"
                    />
                    <v-img v-if="!item.image" :src="Avatar2" />
                  </v-avatar>
                  <div>{{ item.name }}</div>
                </div>
              </div>
            </td>

            <td>{{ item.email }}</td>
            <td>
              <Status :status="item.status == 1 ? 'active' : 'inActive'" />
            </td>
            <td>
              <TableAction
                :deleteButton="item.id !== 1 && userPermissions.includes(4)"
                :editButton="userPermissions.includes(3)"
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
  <CreateEditUser
    v-if="userData"
    :data="userData"
    v-model="dialog"
    @onCreateUpdate="onCreateUpdate"
  />
  <RemoveItemConfirmationDialog
    v-if="deletedId"
    v-model="deleteDialog"
    @onConfirm="onConfirm"
  />
</template>
