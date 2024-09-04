<script lang="ts" setup>
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import { onMounted, ref, watch, onBeforeUnmount } from "vue";
import HttpService from "@/app/http/httpService";
import { useI18n } from "vue-i18n";
import eventBus from "@/components/layouts/topBar/eventBus";
import { getPermissions } from "@/app/http/services/permissionService";
import Unauthorized from "@/app/common/components/common/Unauthorized.vue";
import PageLoad from "@/app/common/components/common/PageLoad.vue";
import { selectedDish, selected_size_id } from "@/app/common/commonFunctions";
import Swal from "sweetalert2";

const { t } = useI18n();
const dialog = ref(false);
const deleteDialog = ref(false);
const deletedId = ref<number | null>(null);
const loading = ref(false);
const alertMsg = ref();
const query = ref("");
const mappedData = ref<any>(null);
const http = new HttpService();
const loadBar = ref(100);
const orderReadyPopup = ref(false);
const orderViewPopup = ref(false);
const itemRemovePopup = ref(false);

const pageLoading = ref(false);
const userPermissions = ref<number[]>([]);
const unAuthorized = ref(false);
const selectedReadyOrder = ref<any>(null);
const deleteSelectedOrderItem = ref<any>(null);
const filteredKitchenOrder = ref<any>(null);
const selectedOrder = ref<any>(null);
let fetchIntervalId: ReturnType<typeof setInterval> | undefined;
let isFetching = false;

const orderReady = (dish: any) => {
  if (dish) {
    selectedReadyOrder.value = dish;
    orderReadyPopup.value = true;
  }
};

const itemRemoveConfirm = () => {
  if (deleteSelectedOrderItem.value && deleteSelectedOrderItem.value.item_id) {
    deleteSelectedOrder(deleteSelectedOrderItem.value);
  }
};

