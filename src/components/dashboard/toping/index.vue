<script lang="ts" setup>
import Status from "@/app/common/components/Status.vue";
import Table from "@/app/common/components/Table.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import HttpService from "@/app/http/httpService";
import { useVuelidate } from "@vuelidate/core";
import { maxLength, required } from "@vuelidate/validators";
import Swal from "sweetalert2";
import { Ref, computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { TopingList } from "./types";
import { defaultPriceHeaders, statusOptions, topingHeaders } from "./utils";
import { CategoryListingType } from "@/components/dashboard/category/types";
import { TopingSenarioList } from "@/components/dashboard/toping-scenario/types";
import eventBus from "@/components/layouts/topBar/eventBus";
import { getPermissions } from "@/app/http/services/permissionService";
import Unauthorized from "@/app/common/components/common/Unauthorized.vue";
import PageLoad from "@/app/common/components/common/PageLoad.vue";
import NoResult from "@/app/common/components/common/NoResult.vue"; 

const { t } = useI18n();
const items: Ref<TopingList[]> = ref([]);
const selectedStatus = ref("");
const dialogVisible = ref(false);
const name = ref("");
const categoryTypes = ref([]);
const scenarios = ref();
const scenarioList = ref();
const delivery = ref(10);
const pickup = ref();
const dinein = ref();
const categories = ref();
const isEditing = ref(false);
const editItemId = ref<number | null>(null);
const statusValue = ref("");
const http = new HttpService();
const query = ref("");
const mappedData = ref<TopingList[]>([]);
const loading = ref(false);
const totalItems = ref(0);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const pageLoading = ref(false);
const userPermissions = ref<number[]>([]);
const unAuthorized = ref(false);

const openPopup = () => {
  dialogVisible.value = true;
};

const closePopup = () => {
  dialogVisible.value = false;
  name.value = "";
  scenarios.value = [];
  categories.value = [];
  selectedStatus.value = "";
  isEditing.value = false;
  editItemId.value = null;
};

const fetchData = async (page = 1) => {
  loading.value = true;
  try {
    const response = await http.get(`toping/list?page=${page}`);
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
const getCategories = async () => {
  const response = await http.get(`menu-category/list`);
  categoryTypes.value = response.data.data.data.map((category: CategoryListingType) => ({
    value: category.id,
    label: category.name
  }));
};

const getTopingSenarios = async () => {
  const response = await http.get(`toping-scenario/list`);
  scenarioList.value = response.data.data.map((scenario: TopingSenarioList) => ({
    value: scenario.id,
    label: scenario.name
  }));
};


const filteredData = computed(() => {
  const val = query.value.toLowerCase();
  return mappedData.value.filter((item: TopingList) => item.name.toLowerCase().includes(val));
});

const page = ref(1);

const config = ref({
  page: currentPage.value,
  start: 0,
  end: 0,
  noOfItems: totalItems.value,
  itemsPerPage: itemsPerPage.value,
});

const emit = defineEmits(["update:modelValue", "onConfirm"]);


// Watchers
watch(page, () => fetchData(page.value));
watch(query, updatePagination);

function updatePagination() {
  config.value = {
    ...config.value,
    page: currentPage.value,
    noOfItems: totalItems.value,
    start: (currentPage.value - 1) * config.value.itemsPerPage,
    end: Math.min(currentPage.value * config.value.itemsPerPage, totalItems.value),
  };
}

const rules = {
  name: { required, maxLength: maxLength(255) },
  scenarios: { required },
  categories: { required },
  selectedStatus: { required },
};

const v$ = useVuelidate(rules, {
  name,
  scenarios,
  categories,
  selectedStatus,
});

const addItem = () => {
  v$.value.$validate();
  // check validation
  if (!v$.value.$invalid) {
    const newId = items.value.length + 1;

    // Create a new item with the provided details
    const newItem: TopingList = {
      id: -1,
      name: name.value,
      toping_scenario_ids: scenarios.value,
      menu_categories_ids: categories.value,
      delivery: delivery.value,
      pickup: pickup.value,
      dine_in: dinein.value,
      status: selectedStatus.value,
    };

    // Add the new item to the items array
    items.value.push(newItem);

    // Clear the input fields after adding the item
    name.value = "";
    scenarios.value = [];
    categories.value = [];
    selectedStatus.value = "";

    // Close the popup
    closePopup();

    // Show success message using SweetAlert
    Swal.fire({
      icon: "success",
      title: "Success",
      text: "Item added successfully!",
      timer: 2000,
      showConfirmButton: false,
    });
  }
};

const updateItem = () => {
  v$.value.$validate();
  // check validation
  if (!v$.value.$invalid) {
    // Find the index of the item being edited using the editItemId
    const index = items.value.findIndex((item) => item.id === editItemId.value);

    // Ensure the item exists in the array
    if (index !== -1) {
      // Update the item with the new data from the form fields
      items.value[index].name = name.value;
      // Clear the form fields
      name.value = "";
      scenarios.value = "";
      categories.value = "";
      selectedStatus.value = "";

      // Close the popup
      closePopup();

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Item updated successfully!",
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      // Handle error if the item is not found
      console.error("Item not found for update.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Item not found for update.",
      });
    }
  }
};

const onEdit = (item: TopingList) => {
  // Populate form fields with item data  
  name.value = item.name;
  if (item.toping_scenario_ids) {
  scenarios.value = item.toping_scenario_ids.split(',').map(Number);
} else {
  scenarios.value = [];
}
if (item.menu_categories_ids) {
  categories.value = item.menu_categories_ids.split(',').map(Number);
} else {
  categories.value = [];
}
delivery.value = item.delivery ?? "0";
pickup.value = item.pickup ?? "0";
dinein.value = item.dine_in ?? "0";

selectedStatus.value = item.status;
  isEditing.value = true;
  editItemId.value = item.id; // Ensure your items have a unique `id` field
  openPopup();
};

const saveItem = (item: TopingList) => {
  if (isEditing.value) {
    updateItem();
  } else if (!isEditing.value) {
    addItem();
  }
};

const onDelete = (item: TopingList) => {
  Swal.fire({
    icon: "warning",
    title: "Are you sure?",
    text: "You are about to delete this item.",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  }).then((result) => {
    // If user confirms deletion
    if (result.isConfirmed) {
      // Find the index of the item in the items array
      const index = items.value.findIndex((i) => i === item);

      // Remove the item from the items array
      if (index !== -1) {
        items.value.splice(index, 1);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Item deleted successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    }
  });
};

const extraNames = computed(() => {
  return items.value.map((item) => item.name);
});

// Called on component mount
onMounted(async () => {
  pageLoading.value = true;
  try {
    // Fetch permissions
    userPermissions.value = await getPermissions();
    // Fetch other necessary data
    await fetchData();
    await getCategories();
    await getTopingSenarios();
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
  <!---------------------------------- open popup --------------------------------------->
  <PageLoad v-if="pageLoading" />
<Unauthorized v-else-if="unAuthorized || !userPermissions.includes(13)" />
  <v-card v-else flat>
    <v-dialog v-model="dialogVisible" width="500">
      <Card :title="`${$t('t-create')} ${$t('t-toping')}`" title-class="py-0">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="closePopup" />
        </template>
        <v-divider />
        <v-card-text>
          <div class="font-weight-bold mb-1">{{ $t("t-name") }}</div>
          <TextField
            v-model="name"
            placeholder="`${$t('t-name')}`"
            hide-details
            :class="{
              'is-invalid': v$.name.$errors.length,
            }"
          />
          <div v-if="v$.name.$errors" class="invalid-feedback">
            <span v-for="error in v$.name.$errors">
              {{ error.$message }}
            </span>
          </div>
          <v-row>
            <v-col cols="12" lg="12">
              <div class="font-weight-bold mb-1 mt-3">{{ $t("t-select-toping-scenario") }}</div>
              <MenuSelect
                v-model="scenarios"
                multiple
                placeholder="`${$t('t-toping-scenario')}`"
                hide-details
                :items="scenarioList"
                :class="{
                  'is-invalid': v$.scenarios.$errors.length,
                }"
              />
              <div
                v-if="v$.scenarios.$errors"
                class="invalid-feedback"
              >
                <span v-for="error in v$.scenarios.$errors">
                  {{ error.$message }}
                </span>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" lg="12">
              <div class="font-weight-bold mb-1 mt-3">
                {{ $t("t-select-category") }}
              </div>
              <MenuSelect
                v-model="categories"
                multiple
                placeholder="`${$t('t-category')}`"
                hide-details
                :items="categoryTypes"
                :class="{
                  'is-invalid': v$.categories.$errors.length,
                }"
              />
              <div
                v-if="v$.categories.$errors"
                class="invalid-feedback"
              >
                <span v-for="error in v$.categories.$errors">
                  {{ error.$message }}
                </span>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <div class="font-weight-bold mb-1 mt-3">{{ $t("t-default-prices") }}</div>
            </v-col>
          </v-row>
          
          <v-row>
              <v-col cols="12">
                <Table :headerItems="defaultPriceHeaders">
                  <template #body>
                    <!-- <tr v-for="(item, index) in items.slice(0, 5)" :key="index" height="30">
                      <td>{{ defaultPriceNumbers[index] }}</td>
                      <td v-for="field in ['deliveryModel', 'pickupModel', 'dineinModel']" :key="field">
                        <TextField
                          class="my-1"
                          density="compact"
                          v-model="item[field]"
                          hide-details
                          type="number"
                        />
                      </td>
                    </tr> -->
                    <tr height="30">
                      <td>#</td>
                      <td>
                        <TextField
                          class="my-1"
                          density="compact"
                          v-model="delivery"
                          hide-details
                          type="number"
                        />
                      </td>
                      <td>
                        <TextField
                          class="my-1"
                          density="compact"
                          v-model="pickup"
                          hide-details
                          type="number"
                        />
                      </td>
                      <td>
                        <TextField
                          class="my-1"
                          density="compact"
                          v-model="dinein"
                          hide-details
                          type="number"
                        />
                      </td>
                    </tr>
                  </template>
                </Table>
              </v-col>
            </v-row>

          <v-row>
            <v-col cols="12" lg="12">
              <div class="font-weight-bold mb-1 mt-3">{{ $t("t-select-status") }}</div>
              <MenuSelect
          v-model="selectedStatus"
          :items="statusOptions"
          :class="{
            'is-invalid': v$.selectedStatus.$errors.length,
          }"
        />
              <div v-if="v$.selectedStatus.$errors" class="invalid-feedback">
                <span v-for="error in v$.selectedStatus.$errors">
                  {{ error.$message }}
                </span>
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="float-right justify-end pb-5 pt-4 pr-5">
          <v-btn color="danger" @click="closePopup">{{
            $t("t-cancel")
          }}</v-btn>
          <v-btn variant="elevated" color="primary" @click="saveItem">{{
            isEditing ? "Update" : "Create"
          }}</v-btn>
        </v-card-actions>
      </Card>
    </v-dialog>
    <!--------------------- Table rows ---------------------->
    <Card :title="`${t('t-toping')} ${t('t-list')}`">
      <template #title-action>
          <v-row justify="end" align="center">
        <v-col lg="3">
          <QuerySearch
            v-model="query"
            placeholder="`${$t('t-search-name')}`"
          />
        </v-col>
        <v-col v-if="userPermissions.includes(14)" cols="auto">
          <v-btn color="primary" @click="openPopup">
            <i class="ph-plus-circle me-1" /> Add new
          </v-btn>
        </v-col>
      </v-row>
      </template>
      <v-card-text>
        <Table
        v-model="page"
          :headerItems="topingHeaders"
          :config="config"
          is-pagination
          :loading="loading"
        >
          <template #body>
            <tr v-for="(item, index) in filteredData" :key="index" height="50">
              <td>
                {{ item.name }}
              </td>
              <td>
                <td><Status :status="item.status == 'true' ? 'active' : 'inActive'" /></td>
              </td>
              <td justify="start">
                <TableAction
                :editButton="userPermissions.includes(15)"
                :deleteButton="userPermissions.includes(16)"
                  @onEdit="onEdit(item)"
                  @onDelete="onDelete(item)"
                />
              </td>
            </tr>
          </template>
        </Table>
        <NoResult v-if="!filteredData.length" />
      </v-card-text>
    </Card>
  </v-card>
</template>
