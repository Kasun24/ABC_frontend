<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue";
import { CartItemType } from "@/components/dashboard/pos/types";
import {
  formatCurrency,
  basketData,
  onItemCountChange,
  cartDetails,
  removeCartItem,
  currentUserData,
} from "@/app/common/commonFunctions";
import { Img1 } from "@/assets/images/products/utils";
import Status from "@/app/common/components/Status.vue";
import OrderCloseDialog from "@/components/dashboard/pos/OrderCloseDialog.vue";
import eventBus from "@/components/layouts/topBar/eventBus";
import HttpService from "@/app/http/httpService";
import Swal from "sweetalert2";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const http = new HttpService();
const deleteDialog = ref(false);
const deletedId = ref<number | string | null>(null);
const cartTables = ref([1]);
const oldCartDetails = ref<any>([]);
const oldCartItems = ref<CartItemType[]>([]);
const tableData = ref();
const customerData = ref();
const viewBy = ref<"item" | "name">("item");
const orderCloseDialog = ref(false);
const orderCloseData = ref<any>(null);
const orderSummeryData = ref<any>();
const btnLoading = ref(false);
const counyChangeDisabled = ref(false);
const posType = ref();
const customerName = ref(localStorage.getItem("user_name"));
const deviceId = ref(localStorage.getItem("device_id"));

const props = defineProps<{
  oldCartData: CartItemType[];
  tableData: any;
  customerData: any;
  posType: {
    type: String;
    default: "";
  };
}>();

const processingMode = computed(() => {
  return oldCartItems.value.some((item) => item.status === "processing");
});

watch(
  () => basketData.value,
  (newVal) => {
    if (newVal && newVal.cart_items) {
      cartDetails.value = newVal.cart_items;
      orderSummeryData.value = newVal.cart_summary || {};
      eventBus.emit("newCartItemsLength", cartDetails.value.length);
    } else {
      cartDetails.value = [];
      orderSummeryData.value = {};
      eventBus.emit("newCartItemsLength", 0);
    }
  },
  { immediate: true }
);

watch(
  () => props.oldCartData,
  (newVal) => {
    if (newVal && Object.keys(newVal).length) {
      oldCartDetails.value = newVal;
      oldCartItems.value = oldCartDetails.value.order_items || [];
    } else {
      oldCartDetails.value = {};
      oldCartItems.value = [];
    }
  },
  { immediate: true }
);

// Watch for changes in props.tableData
watch(
  () => props.tableData,
  (newVal) => {
    tableData.value = newVal;
    customerData.value = null;
  },
  { immediate: true } // Run the watcher immediately
);
watch(
  () => props.customerData,
  (newVal) => {
    customerData.value = newVal;
    tableData.value = null;
  },
  { immediate: true } // Run the watcher immediately
);

watch(
  () => props.posType,
  (newVal) => {
    posType.value = newVal;
  },
  { immediate: true } // Run the watcher immediately
);

const subTotal = computed(() => {
  let count = 0;
  if (oldCartItems.value) {
    oldCartItems.value.forEach((item: any | null) => {
      if (item) {
        count += item.gross_total_with_discount;
      }
    });
  }
  return count;
});

watch(deleteDialog, (newVal: boolean) => {
  if (!newVal) {
    deletedId.value = null;
  }
});

const handleItemCountChange = async (
  actionType: "+" | "-",
  item: any,
  index: number
) => {
  counyChangeDisabled.value = true;
  // Call onItemCountChange function
  await onItemCountChange(actionType, item, index);
  counyChangeDisabled.value = false;
};

const confirmRemoveItem = (item: any, index: number) => {
  removeCartItem(item, index);
  Swal.fire({
    position: "top-end",
    toast: true,
    showConfirmButton: false,
    icon: "success",
    title: t("t-item_removed_from_cart"),
    timer: 1500,
  });
};

const onClearBasket = async () => {
  cartDetails.value = [];
  eventBus.emit("newCartItemsLength", cartDetails.value.length);
  Swal.fire({
    position: "top-end",
    toast: true,
    showConfirmButton: false,
    icon: "success",
    title: t("t-basket_cleared"),
    timer: 1500,
  });
};

const sendToKitchen = () => {
  btnLoading.value = true;
  return new Promise(async (resolve, reject) => {
    const cartItems = cartDetails.value;
    const tableId = tableData.value;
    const branchId = localStorage.getItem("selectedBranchID");

    const orderDetails = {
      cart_items: cartItems,
      table_details: {
        id: tableId,
        branch_id: branchId,
      },
      customer_details: customerData.value,
      customer_name: customerName.value,
      device_id: deviceId.value,
      order_delivery_type: posType.value,
    };

    try {
      const response = await http.post(
        "send-to-kitchen", //>>//>> order-app
        orderDetails
      );
      cartDetails.value = [];
      eventBus.emit("newCartItemsLength", cartDetails.value.length);
      eventBus.emit("onSendToKitchen");

      if (response.statusText === "OK") {
        Swal.fire({
          position: "top-end",
          toast: true,
          showConfirmButton: false,
          icon: "success",
          title: t("t-order_sent_to_kitchen"),
          timer: 1500,
        });
      }
      btnLoading.value = false;
      return resolve(response);
    } catch (error: any) {
      return reject(error);
    }
  });
};

