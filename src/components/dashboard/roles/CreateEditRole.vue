<script lang="ts" setup>
import { RoleListingType } from "@/components/dashboard/roles/types";
import {
  PropType,
  computed,
  defineEmits,
  defineProps,
  ref,
  watch,
  onMounted,
} from "vue";
import { useVuelidate } from "@vuelidate/core";
import { required, maxLength } from "@vuelidate/validators";
import HttpService from "@/app/http/httpService";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { statusOptions } from "@/components/dashboard/roles/utils";

const http = new HttpService();
const emit = defineEmits(["update:modelValue", "onCreateUpdate"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<RoleListingType>,
    required: true,
  },
});

interface Permission {
  id: number;
  label: string;
}

interface RolePermissionGroup {
  id: number;
  label: string;
  permissions: Permission[];
}

const rolePermission = ref<RolePermissionGroup[]>([]);

// Ensure that the getPermissions function is called only once
let isGetPermissionsCalled = false;
const getPermissions = async () => {
  if (!isGetPermissionsCalled) {
    try {
      const response = await http.get("permission/list");
      const rowPermissions: any[] = response.data.data;

      const groupedPermissions = rowPermissions.reduce(
        (acc: { [key: string]: RolePermissionGroup }, curr: any) => {
          if (curr.permission && curr.id) {
            const parts = curr.permission.split("_");
            const action = parts.pop();
            const groupKey = parts.join("_");

            if (action) {
              const groupLabel = parts
                .map(
                  (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join(" ");

              if (!acc[groupKey]) {
                acc[groupKey] = {
                  id: Object.keys(acc).length + 1,
                  label: `${groupLabel} Management`,
                  permissions: [],
                };
              }

              acc[groupKey].permissions.push({
                id: curr.id,
                label: `${action.charAt(0).toUpperCase() + action.slice(1)}`,
              });
            }
          }

          return acc;
        },
        {}
      );

      rolePermission.value = Object.values(groupedPermissions);
    } catch (error) {
      console.error(error);
    }

    isGetPermissionsCalled = true;
  }
};

getPermissions();
const isCreate = props.data.id === -1;
const formData = ref<RoleListingType>(props.data);
const role = ref(formData.value.role || "");
const status = ref(formData.value.status ?? 1);
const dashboard_id = ref<any>(formData.value.dashboard_id);
const permissions = ref<any[]>(formData.value.permissions || []);
const isSuperAdmin = ref<boolean>(formData.value.role_id === 1 || false);
const dashboards = ref();
const loading = ref(false);
const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const fetchDashboardData = async () => {
  loading.value = true;
  try {
    const response = await http.get(`dashboard/list`);
    const dashboardItems = response.data.data.data;
    console.log("Dataaaa", dashboardItems);
    // mappedData.value = data.data;
    // totalItems.value = data.total;
    // currentPage.value = data.current_page;
    // itemsPerPage.value = data.per_page;
    // componentModel.value = data.map((item: ItemListingType) => item.componentModel).flat();
    dashboards.value = dashboardItems.map((item: any) => ({
      value: item.id,
      label: item.name,
    }));
    console.log("dashboards.valueeeee", dashboards.value);
  } catch (error) {
    console.error(error);
  }
  loading.value = false;
};

// Add validation rules
const rules = {
  role: { required, maxLength: maxLength(50) },
  status: { required },
  permissions: { required },
  dashboard_id: { required },
};

// Define validation rules and apply them to the form data using Vuelidate
const v$ = useVuelidate(rules, { role, status, permissions, dashboard_id });

const onSave = () => {
  // validate form
  v$.value.$validate();
  // check validation
  if (!v$.value.$invalid) {
    // save data
    const data = {
      ...props.data,
      role: role.value,
      status: status.value,
      permissions: permissions.value,
      dashboard_id: dashboard_id.value,
    };
    emit("onCreateUpdate", data);
  }
};

// Watch the permissions array for changes
watch(permissions, (newPermissions) => {
  rolePermission.value.forEach((group) => {
    const firstPermissionId = group.permissions[0].id;
    const otherPermissionIds = group.permissions.slice(1).map((p) => p.id);

    // If any other child permission is checked, ensure the first one is checked too
    if (otherPermissionIds.some((id) => newPermissions.includes(id))) {
      if (!newPermissions.includes(firstPermissionId)) {
        permissions.value = [...newPermissions, firstPermissionId];
      }
    }
  });
});
// Watch the permissions and update parent checkboxes accordingly
const parentChecked = computed(() => {
  return rolePermission.value.reduce(
    (acc: { [key: number]: boolean }, group) => {
      acc[group.id] = group.permissions.every((permission) =>
        permissions.value.includes(permission.id)
      );
      return acc;
    },
    {}
  );
});

const indeterminateChecked = computed(() => {
  return rolePermission.value.reduce(
    (acc: { [key: number]: boolean }, group) => {
      acc[group.id] =
        group.permissions.some((permission) =>
          permissions.value.includes(permission.id)
        ) &&
        !group.permissions.every((permission) =>
          permissions.value.includes(permission.id)
        );
      return acc;
    },
    {}
  );
});

const toggleParent = (groupKey: number, parentPermissions: Permission[]) => {
  const isChecked = parentChecked.value[groupKey];
  if (isChecked) {
    permissions.value = permissions.value.filter(
      (permissionId: number) =>
        !parentPermissions.some((p) => p.id === permissionId)
    );
  } else {
    const childIds = parentPermissions.map((permission) => permission.id);
    permissions.value = [...permissions.value, ...childIds];
  }
};

onMounted(fetchDashboardData);
</script>

<template>
  <v-dialog
    v-model="dialogValue"
    max-width="1000"
    :scrollable="false"
    persistent
  >
    <Card
      :title="isCreate ? 'Add Role' : 'Edit Role'"
      title-class="py-0"
      style="overflow: hidden"
    >
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />
      <v-card-text data-simplebar style="max-height: calc(100vh - 500px)">
        <v-row>
          <v-col cols="6">
            <div class="font-weight-bold mb-1">
              Role <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <v-text-field
              v-model="role"
              hide-details
              variant="solo"
              density="compact"
              class="text-field-component"
              placeholder="Enter Role Name"
              :readonly="!isCreate"
              :class="{
                'is-invalid': v$.role.$errors.length,
              }"
            />
            <div v-if="v$.role.$invalid" class="invalid-feedback">
              <span v-for="error in v$.role.$errors">
                {{ error.$message }}
              </span>
            </div>
          </v-col>
          <v-col cols="6">
            <div class="font-weight-bold mb-1">
              Status <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <MenuSelect
              :disabled="isSuperAdmin"
              :clearable="false"
              v-model="status"
              :items="statusOptions"
              :class="{
                'is-invalid': v$.status.$errors.length,
              }"
            />
            <div v-if="v$.status.$errors" class="invalid-feedback">
              <span v-for="error in v$.status.$errors">
                {{ error.$message }}
              </span>
            </div>
          </v-col>
        </v-row>
        <div class="font-weight-bold mt-3 mb-4">
          Role Permissions
          <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <v-expansion-panels class="mt-4 mb-2 expansion-panels expansion-panel">
          <v-row>
            <v-col
              cols="6"
              class="py-0 pt-1"
              v-for="(item, index) in rolePermission"
              :key="'expansion-panel-' + index"
            >
              <v-expansion-panel>
                <v-expansion-panel-title
                  class="text-caption font-weight-medium"
                >
                  <v-checkbox
                    :disabled="isSuperAdmin"
                    hide-details
                    density="compact"
                    color="primary"
                    style="flex: none"
                    :indeterminate="indeterminateChecked[item.id]"
                    v-model="parentChecked[item.id]"
                    @click.stop="toggleParent(item.id, item.permissions)"
                  >
                    <template #label>
                      <span> {{ item.label }} </span>
                    </template>
                  </v-checkbox>
                </v-expansion-panel-title>
                <v-expansion-panel-text class="text-muted pt-2">
                  <v-row class="mx-3">
                    <v-col
                      class="py-0"
                      v-for="permission in item.permissions"
                      :key="permission.id"
                    >
                      <v-checkbox
                        :disabled="isSuperAdmin"
                        v-model="permissions"
                        :value="permission.id"
                        hide-details
                        density="compact"
                        color="primary"
                      >
                        <template #label>
                          <span> {{ permission.label }} </span>
                        </template>
                      </v-checkbox>
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-col>
          </v-row>
        </v-expansion-panels>
        <div v-if="v$.permissions.$invalid" class="invalid-feedback">
          <span v-for="error in v$.permissions.$errors">
            {{ error.$message }}
          </span>
        </div>
        <div class="mt-3">
          <v-row>
            <v-col cols="6" lg="6">
              <div class="font-weight-bold mb-1 mt-3">
                Dashboards
                <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="dashboard_id"
                :items="dashboards"
                placeholder="Select Dashboards"
                :class="{
                  'is-invalid': v$.dashboard_id.$errors.length,
                }"
              />
              <div v-if="v$.dashboard_id.$errors" class="invalid-feedback">
                <span v-for="error in v$.dashboard_id.$errors">
                  {{ error.$message }}
                </span>
              </div>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-row justify="end">
          <v-col class="text-right">
            <v-btn color="danger" @click="dialogValue = false"> Close</v-btn>
            <v-btn color="primary" variant="elevated" @click="onSave">
              {{ isCreate ? "Create" : "Update" }}</v-btn
            >
          </v-col>
        </v-row>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