const orderReadyConfirm = async () => {
  loading.value = true;
  if (
    selectedReadyOrder.value &&
    selectedReadyOrder.value.branch_id &&
    selectedReadyOrder.value.order_id &&
    selectedReadyOrder.value.table_orders_id &&
    selectedReadyOrder.value.order_items
  ) {
    let readyOrderData = {
      branch_id: selectedReadyOrder.value?.branch_id,
      order_id: selectedReadyOrder.value?.order_id,
      table_orders_id: selectedReadyOrder.value?.table_orders_id,
      order_items: selectedReadyOrder.value?.order_items,
    };
    try {
      const response = await http.post("order-ready", readyOrderData);
      alertMsg.value = response.data;
      const icon = alertMsg.value.status ? "success" : "error";
      const title = alertMsg.value.status ? t("t-success") : t("t-error");
      Swal.fire({
        position: "top-end",
        toast: true,
        icon: icon,
        title: alertMsg.value.message,
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.log(error);
    }
  }
  loading.value = false;
  orderViewClose();
  orderReadyClose();
  fetchData();
};

const orderReadyClose = () => {
  orderReadyPopup.value = false;
};

const itemRemoveClose = () => {
  itemRemovePopup.value = false;
};

const orderView = (dish: any) => {
  selectedOrder.value = dish;
  orderViewPopup.value = true;
};

const orderViewClose = () => {
  orderViewPopup.value = false;
};

const fetchData = async () => {
  if (isFetching) return; // Prevent overlapping requests
  isFetching = true;
  loading.value = true;
  try {
    const response = await http.get(`get-kitchen-details`);
    mappedData.value = response.data.allorderDetails;
    filteredKitchenOrder.value = response.data.allorderDetails;
  } catch (error: any) {
    if (error.response?.status === 403) {
      unAuthorized.value = true;
    }
  }
  loading.value = false;
  isFetching = false;
};

// Start the interval
const startFetching = async () => {
  fetchIntervalId = setInterval(fetchData, 30000); // Fetch every minute
  await fetchData(); // Optionally fetch immediately
};

// Stop the interval
const stopFetching = () => {
  if (fetchIntervalId !== undefined) {
    clearInterval(fetchIntervalId);
    fetchIntervalId = undefined;
  }
};

watch(query, (newQuery: string) => {
  const val = newQuery;
  filteredKitchenOrder.value = mappedData.value.filter((kitchen: any) =>
    (kitchen.table_number + "").includes(val)
  );
});

// Called on component mount
onMounted(async () => {
  pageLoading.value = true;
  try {
    // Fetch permissions
    userPermissions.value = await getPermissions();
    // Fetch other necessary data
    // await fetchData();
    startFetching();
    eventBus.on("branchChanged", () => {
      fetchData();
    });
  } catch (error) {
    console.error("Failed to fetch permissions:", error);
  }
  pageLoading.value = false;
  TimeLoaded();
});

onBeforeUnmount(() => {
  stopFetching(); // Stop fetching when the component is about to be unmounted
});

function TimeLoaded() {
  let timeBarInterval = setInterval(() => {
    loadBar.value--;
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

const deleteSelectedOrderConfirmation = async (dish: any) => {
  if (dish) {
    deleteSelectedOrderItem.value = dish;
    itemRemovePopup.value = true;
  }
};

const deleteSelectedOrder = async (dish: any) => {
  loading.value = true;
  if (dish && dish.item_id) {
    try {
      let deleteSelectedOrderDetails = {
        item_id: dish.item_id,
      };
      const response = await http.post("delete-order-item", {
        selectedDish: deleteSelectedOrderDetails,
      });
      alertMsg.value = response.data;
      const icon = alertMsg.value.status ? "success" : "error";
      const title = alertMsg.value.status ? t("t-success") : t("t-error");
      Swal.fire({
        position: "top-end",
        toast: true,
        icon: icon,
        title: alertMsg.value.msg,
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.log(error);
    }
  }
  loading.value = false;
  itemRemoveClose();
  orderViewClose();
  await fetchData();
};
</script>

<template>
  <PageLoad v-if="pageLoading" />
  <Unauthorized v-else-if="unAuthorized" />
  <Card v-else :title="`${$t('t-kitchen')} ${$t('t-list')}`">
    <template #title-action>
      <v-row justify="end" align="center">
        <v-col cols="8" lg="3">
          <QuerySearch
            v-model="query"
            placeholder="`${$t('t-search_table_number')}`"
          />
        </v-col>
      </v-row>
    </template>

    <!------------ order ready popup ------------>
    <v-dialog transition="dialog-top-transition" v-model="orderReadyPopup">
      <div
        :class="orderReadyPopup ? 'open-popup' : ''"
        class="order-ready-section-popup"
      >
        <div class="order-ready-content">
          <div class="order-img">
            <img src="/src/assets/images/orders/10.svg" alt="" />
          </div>
          <div class="ready-text">
            <h1>{{ $t("t-are_you_sure_that_the_order_is_ready") }}</h1>
          </div>
          <div class="btn-section">
            <div class="confirm-btn confirm-ready-btn-hover">
              <button @click="orderReadyConfirm">{{ $t("t-confirm") }}</button>
            </div>
            <div class="cancel-btn">
              <button @click="orderReadyClose">{{ $t("t-cancel") }}</button>
            </div>
          </div>
        </div>
      </div>
    </v-dialog>

    <!------------ item delete popup ------------>
    <v-dialog transition="dialog-top-transition" v-model="itemRemovePopup">
      <div
        :class="itemRemovePopup ? 'open-popup' : ''"
        class="order-ready-section-popup"
      >
        <div class="order-ready-content">
          <div class="order-img">
            <img src="/src/assets/images/orders/10.svg" alt="" />
          </div>
          <div class="ready-text">
            <h1>{{ $t("t-do_you_want_remove_this_item_from_this_order") }}</h1>
          </div>
          <div class="btn-section">
            <div class="confirm-btn confirm-ready-btn-hover">
              <button @click="itemRemoveConfirm">{{ $t("t-confirm") }}</button>
            </div>
            <div class="cancel-btn">
              <button @click="itemRemoveClose">{{ $t("t-cancel") }}</button>
            </div>
          </div>
        </div>
      </div>
    </v-dialog>

    <!------------ order view popup ------------>
    <v-dialog v-model="orderViewPopup">
      <div model="orderViewPopup" class="order-view-section-popup">
        <div class="view-order-header">
          <div class="view-order-img">
            <img src="/src/assets/images/orders/10.svg" alt="" />
          </div>
          <div class="view-order-header-text">
            <h1>
              {{ $t("t-order_overview") }} - {{ selectedOrder?.payment_id }}
            </h1>
          </div>
          <div class="view-order-minimize-btn">
            <button @click="orderViewClose">
              <!-- <img src="/src/assets/images/orders/2.svg" alt="" /> -->
              <i style="font-size: 20px" class="ph-x me-1" />
            </button>
          </div>
        </div>
        <div class="view-order-content-expan">
          <div class="order-list-section-expan">
            <div class="order-card-expan">
              <div class="order-header-details">
                <div class="order-payment">
                  <svg
                    width="14"
                    height="17"
                    viewBox="0 0 14 17"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M0.586 0.586C-5.96046e-08 1.172 0 2.114 0 4V13C0 14.886 -5.96046e-08 15.828 0.586 16.414C1.172 17 2.114 17 4 17H10C11.886 17 12.828 17 13.414 16.414C14 15.828 14 14.886 14 13V4C14 2.114 14 1.172 13.414 0.586C12.828 -5.96046e-08 11.886 0 10 0H4C2.114 0 1.172 -5.96046e-08 0.586 0.586ZM4 4C3.73478 4 3.48043 4.10536 3.29289 4.29289C3.10536 4.48043 3 4.73478 3 5C3 5.26522 3.10536 5.51957 3.29289 5.70711C3.48043 5.89464 3.73478 6 4 6H10C10.2652 6 10.5196 5.89464 10.7071 5.70711C10.8946 5.51957 11 5.26522 11 5C11 4.73478 10.8946 4.48043 10.7071 4.29289C10.5196 4.10536 10.2652 4 10 4H4ZM4 8C3.73478 8 3.48043 8.10536 3.29289 8.29289C3.10536 8.48043 3 8.73478 3 9C3 9.26522 3.10536 9.51957 3.29289 9.70711C3.48043 9.89464 3.73478 10 4 10H10C10.2652 10 10.5196 9.89464 10.7071 9.70711C10.8946 9.51957 11 9.26522 11 9C11 8.73478 10.8946 8.48043 10.7071 8.29289C10.5196 8.10536 10.2652 8 10 8H4ZM4 12C3.73478 12 3.48043 12.1054 3.29289 12.2929C3.10536 12.4804 3 12.7348 3 13C3 13.2652 3.10536 13.5196 3.29289 13.7071C3.48043 13.8946 3.73478 14 4 14H8C8.26522 14 8.51957 13.8946 8.70711 13.7071C8.89464 13.5196 9 13.2652 9 13C9 12.7348 8.89464 12.4804 8.70711 12.2929C8.51957 12.1054 8.26522 12 8 12H4Z"
                      fill="#535353"
                    />
                  </svg>

                  <h3>
                    {{ $t("t-table_number") }} {{ selectedOrder?.table_number }}
                  </h3>
                </div>
              </div>
              <!-- <div class="time-bar-section">
                <div v-if="loadBar > 0" class="time-and-bar-section">
                  <div class="time-text-line">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.49996 0.416668C11.4121 0.416668 14.5833 3.58788 14.5833 7.5C14.5833 11.4121 11.4121 14.5833 7.49996 14.5833C3.58783 14.5833 0.416626 11.4121 0.416626 7.5C0.416626 3.58788 3.58783 0.416668 7.49996 0.416668ZM7.49996 3.25C7.3121 3.25 7.13193 3.32463 6.99909 3.45747C6.86625 3.59031 6.79163 3.77047 6.79163 3.95833V7.5C6.79167 7.68785 6.86632 7.86799 6.99917 8.00079L9.12417 10.1258C9.25776 10.2548 9.43669 10.3262 9.62241 10.3246C9.80813 10.323 9.98579 10.2485 10.1171 10.1172C10.2485 9.98583 10.3229 9.80818 10.3246 9.62245C10.3262 9.43673 10.2548 9.2578 10.1258 9.12421L8.20829 7.20675V3.95833C8.20829 3.77047 8.13367 3.59031 8.00083 3.45747C7.86799 3.32463 7.68782 3.25 7.49996 3.25Z"
                        fill="#636363"
                      />
                    </svg>
                    <p>{{ loadBar + " Seconds Left" }}</p>
                  </div>
                  <div class="load-bar">
                    <div
                      class="color-bar"
                      :key="loadBar"
                      :style="'width: ' + loadBar + '%'"
                      :class="colorChanging()"
                    ></div>
                  </div>
                </div>
                <div v-else class="times-up-section">
                  <svg
                    width="18"
                    height="21"
                    viewBox="0 0 18 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16.03 6.39L17.45 4.97C17 4.46 16.55 4 16.04 3.56L14.62 5C13.07 3.74 11.12 3 9 3C6.61305 3 4.32387 3.94821 2.63604 5.63604C0.948212 7.32387 0 9.61305 0 12C0 14.3869 0.948212 16.6761 2.63604 18.364C4.32387 20.0518 6.61305 21 9 21C14 21 18 16.97 18 12C18 9.88 17.26 7.93 16.03 6.39ZM10 13H8V6H10V13ZM12 0H6V2H12V0Z"
                      fill="#E83333"
                    />
                  </svg>
                  <p>Times Up</p>
                </div>
              </div> -->
              <div class="order-items-section">
                <h1>{{ $t("t-items") }}</h1>
                <div class="order-dish-list" style="max-height: 300px">
                  <div
                    class="order-items"
                    v-for="(order_item, inde) in selectedOrder?.order_items"
                    :key="'order_item-' + inde"
                  >
                    <div class="dish-quantity">
                      <p>X {{ order_item?.count }}</p>
                    </div>
                    <div class="dish-image">
                      <img src="/src/assets/images/orders/4.1.svg" alt="" />
                    </div>
                    <div class="dish-details">
                      <div class="dish-name">
                        <p>{{ order_item?.dish_name }}</p>
                      </div>
                      <div class="dish-toppings">
                        <ul
                          v-for="(topping, ind) in order_item?.toppings"
                          :key="'topping-' + ind"
                        >
                          <li class="dish-toppings-list">
                            <p>
                              {{ topping?.count }}x {{ topping?.topping_name }}
                            </p>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div class="text-end delete-btn-hover">
                      <v-btn
                        variant="elevated"
                        density="compact"
                        color="danger"
                        class="ml-3 px-0"
                        min-width="25"
                        @click="deleteSelectedOrderConfirmation(order_item)"
                      >
                        <i class="ph-trash ph-1x" />
                      </v-btn>
                    </div>
                  </div>
                </div>
              </div>
              <div class="orders-time-date-section-expan">
                <div class="time-date-expan">
                  <p>
                    {{ $t("t-ordered_at") }} : {{ selectedOrder?.created_at }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="view-order-footer">
          <div class="view-order-btn-section">
            <div class="close-btn">
              <button @click="orderViewClose">{{ $t("t-close") }}</button>
            </div>
            <div class="update-btn expan-ready-btn-hover">
              <button @click="orderReady(selectedOrder)">
                {{ $t("t-ready") }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </v-dialog>

    <div
      class="order-list-section"
      v-if="filteredKitchenOrder && filteredKitchenOrder.length"
    >
      <ul>
        <li
          class="order-card-list"
          v-for="(dish, index) in filteredKitchenOrder"
          :key="'dish-' + index"
        >
          <div class="order-card">
            <div class="order-header-details">
              <div class="order-payment">
                <svg
                  width="14"
                  height="17"
                  viewBox="0 0 14 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M0.586 0.586C-5.96046e-08 1.172 0 2.114 0 4V13C0 14.886 -5.96046e-08 15.828 0.586 16.414C1.172 17 2.114 17 4 17H10C11.886 17 12.828 17 13.414 16.414C14 15.828 14 14.886 14 13V4C14 2.114 14 1.172 13.414 0.586C12.828 -5.96046e-08 11.886 0 10 0H4C2.114 0 1.172 -5.96046e-08 0.586 0.586ZM4 4C3.73478 4 3.48043 4.10536 3.29289 4.29289C3.10536 4.48043 3 4.73478 3 5C3 5.26522 3.10536 5.51957 3.29289 5.70711C3.48043 5.89464 3.73478 6 4 6H10C10.2652 6 10.5196 5.89464 10.7071 5.70711C10.8946 5.51957 11 5.26522 11 5C11 4.73478 10.8946 4.48043 10.7071 4.29289C10.5196 4.10536 10.2652 4 10 4H4ZM4 8C3.73478 8 3.48043 8.10536 3.29289 8.29289C3.10536 8.48043 3 8.73478 3 9C3 9.26522 3.10536 9.51957 3.29289 9.70711C3.48043 9.89464 3.73478 10 4 10H10C10.2652 10 10.5196 9.89464 10.7071 9.70711C10.8946 9.51957 11 9.26522 11 9C11 8.73478 10.8946 8.48043 10.7071 8.29289C10.5196 8.10536 10.2652 8 10 8H4ZM4 12C3.73478 12 3.48043 12.1054 3.29289 12.2929C3.10536 12.4804 3 12.7348 3 13C3 13.2652 3.10536 13.5196 3.29289 13.7071C3.48043 13.8946 3.73478 14 4 14H8C8.26522 14 8.51957 13.8946 8.70711 13.7071C8.89464 13.5196 9 13.2652 9 13C9 12.7348 8.89464 12.4804 8.70711 12.2929C8.51957 12.1054 8.26522 12 8 12H4Z"
                    fill="#535353"
                  />
                </svg>

                <h3>{{ $t("t-table_number") }} {{ dish?.table_number }}</h3>
              </div>
              <div class="order-ready-btn">
                <div class="ready-btn ready-btn-hover">
                  <button @click="orderReady(dish)">
                    {{ $t("t-ready") }}
                    <svg
                      width="10"
                      height="11"
                      viewBox="0 0 10 11"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.54102 0.644531L3.95898 7.28965L1.25 4.31191L0 5.68691L4.16602 10.2695L10 2.01953L8.54102 0.644531Z"
                        fill="white"
                      />
                    </svg>
                  </button>
                </div>
                <div class="order-view-btn">
                  <button @click="orderView(dish)">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 0L8.49 2.49L2.49 8.49L0 6V12H6L3.51 9.51L9.51 3.51L12 6V0H6Z"
                        fill="#5E5E5E"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <!-- <div class="time-bar-section">
              <div v-if="loadBar > 0" class="time-and-bar-section">
                <div class="time-text-line">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.49996 0.416668C11.4121 0.416668 14.5833 3.58788 14.5833 7.5C14.5833 11.4121 11.4121 14.5833 7.49996 14.5833C3.58783 14.5833 0.416626 11.4121 0.416626 7.5C0.416626 3.58788 3.58783 0.416668 7.49996 0.416668ZM7.49996 3.25C7.3121 3.25 7.13193 3.32463 6.99909 3.45747C6.86625 3.59031 6.79163 3.77047 6.79163 3.95833V7.5C6.79167 7.68785 6.86632 7.86799 6.99917 8.00079L9.12417 10.1258C9.25776 10.2548 9.43669 10.3262 9.62241 10.3246C9.80813 10.323 9.98579 10.2485 10.1171 10.1172C10.2485 9.98583 10.3229 9.80818 10.3246 9.62245C10.3262 9.43673 10.2548 9.2578 10.1258 9.12421L8.20829 7.20675V3.95833C8.20829 3.77047 8.13367 3.59031 8.00083 3.45747C7.86799 3.32463 7.68782 3.25 7.49996 3.25Z"
                      fill="#636363"
                    />
                  </svg>
                  <p>{{ loadBar + " Seconds Left" }}</p>
                </div>
                <div class="load-bar">
                  <div
                    class="color-bar"
                    :key="loadBar"
                    :style="'width: ' + loadBar + '%'"
                    :class="colorChanging()"
                  ></div>
                </div>
              </div>
              <div v-else class="times-up-section">
                <svg
                  width="18"
                  height="21"
                  viewBox="0 0 18 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.03 6.39L17.45 4.97C17 4.46 16.55 4 16.04 3.56L14.62 5C13.07 3.74 11.12 3 9 3C6.61305 3 4.32387 3.94821 2.63604 5.63604C0.948212 7.32387 0 9.61305 0 12C0 14.3869 0.948212 16.6761 2.63604 18.364C4.32387 20.0518 6.61305 21 9 21C14 21 18 16.97 18 12C18 9.88 17.26 7.93 16.03 6.39ZM10 13H8V6H10V13ZM12 0H6V2H12V0Z"
                    fill="#E83333"
                  />
                </svg>
                <p>Times Up</p>
              </div>
            </div> -->
            <div class="order-items-section">
              <h1>{{ $t("t-items") }}</h1>
              <div class="order-dish-list">
                <ul
                  v-for="(order_item, inde) in dish?.order_items"
                  :key="'order_item-' + inde"
                >
                  <li>
                    <div class="order-items">
                      <div class="dish-quantity">
                        <p>X {{ order_item?.count }}</p>
                      </div>
                      <div class="dish-image">
                        <img src="/src/assets/images/orders/4.1.svg" alt="" />
                      </div>
                      <div class="dish-details">
                        <div class="dish-name">
                          <p>{{ order_item?.dish_name }}</p>
                        </div>
                        <div class="dish-toppings">
                          <ul
                            v-for="(topping, ind) in order_item?.toppings"
                            :key="'topping-' + ind"
                          >
                            <li class="dish-toppings-list">
                              <p>
                                {{ topping?.count }}x
                                {{ topping?.topping_name }}
                              </p>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div class="orders-time-date-section">
              <div class="time-date">
                <p>{{ $t("t-ordered_at") }} : {{ dish?.created_at }}</p>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <div
      v-if="!filteredKitchenOrder || !filteredKitchenOrder.length"
      class="text-center"
    >
      <v-avatar size="80" color="primary" variant="text">
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
  </Card>
</template>

<style scoped>
.order-list-section {
  width: 100%;
  padding: 15px 20px;
  padding-bottom: 50px;
  overflow-x: auto;
}

.order-list-section ul {
  width: max-content;
  list-style: none;
  display: flex;
}

.order-list-section ul li.order-card-list:first-child {
  margin: 0;
}

.order-list-section ul li.order-card-list {
  width: 365px;
  margin-left: 15px;
}

.order-list-section-expan {
  width: 100%;
  padding: 10px;
  overflow-x: auto;
}

.order-list-section-expan ul {
  width: 100%;
  list-style: none;
  display: flex;
}

.order-list-section-expan ul li.order-card-list-expan:first-child {
  margin: 0;
}

.order-list-section-expan ul li.order-card-list-expan {
  width: 100%;
  margin-left: 15px;
}

.order-card {
  background: rgba(248, 248, 248, 1);
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 5px 10px;
  border: 1px solid rgba(229, 229, 229, 1);
  border-radius: 4px;
}

.order-card-expan {
  background: rgba(248, 248, 248, 1);
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 5px 10px;
  border: 1px solid rgba(229, 229, 229, 1);
  border-radius: 4px;
}

.order-header-details {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(230, 230, 230, 1);
  padding-bottom: 8px;
}

.order-payment {
  display: flex;
  align-items: center;
}

.order-payment svg {
}

.order-payment h3 {
  margin-left: 10px;
  font-size: 14px;
  font-weight: 600;
  font-family: "Poppins";
  color: rgba(83, 83, 83, 1);
  line-height: 21px;
}

.order-ready-btn {
  display: flex;
  align-items: center;
}

.ready-btn {
  background: rgba(37, 44, 62, 1);
  margin-right: 15px;
  border-radius: 5px;
  /* padding: 5px 10px; */
  display: flex;
  align-items: center;
}

.ready-btn button {
  font-size: 13px;
  font-family: "Poppins";
  color: rgba(255, 255, 255, 1);
  line-height: 19.5px;
  font-weight: 600;
  background: none;
  padding: 5px 10px;
  white-space: nowrap;
}

.ready-btn button svg {
  margin-left: 5px;
}

.ready-btn-hover button:hover {
  background: rgb(72 87 126);
  border-radius: 5px;
}

.expan-ready-btn-hover button:hover {
  background: rgb(72 87 126);
  border-radius: 5px;
}

.confirm-ready-btn-hover button:hover {
  background: rgb(72 87 126);
}

.delete-btn-hover button:hover {
  background: rgb(242 152 152) !important;
}

.order-view-btn {
}

.order-view-btn button {
}

.order-view-btn button svg {
}

.time-bar-section {
  width: 100%;
  background: rgba(218, 218, 218, 0.46);
  margin-top: 5px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  padding: 10px 5px;
}

.time-text-line {
  display: flex;
  align-items: center;
}

.time-text-line svg {
  margin-left: 10px;
  font-size: 12px;
  font-weight: 600;
  font-family: "Poppins";
  line-height: 18px;
  color: rgba(99, 99, 99, 1);
}

.time-text-line p {
  font-size: 12px;
  font-family: "Poppins";
  line-height: 18px;
  margin-left: 10px;
  font-weight: 600;
  color: rgba(99, 99, 99, 1);
}

.color1 {
  background: rgba(232, 51, 51, 1) !important;
}

.color2 {
  background: rgba(222, 164, 52, 1) !important;
}

.load-bar {
  width: 95%;
  margin: 0 auto;
  background: rgba(217, 217, 217, 1);
  /* background: red; */
  height: 5px;
  border-radius: 4px;
  margin-top: 5px;
  position: relative;
  transition-property: width;
  transition-duration: 5s;
  .color-bar {
    width: 100%;
    height: 5px;
    background: rgba(96, 198, 112, 1);
    position: absolute;
    border-radius: 4px;
  }
}

.times-up-active {
  display: block;
}

.inactive {
  display: none;
}

.times-up-section {
  display: flex;
  justify-content: center;
  flex-direction: column;
  flex-direction: column;
  align-items: center;
}
.times-up-section svg {
}
.times-up-section p {
  font-size: 12px;
  font-family: "Poppins";
  font-weight: 600;
  line-height: 18px;
  color: rgba(232, 51, 51, 1);
}

.order-items-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 15px;
}

.order-items-section h1 {
  font-size: 13px;
  font-family: "Poppins";
  font-weight: 600;
  line-height: 19.5px;
  color: rgba(94, 94, 94, 1);
}

.order-dish-list {
  max-height: 185px;
  min-height: 185px;
  overflow: hidden;
  overflow-y: auto;
}

.order-dish-list ul {
  list-style: none;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.order-dish-list ul li.dish-toppings-list {
  width: 100%;
  display: flex;
}

.order-dish-list ul li.dish-toppings-list:first-child {
}

.order-items {
  width: 100%;
  display: flex;
  margin-top: 10px;
}

.dish-quantity {
  width: 10%;
}

.dish-quantity p {
  font-size: 11px;
  font-weight: 600;
  font-family: "Poppins";
  line-height: 16.5px;
  color: rgba(107, 107, 107, 1);
}

.dish-image {
  width: 10%;
}

.dish-image img {
  width: 100%;
}

.dish-details {
  width: 80%;
  display: flex;
  flex-direction: column;
  margin-left: 10px;
}

.dish-name {
  width: 100%;
}

.dish-name p {
  font-size: 11px;
  font-weight: 600;
  font-family: "Poppins";
  line-height: 16.5px;
  color: rgba(107, 107, 107, 1);
}

.dish-toppings {
  width: 100%;
  /* margin-top: 5px; */
}

.dish-toppings ul {
  list-style: none;
}

.dish-toppings ul li {
  width: 100%;
  margin-top: 5px;
}

.dish-toppings ul li p {
  font-size: 9px;
  font-weight: 600;
  font-family: "Poppins";
  line-height: 13.5px;
  color: rgba(152, 152, 152, 1);
}

.orders-time-date-section {
  width: 100%;
  display: flex;
  margin-top: 10px;
  justify-content: flex-end;
}

.orders-time-date-section-expan {
  width: 100%;
  display: flex;
  margin-top: 10px;
  justify-content: flex-end;
}

.time-date {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.time-date-expan {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.time-date p {
  font-size: 10px;
  font-weight: 600;
  font-family: "Poppins";
  line-height: 15px;
  color: rgba(152, 152, 152, 1);
}

.time-date-expan p {
  font-size: 10px;
  font-weight: 600;
  font-family: "Poppins";
  line-height: 15px;
  color: rgba(152, 152, 152, 1);
}

/*---------- order ready popup style ----------*/

.order-ready-section-popup {
  width: 20%;
  background: rgba(255, 255, 255, 1);
  margin: 0 auto;
  border-radius: 5px;
  position: absolute;
  top: -305px;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.1);
  /* visibility: hidden; */
  transition: transform 0.4s, top 0.4s;
}

.open-popup {
  visibility: visible;
  top: 0%;
  transform: translate(-50%, -50%) scale(1);
}

.order-ready-content {
  width: 100%;
  /* margin: 0 auto; */
  padding: 20px 15px;
  /* background: antiquewhite; */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.order-img {
}

.order-img img {
}

.ready-text {
  margin-top: 10px;
}

.ready-text h1 {
  font-size: 16px;
  font-family: "Poppins";
  font-weight: 600;
  line-height: 24px;
  color: rgba(62, 62, 62, 1);
  text-align: center;
}

.btn-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 15px;
}

.confirm-btn {
  background: rgba(37, 44, 62, 1);
  /* width: 10%; */
  border-radius: 4px;
}

.confirm-btn button {
  font-size: 13px;
  font-family: "Poppins";
  font-weight: 500;
  line-height: 19.5px;
  color: rgba(255, 255, 255, 1);
  padding: 5px 20px;
  border-radius: 5px;
}

.cancel-btn {
  margin-top: 5px;
}

.cancel-btn button:hover {
  background: rgb(255, 221, 221);
}

.cancel-btn button {
  font-size: 13px;
  font-family: "Poppins";
  font-weight: 500;
  line-height: 19.5px;
  color: #ef6a6a;
  padding: 5px 20px;
  border-radius: 5px;
  /* text-decoration: rgba(37, 44, 62, 1) underline; */
}

/*---------- order view popup style ----------*/
.order-view-section-popup {
  width: 50%;
  background: rgba(255, 255, 255, 1);
  margin: 0 auto;
  border-radius: 5px;
}

.view-order-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  border-bottom: 1px solid rgba(222, 222, 222, 1);
  align-items: center;
}

.view-order-img {
}

.view-order-img img {
  width: 80%;
}

.view-order-header-text {
}

.view-order-header-text h1 {
  font-size: 16px;
  font-family: "Poppins";
  font-weight: 600;
  line-height: 24px;
  color: rgba(37, 44, 62, 1);
}

.view-order-minimize-btn {
}

.view-order-minimize-btn button {
}

.view-order-minimize-btn button img {
}

.view-order-content {
  height: 100px;
}

.view-order-content-expan {
  height: fit-content;
}

.view-order-footer {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 10px 20px;
  border-top: 1px solid rgba(222, 222, 222, 1);
  align-items: center;
}

.view-order-btn-section {
  display: flex;
  align-items: center;
}

.update-btn {
  background: rgba(37, 44, 62, 1);
  /* width: 10%; */
  border-radius: 4px;
}

.update-btn button {
  font-size: 13px;
  font-family: "Poppins";
  font-weight: 500;
  line-height: 19.5px;
  color: rgba(255, 255, 255, 1);
  padding: 5px 20px;
}

.close-btn {
  display: flex;
  margin-right: 5px;
  align-items: center;
}

.close-btn button:hover {
  background: rgb(255, 221, 221);
}

.close-btn button {
  font-size: 13px;
  font-family: "Poppins";
  font-weight: 500;
  line-height: 19.5px;
  color: #ef6a6a;
  padding: 5px 20px;
  border-radius: 5px;
  /* text-decoration: rgba(37, 44, 62, 1) underline; */
}
</style>