// Computed property to group items by customer name
const itemsByCustomerName = computed(() => {
  const groupedItems: Record<string, CartItemType[]> = {};

  oldCartItems.value.forEach((item) => {
    const customerName = item.customer_device.customer_name;

    if (!groupedItems[customerName]) {
      groupedItems[customerName] = [];
    }

    groupedItems[customerName].push(item);
  });

  return groupedItems;
});

const closeOrder = () => {
  if (cartDetails.value.length > 0) {
    Swal.fire({
      icon: "warning",
      title: t("t-clear_the_cart"),
      text: t("t-clear_the_cart_msg"),
      timer: 1000,
    });
  } else if (processingMode.value === true) {
    Swal.fire({
      icon: "warning",
      title: t("t-processing_order"),
      text: t("t-please_wait_while_processing_order"),
      timer: 1000,
    });
  } else {
    orderCloseData.value = {
      subTotal: subTotal.value,
      selectedTable: tableData.value,
      order_id: oldCartDetails.value.order_id,
      cashier_id: localStorage.getItem("user_id"),
    };
    orderCloseDialog.value = true;
  }
};

onMounted(() => {
  cartDetails.value = [];
  eventBus.on("onCompleteOrder", () => {
    oldCartItems.value = [];
  });
  eventBus.emit("newCartItemsLength", cartDetails.value.length);
});
</script>

