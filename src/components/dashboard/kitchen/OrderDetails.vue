<script lang="ts" setup>
import { ref, computed, defineEmits, defineProps, PropType } from "vue";
import { OrderListingType } from "@/components/dashboard/kitchen/types";
import Status from "@/app/common/components/Status.vue";
import { orderStatus } from "@/components/dashboard/kitchen/utils";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { useVuelidate } from "@vuelidate/core";
import { required, maxLength } from "@vuelidate/validators";
import { formatCurrency } from "@/app/common/commonFunctions";

const emit = defineEmits(["update:modelValue", "onUpdate"]);
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<OrderListingType>,
    required: true,
  },
});
const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});
const orderData = ref<OrderListingType>(props.data);
const orderId = ref(orderData.value.id);
const paymentID = ref(orderData.value.payment_id);
const deliveryType = ref(orderData.value.order_delivery_type);
const orderFrom = ref(orderData.value.order_from);
const status = ref(orderData.value.status);
const orderDate = ref(orderData.value.order_action_date || "No date");
const deliveryTimeResturent = ref(
  orderData.value.delivery_time_resturent || "Start time"
);
const deliveryTime = ref(orderData.value.delivery_time || "End time");
const customerName = ref(orderData.value.name || "No name");
const phoneNumber = ref(orderData.value.mobile_number || "No phone number");
const email = ref(orderData.value.email || "No email");
const review = ref(orderData.value.review || "No review");
const rating = ref(orderData.value.order_review_stars || 0);
const deliveryAddress = ref(orderData.value.delivery_address || "No address");
const deliveryStatus = ref(
  orderData.value.delivery_status || "No delivery status"
);
const deliveryRating = ref(
  orderData.value.order_review_delivery_type_stars || 0
);
const paymentType = ref(orderData.value.payment_type || "No payment type");
const paymentData = ref(orderData.value.payment_data || "No payment data");
const paymentPoints = ref(
  orderData.value.payment_points || "No payment points"
);
const couponDetails = ref(
  orderData.value.coupon_details || "No coupon details"
);
const transactionDetails = ref(
  orderData.value.transaction_fee_tax_details || "No transaction details"
);
const backyard = ref(orderData.value.backyard || "No backyard data");
const specialNote = ref(orderData.value.special_note || "No special note");
const remarks = ref(orderData.value.remarks || "No remarks");
const netTotalWithoutTax = ref(orderData.value.net_total_without_tax || 0);
const totalTax = ref(orderData.value.total_tax_inclusive || 0);
const discount = ref(orderData.value.total_discount || 0);
const couponDiscount = ref(orderData.value.coupon_discount || 0);
const deliveryCost = ref(orderData.value.delivery_cost || 0);
const transactionFee = ref(orderData.value.transaction_fee || 0);
const grossTotal = ref(orderData.value.gross_total || 0);

