<script lang="ts" setup>
import { ref, onMounted, watch } from "vue";
import { UserListingType } from "@/components/dashboard/users/types";
import HttpService from "@/app/http/httpService";
import { Avatar2 } from "@/assets/images/users/utils";
import { resetPermissions } from "@/app/http/services/permissionService";

const http = new HttpService();
const userId = localStorage.getItem("user_id");
const roleId = localStorage.getItem("role_id");
const profileData = ref<UserListingType>();
const roleName = ref<string>("");
const assignedBranchLabels = ref<string[]>([]);
const dialog = ref(false);

const fetchData = async () => {
  try {
    const [userResponse, branchResponse, roleResponse] = await Promise.all([
      http.get(`getuser/${userId}`),
      http.get("get-allbranch"),
      http.get(`role/${roleId}`),
    ]);

    const userData = userResponse.data.data;
    profileData.value = userData;
    roleName.value = roleResponse.data.data.role;
    const userBranches = userData.branches ? JSON.parse(userData.branches) : [];
    const allBranches = branchResponse.data.data;

    assignedBranchLabels.value = allBranches
      .filter((branch: any) => userBranches.includes(branch.id))
      .map((branch: any) => branch.name);
  } catch (error) {
    console.log(error);
  }
};

const Logout = (): void => {
  localStorage.removeItem("user_name");
  localStorage.removeItem("access_token");
  localStorage.removeItem("selectedBranchLabel");
  localStorage.removeItem("selectedBranchID");
  resetPermissions();
};

const getUserImagePath = (imageName: string) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  return `${apiUrl}user/image/${imageName}`;
};

const formatRole = (role: string) => {
  return role.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

onMounted(async () => {
  await fetchData();
});
</script>
<template>
  <v-menu width="175">
    <template v-slot:activator="{ props }">
      <a dark v-bind="props" class="d-flex align-center mx-3">
        <v-avatar size="small" class="user-profile">
          <v-img
            v-if="profileData?.image"
            :src="getUserImagePath(profileData.image)"
            class="rounded-circle"
          />
          <v-img v-else :src="Avatar2" class="rounded-circle" />
        </v-avatar>
        <span class="text-start ms-xl-3">
          <h4
            class="d-none d-xl-inline-block user-name-text font-weight-medium"
          >
            {{ profileData?.name }}
          </h4>
          <span class="d-none d-xl-block user-name-sub-text">{{
            formatRole(roleName)
          }}</span>
        </span>
      </a>
    </template>
    <v-list density="compact" :lines="false" class="profile-list" nav>
      <h6 class="dropdown-header">
        {{ $t("t-welcome") }} <br />
        {{ profileData?.name }}
      </h6>
      <v-list-item class="dropdown-item" @click="" to="/edit-profile">
        <i class="mdi mdi-account-circle text-muted" />
        {{ $t("t-profile") }}
      </v-list-item>
      <v-divider class="my-2" />
      <v-list-item class="dropdown-item" @click="" to="/system/users">
        <div class="d-flex justify-space-between">
          <div>
            <i class="mdi mdi-account-cog-outline text-muted" />
            <span class="align-middle">{{ $t("t-user-settings") }}</span>
          </div>
        </div>
      </v-list-item>
      <v-list-item class="dropdown-item" @click="" to="/settings">
        <div class="d-flex justify-space-between">
          <div>
            <i class="mdi mdi-cog-outline text-muted" />
            <span class="align-middle">{{ $t("t-system-settings") }}</span>
          </div>
        </div>
      </v-list-item>
      <!-- <v-list-item class="dropdown-item" @click="" to="/auth/lockscreen">
        <i class="mdi mdi-lock text-muted" />
        <span class="align-middle">{{ $t("t-lock-screen") }}</span>
      </v-list-item> -->
      <v-list-item class="dropdown-item" @click="Logout()" to="/login">
        <i class="mdi mdi-logout text-muted" />
        <span class="align-middle" data-key="t-logout"
          >{{ $t("t-logout") }}
        </span>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