<template>
  <div class="pos-container">
    <v-expansion-panels
      class="expansion-panels expansion-panel mt-4"
      v-model="cartTables"
      multiple
    >
      <v-expansion-panel
        v-if="posType === 'dine_in'"
        :key="'expansion-panel-1'"
      >
        <v-expansion-panel-title class="text-caption font-weight-medium">
          <div class="d-flex justify-space-between w-100 align-center">
            <div>{{ $t("t-my_kitchen") }}</div>
            <v-chip class="mr-2" density="comfortable" label color="primary">
              <span class="font-weight-medium"
                >{{ oldCartItems.length }} {{ $t("t-items") }}</span
              >
            </v-chip>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text class="text-muted">
          <div class="px-2" style="max-height: 25vh; overflow-y: auto">
            <div v-if="oldCartItems.length" class="cart-section pb-1">
              <v-radio-group inline v-model="viewBy" color="primary">
                <v-radio density="compact" value="item">
                  <template #label><span>By Item</span></template>
                </v-radio>
                <v-radio density="compact" value="name">
                  <template #label>
                    <span>By Name</span>
                  </template>
                </v-radio>
              </v-radio-group>
              <div v-if="viewBy === 'item'">
                <div
                  v-for="(item, index) in oldCartItems"
                  :key="'cart-item-' + index"
                  :class="[
                    'card',
                    {
                      'mb-2 pb-1 border-b': index !== oldCartItems.length - 1,
                    },
                  ]"
                >
                  <div class="card-body d-flex align-items-center">
                    <div class="count me-3" style="min-width: 20px">
                      {{ item.count }} x
                    </div>
                    <div class="product-image me-3">
                      <v-avatar size="50" class="bg-light pa-2 rounded-lg">
                        <v-img :src="item.src || Img1" />
                      </v-avatar>
                    </div>
                    <div class="product-info flex-grow-1">
                      <h5 class="card-title mb-1">{{ item.dish_name }}</h5>
                      <div class="toppings">
                        <span
                          v-for="(i, index) in item.toppings"
                          :key="index"
                          class="d-block"
                        >
                          {{ i.count }} x {{ i.topping_name }}
                        </span>
                      </div>
                    </div>
                    <div class="me-2">
                      <Status :status="item.status" />
                    </div>
                    <div class="text-end" style="min-width: 70px">
                      {{ formatCurrency(item.gross_total_with_discount) }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="cart-section">
                <div
                  v-for="(items, customerName, index) in itemsByCustomerName"
                  :key="customerName"
                  :class="[
                    {
                      'mb-3':
                        index !== Object.keys(itemsByCustomerName).length - 1,
                    },
                  ]"
                >
                  <h4 class="mb-2 bg-light font-weight-medium py-1 px-3">
                    {{ $t("t-order_by") }} {{ customerName }}
                  </h4>
                  <div
                    v-for="(item, index) in items"
                    :key="'cart-item-' + index"
                    :class="[
                      'card',
                      {
                        'mb-2': index !== items.length - 1,
                      },
                    ]"
                  >
                    <div class="card-body d-flex align-items-center">
                      <div class="count me-3">{{ item.count }} x</div>

                      <div class="product-image me-3">
                        <v-avatar size="50" class="bg-light pa-2 rounded-lg">
                          <v-img :src="item.src || Img1" />
                        </v-avatar>
                      </div>

                      <div class="product-info flex-grow-1">
                        <h5 class="card-title mb-1">
                          {{ item.dish_name }}
                        </h5>

                        <div class="toppings">
                          <span
                            v-for="(i, index) in item.toppings"
                            :key="index"
                            class="d-block"
                          >
                            {{ i.count }} x {{ i.topping_name }}
                          </span>
                        </div>
                      </div>

                      <div class="me-2">
                        <Status :status="item.status" />
                      </div>

                      <div class="status text-end">
                        {{ formatCurrency(item.gross_total_with_discount) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center font-weight-bold mt-1 pb-3">
              {{ $t("t-no_orders_found") }}
            </div>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel :key="'expansion-panel-2'">
        <v-expansion-panel-title class="text-caption font-weight-medium">
          <div class="d-flex justify-space-between w-100 align-center">
            <div>{{ $t("t-basket") }}</div>
            <v-chip class="mr-2" density="comfortable" label color="primary">
              <span class="font-weight-medium"
                >{{ cartDetails.length }} {{ $t("t-items") }}</span
              >
            </v-chip>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text class="text-muted">
          <div
            class="cart-section px-2"
            :style="{
              maxHeight: posType !== 'dine_in' ? '57vh' : '25vh',
              overflowY: 'auto',
            }"
          >
            <div
              v-for="(item, index) in cartDetails"
              :key="'cart-item-' + index"
              :class="[
                'card',
                {
                  'mb-2 pb-1 border-b': index !== cartDetails.length - 1,
                },
              ]"
            >
              <div class="card-body d-flex align-items-center">
                <div class="count me-3">
                  <div class="input-step-wrapper">
                    <v-btn
                      class="px-0 input-step"
                      size="small"
                      min-width="25"
                      variant="tonal"
                      :disabled="counyChangeDisabled"
                      @click="handleItemCountChange('-', item, index)"
                      >–</v-btn
                    >
                    <div class="product-quantity">
                      {{ item.count }}
                    </div>
                    <v-btn
                      class="px-0 input-step"
                      size="small"
                      min-width="25"
                      variant="tonal"
                      :disabled="counyChangeDisabled"
                      @click="handleItemCountChange('+', item, index)"
                      >+</v-btn
                    >
                  </div>
                </div>
                <div class="product-image me-3">
                  <v-avatar size="40" class="bg-light pa-2 rounded-lg">
                    <v-img :src="item.src || Img1" />
                  </v-avatar>
                </div>
                <div class="product-info flex-grow-1">
                  <h5 class="card-title mb-1">{{ item.name }}</h5>
                  <div class="toppings">
                    <span
                      v-for="(i, index) in item.selected_toppings"
                      :key="index"
                      class="d-block"
                    >
                      {{ i.count }} x {{ i.name }}
                    </span>
                  </div>
                </div>
                <div class="me-2">
                  <Status :status="item.status" />
                </div>
                <div class="status text-end">
                  {{ formatCurrency(item.count * item.dine_in) }}
                </div>
                <div class="text-end">
                  <v-btn
                    variant="elevated"
                    density="compact"
                    color="danger"
                    class="ml-3 px-0"
                    min-width="25"
                    @click="confirmRemoveItem(item, index)"
                  >
                    <i class="ph-trash ph-1x" />
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
          <div class="d-flex justify-space-between py-2 px-2">
            <v-btn
              :disabled="cartDetails.length === 0"
              @click="onClearBasket"
              color="danger"
            >
              {{ $t("t-clear_basket") }}
            </v-btn>
            <v-btn
              :disabled="cartDetails.length === 0 || btnLoading"
              class="ms-auto"
              @click="sendToKitchen"
              color="primary"
            >
              {{ $t("t-send_to_kitchen") }}
            </v-btn>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    <Card :title="$t('t-order-summery')" class="mt-3">
      <v-card-text>
        <v-row class="font-weight-bold" justify="space-between">
          <v-col cols="auto"> {{ $t("t-gross_total") }}: </v-col>
          <v-col cols="auto" class="text-right">
            {{ formatCurrency(subTotal) }}
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="d-flex justify-end">
        <div>
          <v-btn
            :disabled="oldCartItems.length < 1"
            @click="closeOrder"
            color="primary"
            variant="elevated"
            elevation="0"
            :loading="btnLoading"
          >
            {{ $t("t-checkout") }}
          </v-btn>
        </div>
      </v-card-actions>
    </Card>
  </div>
  <OrderCloseDialog
    v-if="orderCloseData"
    :data="orderCloseData"
    v-model="orderCloseDialog"
  />
</template>

<style lang="scss">
.product-quantity {
  width: 35px;
  text-align: center;
  justify-content: center;
  display: flex;
  align-items: center;
  background-color: transparent;
}
.pos-container .v-expansion-panel-text__wrapper {
  padding-bottom: 0 !important;
}
</style>
