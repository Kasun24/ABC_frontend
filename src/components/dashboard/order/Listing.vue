<script lang="ts" setup>
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import Status from "@/app/common/components/Status.vue";
import Table from "@/app/common/components/Table.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import { OrderListingType } from "@/components/dashboard/order/types";
import { orderHeaders, orderStatus } from "@/components/dashboard/order/utils";
import { computed, onMounted, ref, watch } from "vue";
import HttpService from "@/app/http/httpService";
import Swal from "sweetalert2";
import { useI18n } from "vue-i18n";
import eventBus from "@/components/layouts/topBar/eventBus";
import OrderDetails from "@/components/dashboard/order/OrderDetails.vue";
import { getPermissions } from "@/app/http/services/permissionService";
import Unauthorized from "@/app/common/components/common/Unauthorized.vue";
import PageLoad from "@/app/common/components/common/PageLoad.vue";
import NoResult from "@/app/common/components/common/NoResult.vue";
import { formatCurrency } from "@/app/common/commonFunctions";

const { t } = useI18n();
const dialog = ref(false);
const orderData = ref<OrderListingType | null>(null);
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
const tab = ref("processing");
const tabs = ref<string[]>();
const loadBar = ref(100);
const orderReadyPopup = ref(false);
const orderViewPopup = ref(false);

const pageLoading = ref(false);
const userPermissions = ref<number[]>([]);
const unAuthorized = ref(false);

const fetchData = async (page = 1, selectedStatus = "processing") => {
  loading.value = true;
  try {
    const selectedTab = selectedStatus ? `&status=${selectedStatus}` : "";
    const response = await http.get(`order/list?page=${page}${selectedTab}`);
    mappedData.value = response.data.data.data;
    totalItems.value = response.data.data.total;
    currentPage.value = response.data.data.current_page;
    itemsPerPage.value = response.data.data.per_page;
    tabs.value = [...orderStatus.map((status) => status.value.toString())];
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
  return mappedData.value.filter(
    (item: OrderListingType) =>
      item.status.toLowerCase().includes(val) ||
      item.payment_id.toLowerCase().includes(val)
  );
});

const tabFilteredData = computed(() => {
  const filtered = filteredData.value;
  return filtered.filter((item: OrderListingType) => item.status === tab.value);
});

const config = ref({
  page: currentPage.value,
  start: 0,
  end: 0,
  noOfItems: totalItems.value,
  itemsPerPage: itemsPerPage.value,
});

// Watchers
watch(page, () => fetchData(page.value, tab.value));
watch(query, updatePagination);
watch(dialog, (newVal) => {
  if (!newVal) orderData.value = null;
});
// watch(tab, updatePagination);
watch(tab, (newVal) => {
  page.value = 1;
  currentPage.value = 1;
  fetchData(1, newVal);
  updatePagination();
});
watch(deleteDialog, (newVal) => {
  if (!newVal) deletedId.value = null;
});

// Function to update pagination
function updatePagination() {
  // totalItems.value = tabFilteredData.value.length;
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

// Function to delete a order
const onDelete = (id: number) => {
  deletedId.value = id;
  deleteDialog.value = true;
};

// Function to confirm the deletion of a order
const onConfirm = () => {};

const onViewClick = (data: OrderListingType | null) => {
  if (data) {
    orderData.value = data;
  } else {
    console.log("No data");
  }
  dialog.value = true;
};
async function onUpdate(data: OrderListingType) {
  try {
    const response = await http.post("order/update", data);
    alertMsg.value = response.data;
    const icon = alertMsg.value.status ? "success" : "error";
    const title = alertMsg.value.status ? t("t-success") : t("t-error");
    Swal.fire({ icon, title, text: alertMsg.value.message, timer: 2000 });
  } catch (error) {
    console.log(error);
  }
  fetchData();
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
  TimeLoaded();
});

function TimeLoaded() {
  let timeBarInterval = setInterval(() => {
    loadBar.value--;
    // console.log(loadBar);
    if (loadBar.value == 0) {
      clearInterval(timeBarInterval);
    }
  }, 1000);
}

function colorChanging() {
  if (loadBar.value <= 66.6 && loadBar.value > 33.3) {
    return "color2";
  }
  if (loadBar.value <= 33.3) {
    return "color1";
  }
}
</script>
<template>
  <PageLoad v-if="pageLoading" />
  <Unauthorized v-else-if="unAuthorized" />
  <Card v-else :title="`${$t('t-order')} ${$t('t-list')}`">
    <template #title-action>
      <v-row justify="end" align="center">
        <v-col lg="3">
          <QuerySearch v-model="query" placeholder="`${$t('t-search-name')}`" />
        </v-col>
      </v-row>
    </template>
    <v-card-text>
      <v-tabs v-model="tab" class="bg-primary-subtle">
        <v-tab v-for="item in tabs" :key="'tab-' + item" :value="item">
          {{ $t("t-" + item) }}
        </v-tab>
      </v-tabs>
      <v-divider />
      <Table
        v-model="page"
        :is-pagination="tab !== 'processing'"
        :config="config"
        :loading="loading"
        :headerItems="orderHeaders"
      >
        <template #body>
          <tr
            v-for="(item, index) in tabFilteredData"
            :key="'order-list-item-' + index"
            height="50"
          >
            <td>{{ item.payment_id }}</td>
            <td>
              <Status :status="item.status" />
            </td>
            <td>
              {{ item.table_name }}
            </td>
            <td class="text-end">{{ formatCurrency(item.gross_total) }}</td>
            <td>
              <TableAction
                :viewButton="true"
                :editButton="false"
                @onView="onViewClick(item)"
                @onDelete="onDelete(item.id)"
              />
            </td>
          </tr>
        </template>
      </Table>
      <NoResult v-if="!filteredData.length" />
    </v-card-text>
  </Card>
  <OrderDetails
    v-if="orderData"
    :data="orderData"
    v-model="dialog"
    @onUpdate="onUpdate"
  />
  <RemoveItemConfirmationDialog
    v-if="deletedId"
    v-model="deleteDialog"
    @onConfirm="onConfirm"
  />
</template>
