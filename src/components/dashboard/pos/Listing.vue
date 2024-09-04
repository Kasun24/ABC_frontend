<script lang="ts" setup>
import { computed, ref, watch, onMounted } from "vue";
import Card from "@/components/dashboard/pos/Card.vue";
import { ProductGridType } from "@/components/dashboard/pos/types";
import SelectionDialog from "@/components/dashboard/pos/SelectionDialog.vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import TablePopup from "@/components/dashboard/pos/TablePopup.vue";
import OrderSummery from "@/components/dashboard/pos/OrderSummery.vue";
import HttpService from "@/app/http/httpService";
import eventBus from "@/components/layouts/topBar/eventBus";
import { getPermissions } from "@/app/http/services/permissionService";
import Unauthorized from "@/app/common/components/common/Unauthorized.vue";
import Swal from "sweetalert2";
import { useI18n } from "vue-i18n";
import {
  onItemClick,
  currentOrderDetails,
  hasDineIn,
  hasPickup,
  hasDelivery,
} from "@/app/common/commonFunctions";
import NoResult from "@/app/common/components/common/NoResult.vue";
import DeliveryDialog from "@/components/dashboard/pos/DeliveryDialog.vue";
import PickupDialog from "@/components/dashboard/pos/PickupDialog.vue";
import console from "console";
import { useRoute } from "vue-router";

const route = useRoute();
const posType = ref<any>(route.params.type);
const { t } = useI18n();
const pageLoading = ref(false);
const userPermissions = ref<number[]>([]);
const unAuthorized = ref(false);
const http = new HttpService();
const selectDialog = ref(false);
const filteredProducts = ref<ProductGridType[]>([]);
const selectedItem = ref<any>(null);
const tab = ref("");
const tabs = ref<string[]>([]);
const query = ref("");
const selectedTable = ref();
const selectedTableNumber = ref<number | null>(null);
const branchId = ref(localStorage.getItem("selectedBranchID"));
const menuCategoryIds = ref<number[]>([]);
const dishesData = ref<any[]>([]);
const oldCartData = ref<any>(null);
const basketData = ref<any>(null);
const showDialog = ref(false);
const deliveryDialog = ref(false);
const pickupDialog = ref(false);
const customerData = ref<any>(null);

// check type of branchID
const fetchCategories = async () => {
  try {
    const response = await http.get(`menu-categories/list/${branchId.value}`);
    menuCategoryIds.value = response.data.map((category: any) => category.id);
    tabs.value = response.data.map((category: any) => category.name); // Set categories (tabs)
    tab.value = tabs.value[0];
  } catch (error: any) {
    if (error.response.status === 403) {
      unAuthorized.value = true;
    }
  }
};

const fetchDishes = async () => {
  const data = menuCategoryIds.value;
  try {
    const response = await http.post("menu-category-dishes/list", {
      menu_category_ids: data,
    });
    dishesData.value = response.data.data; // Store dishes data
  } catch (error: any) {
    if (error.response.status === 403) {
      unAuthorized.value = true;
    }
  }
};
const fetchData = async () => {
  pageLoading.value = true;
  await fetchCategories();
  await fetchDishes();
  pageLoading.value = false;
};

const fetchTableSummery = async () => {
  // pageLoading.value = true;
  const tableId = selectedTable.value;
  currentOrderDetails.value = null;
  try {
    const response = await http.post(`get-table-order-summary/${tableId}`, {});
    oldCartData.value = response.data.order_details;
    currentOrderDetails.value = response.data.order_details;
  } catch (error: any) {
    console.log("error", error);
  }
  // pageLoading.value = false;
};

//

watch(query, (newQuery: string) => {
  const val = newQuery.toLowerCase();

  if (val) {
    // Search across all categories and combine results

    filteredProducts.value = dishesData.value.flatMap((category: any) =>
      category.dishes.filter((dish: any) =>
        dish.name.toLowerCase().includes(val)
      )
    );
  } else {
    // Clear search results when the query is empty

    filteredProducts.value = [];
  }
});

const tabFilteredData = computed(() => {
  if (query.value) {
    return filteredProducts.value; // Return search results
  } else {
    const filtered = dishesData.value.flatMap(
      (category: any) => category.dishes
    );

    return filtered.filter(
      (item: any) => item.menu_categories_id.name === tab.value
    );
  }
});

const onSelect = (product: ProductGridType) => {
  if (!selectedTable.value && posType.value === "dine_in") {
    Swal.fire({
      icon: "error",
      title: t("t-no_selected_table"),
      text: t("t-select_table_msg"),
      timer: 1000,
    });
  } else {
    selectedItem.value = product;
    onItemClick(product);
    selectDialog.value = true;
  }
};

const handleAddCart = () => {
  Swal.fire({
    position: "top-end",
    toast: true,
    icon: "success",
    title: t("t-item_added_to_cart"),
    showConfirmButton: false,
    timer: 1500,
  });
};
watch(selectDialog, (newVal: boolean) => {
  if (!newVal) {
    selectedItem.value = null;
  }
});