const formatString = (value: string) => {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
// Add validation rules
const rules = {
  status: { required },
};

// Define validation rules and apply them to the form data using Vuelidate
const v$ = useVuelidate(rules, { status });

const onSave = () => {
  // validate form
  v$.value.$validate();
  // check validation
  if (!v$.value.$invalid) {
    dialogValue.value = false;
    const data = {
      ...props.data,
      status: status.value,
    };

    emit("onUpdate", data);
  }
};
</script>
<template>
  <v-dialog
    v-model="dialogValue"
    max-width="1000"
    :scrollable="false"
    persistent
  >
    <Card
      :title="`${$t('t-order-overview')}`"
      title-class="py-0"
      style="overflow: hidden"
    >
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />
      <v-card-text data-simplebar style="max-height: calc(100vh - 500px)">
        <v-card
          :class="`bg-${
            status === 'processing'
              ? 'primary'
              : status === 'completed'
              ? 'success'
              : status === 'cancelled'
              ? 'warning'
              : 'primary'
          }-subtle`"
        >
          <v-card-text>
            <div class="d-flex justify-space-between">
              <div>
                <div class="text-muted">{{ $t("t-order_id") }}</div>
                <div class="font-weight-bold text-subtitle-2 mt-1">
                  #{{ paymentID }}
                </div>
              </div>
              <div class="d-flex align-center">
                <div class="text-right">
                  <div class="font-weight-bold text-subtitle-2">
                    {{ orderDate }} <i class="bx bx-calendar bx-xs mx-1" />
                  </div>
                  <div class="text-muted d-flex align-center justify-end mt-1">
                    <span
                      >{{ deliveryTimeResturent }} - {{ deliveryTime }}</span
                    >
                    <i class="ph-clock ph-lg mx-1" />
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
        <v-row class="mt-1">
          <v-col cols="12" lg="8">
            <Card :title="`${$t('t-dish_details')}`" border>
              <v-card-text>
                <v-row justify="space-between">
                  <v-col class="pb-0">{{ $t("t-sub_total") }} : </v-col>
                  <v-col class="pb-0 text-end">{{
                    formatCurrency(netTotalWithoutTax)
                  }}</v-col>
                </v-row>
                <v-row justify="space-between">
                  <v-col class="pb-0">{{ $t("t-tax") }} : </v-col>
                  <v-col class="pb-0 text-end">{{
                    formatCurrency(totalTax)
                  }}</v-col>
                </v-row>
                <v-row justify="space-between">
                  <v-col class="pb-0">{{ $t("t-discount") }} :</v-col>
                  <v-col class="pb-0 text-end"
                    >-{{ formatCurrency(discount) }}</v-col
                  >
                </v-row>
                <v-row justify="space-between">
                  <v-col class="pb-0">{{ $t("t-coupon_discount") }} :</v-col>
                  <v-col class="pb-0 text-end"
                    >-{{ formatCurrency(couponDiscount) }}</v-col
                  >
                </v-row>
                <v-row justify="space-between">
                  <v-col class="pb-0">{{ $t("t-delivery_cost") }} : </v-col>
                  <v-col class="pb-0 text-end">{{
                    formatCurrency(deliveryCost)
                  }}</v-col>
                </v-row>
                <v-row justify="space-between">
                  <v-col class="pb-0">{{ $t("t-transaction_fee") }} : </v-col>
                  <v-col class="pb-0 text-end">{{
                    formatCurrency(transactionFee)
                  }}</v-col>
                </v-row>
              </v-card-text>
              <v-divider />
              <v-card-actions class="px-4">
                <v-row justify="space-between" class="font-weight-bold">
                  <v-col>{{ $t("t-total") }} : </v-col>
                  <v-col class="text-end">{{ grossTotal }}€</v-col>
                </v-row>
              </v-card-actions>
            </Card>
            <Card class="mt-4" :title="`${$t('t-additional_details')}`" border>
              <v-card-text>
                <v-row justify="space-between">
                  <v-col class="pb-0">{{ $t("t-backyard_note") }} </v-col>
                  <v-col class="pb-0 text-end">{{
                    formatString(backyard)
                  }}</v-col>
                </v-row>
                <v-row justify="space-between">
                  <v-col class="pb-0">{{ $t("t-special_note") }} </v-col>
                  <v-col class="pb-0 text-end">{{
                    formatString(specialNote)
                  }}</v-col>
                </v-row>
                <v-row justify="space-between">
                  <v-col>{{ $t("t-remarks") }} </v-col>
                  <v-col class="text-end">{{ formatString(remarks) }}</v-col>
                </v-row>
              </v-card-text>
            </Card>
          </v-col>
          <v-col cols="12" lg="4">
            <Card :title="`${$t('t-payment_details')}`" border>
              <v-card-text>
                <v-row justify="space-between">
                  <v-col class="pb-0"
                    ><i class="ph-credit-card me-2"></i
                    >{{ formatString(paymentType) }}
                  </v-col>
                </v-row>
                <v-row justify="space-between">
                  <v-col class="pb-0"
                    ><i class="ph-heart me-2"></i>{{ paymentPoints }}
                  </v-col>
                </v-row>
                <v-row justify="space-between">
                  <v-col class="pb-0"
                    ><i class="ph-money me-2"></i
                    >{{ formatString(couponDetails) }}
                  </v-col>
                </v-row>
                <v-row justify="space-between">
                  <v-col
                    ><i class="ph-warning-circle me-2"></i
                    >{{ formatString(transactionDetails) }}
                  </v-col>
                </v-row>
              </v-card-text>
            </Card>
            <Card class="mt-4" :title="`${$t('t-order_details')}`" border>
              <v-card-text>
                <v-row justify="space-between">
                  <v-col class="pb-0"
                    ><i class="ph-user me-2"></i
                    >{{ formatString(customerName) }}
                  </v-col>
                </v-row>
                <v-row justify="space-between">
                  <v-col class="pb-0"
                    ><i class="ph-phone me-2"></i>{{ phoneNumber }}
                  </v-col>
                </v-row>
                <v-row justify="space-between">
                  <v-col><i class="ph-envelope me-2"></i>{{ email }} </v-col>
                </v-row>
              </v-card-text>
            </Card>
            <div class="mt-4">
              <div class="font-weight-bold mb-1">
                {{ $t("t-change_status") }}
              </div>
              <MenuSelect
                :clearable="false"
                v-model="status"
                :items="orderStatus"
              />
            </div>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-row justify="end">
          <v-col class="text-right">
            <v-btn color="danger" @click="dialogValue = false"> Close</v-btn>
            <v-btn color="primary" variant="elevated" @click="onSave">
              {{ "Update" }}</v-btn
            >
          </v-col>
        </v-row>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