const tablePopup = () => {
  showDialog.value = true;
};
// handle pickup
const pickupModel = () => {
  pickupDialog.value = true;
};
// handle delivery
const deliveryModel = () => {
  deliveryDialog.value = true;
};
// Update the function to accept the object with tableId and tableNumber
const updateTable = ({
  id: tableId,
  tableNumber,
}: {
  id: number;
  tableNumber: number;
}) => {
  selectedTable.value = tableId;
  selectedTableNumber.value = tableNumber;
  // call table data getting function here
  fetchTableSummery();
  Swal.fire({
    position: "top-end",
    toast: true,
    icon: "success",
    title: t("t-new_table_selected"),
    showConfirmButton: false,
    timer: 1500,
  });
  posType.value = "dine_in";
};

const onAddPickup = (data: any) => {
  selectedTable.value = null;
  selectedTableNumber.value = null;
  customerData.value = data;
  pickupDialog.value = false;
  posType.value = "pickup";
  Swal.fire({
    position: "top-end",
    toast: true,
    icon: "success",
    title: t("t-switched_to_pickup_mode"),
    showConfirmButton: false,
    timer: 1500,
  });
};
// Called on component mount
onMounted(async () => {
  pageLoading.value = true;
  try {
    // Fetch permissions
    userPermissions.value = await getPermissions();
    // Fetch other necessary data
    fetchData();
    eventBus.on(
      "branchChanged",
      (newBranch: { value: number; label: string }) => {
        branchId.value = String(newBranch.value);
        fetchData(); // Fetch data with the updated branchId
        selectedTable.value = null;
        selectedTableNumber.value = null;
      }
    );
    eventBus.on("onSendToKitchen", () => {
      fetchTableSummery();
    });
  } catch (error) {
    console.error("Failed to fetch permissions:", error);
  }
});
</script>

<template>
  <Unauthorized v-if="unAuthorized" />
  <v-row v-else>
    <v-col cols="12" lg="8">
      <v-row class="mt-1" justify="space-between" align="center">
        <v-col cols="auto">
          <div class="d-flex align-center">
            <span class="text-subtitle-1 font-weight-bold">
              {{ $t("t-products") }}
            </span>
            <v-chip label density="compact" color="secondary" class="mx-2">
              <span class="text-caption">{{ tabFilteredData.length }}</span>
            </v-chip>
          </div>
        </v-col>
        <v-col class="d-flex align-center" cols="8">
          <v-btn
            v-if="hasPickup"
            size="default"
            :color="posType === 'pickup' ? 'secondary' : 'primary-subtle'"
            class="mr-2"
            @click="pickupModel"
          >
            <span>
              {{ $t("t-pickup") }}
              <v-icon icon="ph-shopping-bag-open ms-1"></v-icon>
            </span>
          </v-btn>
          <v-btn
            v-if="hasDelivery"
            size="default"
            :color="posType === 'delivery' ? 'secondary' : 'primary-subtle'"
            class="mr-2"
            @click="deliveryModel"
          >
            <span>
              {{ $t("t-delivery") }}
              <v-icon icon="ph-truck ms-1"></v-icon>
            </span>
          </v-btn>
          <v-btn
            v-if="hasDineIn"
            size="default"
            :color="posType === 'dine_in' ? 'secondary' : 'primary-subtle'"
            @click="tablePopup"
            class="mr-2"
          >
            <span v-if="selectedTableNumber">
              {{ $t("t-table_no") }} {{ selectedTableNumber }}
            </span>
            <span v-else>
              {{ $t("t-dine_in") }}
              <v-icon icon="ph-coffee ms-1"></v-icon>
            </span>
          </v-btn>
          <QuerySearch v-model="query" placeholder="`${$t('t-search-name')}`" />
        </v-col>
      </v-row>
      <div class="mt-5">
        <v-tabs v-if="!query" v-model="tab" class="bg-primary-subtle mb-2">
          <v-tab v-for="item in tabs" :key="'tab-' + item" :value="item">
            {{ item }}
          </v-tab>
        </v-tabs>
        <div v-else class="py-4 px-5 bg-primary-subtle font-weight-bold">
          {{ $t("t-search-results") }}
        </div>
        <!-- <PageLoad  /> -->
        <v-row v-if="pageLoading">
          <v-col v-for="n in 12" :key="n" sm="6" lg="3">
            <v-skeleton-loader type="card"></v-skeleton-loader>
          </v-col>
        </v-row>
        <NoResult v-else-if="!tabFilteredData.length" />
        <div v-else class="product-list">
          <v-row>
            <v-col
              sm="6"
              lg="3"
              v-for="(product, index) in tabFilteredData"
              :key="'grid-product-' + index"
            >
              <Card :product="product" @onSelect="onSelect(product)" />
            </v-col>
          </v-row>
        </div>
      </div>
    </v-col>
    <v-col cols="12" lg="4">
      <OrderSummery
        :basketData="basketData"
        :oldCartData="oldCartData"
        :tableData="selectedTable"
        :customerData="customerData"
        :posType="posType"
      />
    </v-col>
  </v-row>

  <SelectionDialog
    v-if="selectedItem"
    :data="selectedItem"
    v-model="selectDialog"
    @onSelect="onSelect(selectedItem)"
    @onAddCart="handleAddCart"
  />
  <TablePopup
    :showDialog="showDialog"
    @update:showDialog="showDialog = $event"
    @table-selected="updateTable"
  />
  <DeliveryDialog v-model="deliveryDialog" />
  <PickupDialog @onAddPickup="onAddPickup" v-model="pickupDialog" />
</template>
<style>
.product-list {
  height: calc(100vh - 272px);
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
}
</style>
