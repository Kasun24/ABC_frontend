<script lang="ts" setup>
import { ref, computed, defineProps, defineEmits, PropType, watch } from "vue";
import { payTypes } from "@/components/dashboard/pos/utils";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import {
  currency,
  formatCurrency,
  completeOrderByCashier,
  checkDigit,
} from "@/app/common/commonFunctions";
import { useI18n } from "vue-i18n";
import Swal from "sweetalert2";
import eventBus from "@/components/layouts/topBar/eventBus";

const { t } = useI18n();
const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<any>,
    required: true,
  },
});

const errorMsg = ref("");
const successMsg = ref("");
const formData = ref<any>(props.data);
const subTotal = computed(() => formData.value.subTotal);
const remainingAmount = ref(0);
const totalPaid = ref(0);
const payType = ref("cash");
const name = ref("");
const amount = ref(0);
const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const payments = ref([
  { amount: subTotal.value.toFixed(2), payType: "cash", name: "" },
]);

// Watch for when the dialog is opened
watch(dialogValue, (newValue) => {
  if (newValue) {
    // Reset success and error messages
    successMsg.value = "";
    errorMsg.value = "";

    // Reset form data and payments
    formData.value = props.data;
    payments.value = [
      { amount: subTotal.value.toFixed(2), payType: "cash", name: "" },
    ];
    totalPaid.value = 0;
    remainingAmount.value = 0;
  }
});

// Watch for changes in props.data to update formData
watch(
  () => props.data,
  (newData) => {
    formData.value = newData;
  },
  { immediate: true }
);

const addNewPayment = () => {
  successMsg.value = "";
  errorMsg.value = "";
  updateBalance(); // Recalculate balance
  if (remainingAmount.value > 0) {
    payments.value.push({
      amount: 0,
      payType: payType.value,
      name: name.value,
    });
  } else {
    successMsg.value = t("t-complete_amount_paid");
  }
  amount.value = 0;
  payType.value = "cash";
  name.value = "";
};

const removePayment = (index: number) => {
  payments.value.splice(index, 1);
  updateBalance(); // Recalculate balance
};

const updateBalance = () => {
  totalPaid.value = payments.value.reduce(
    (acc, payment) => acc + Number(payment.amount),
    0
  );
  remainingAmount.value = parseFloat(
    (subTotal.value - totalPaid.value).toFixed(2)
  );
};

const onCloseTable = async () => {
  successMsg.value = "";
  totalPaid.value = payments.value.reduce(
    (acc, payment) => acc + Number(payment.amount),
    0
  );

  if (totalPaid.value < subTotal.value) {
    errorMsg.value = t("t-please_pay_total_amount");
  } else {
    try {
      const paymentMethod = "cod";
      const orderId = formData.value.order_id;
      const cashierId = formData.value.cashier_id;
      const response: any = await completeOrderByCashier(
        paymentMethod,
        orderId,
        cashierId
      );
      eventBus.emit("onCompleteOrder");
      dialogValue.value = false;
      Swal.fire({
        position: "top-end",
        toast: true,
        icon: "success",
        title: response.data.msg,
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Error in completing order: ", error);
    }
  }
};
</script>

<template>
  <v-dialog
    v-model="dialogValue"
    style="max-width: 800px"
    :scrollable="false"
    persistent
  >
    <Card
      :title="`${$t('t-complete_the_table')}`"
      title-class="py-0 text-wrap"
      style="overflow: hidden"
    >
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />
      <v-card-text data-simplebar style="max-height: calc(100vh - 500px)">
        <v-row>
          <v-col cols="6" class="text-right my-auto pb-0">
            <span class="text-subtitle-2 text-muted mr-1"
              >{{ $t("t-gross_total") }} :
            </span>
          </v-col>
          <v-col cols="6" class="pb-0">
            <div
              class="text-right rounded-lg text-subtitle-1 font-weight-bold px-2 py-1 bg-secondary-subtle text-secondary"
              style="max-width: 130px"
            >
              {{ formatCurrency(subTotal) }}
            </div>
          </v-col>
          <v-col cols="6" class="text-right my-auto pt-1">
            <span
              v-if="remainingAmount > 0"
              class="text-subtitle-2 text-muted mr-1"
              >{{ $t("t-total_due") }} :
            </span>
            <span v-else class="text-subtitle-2 text-muted mr-1"
              >{{ $t("t-balance_amount") }} :
            </span>
          </v-col>
          <v-col cols="6" class="pt-1">
            <div
              v-if="remainingAmount > 0"
              class="text-right rounded-lg text-subtitle-1 font-weight-bold px-2 py-1 bg-danger-subtle text-danger"
              style="max-width: 130px"
            >
              {{ formatCurrency(remainingAmount) }}
            </div>

            <div
              v-else
              class="text-right rounded-lg text-subtitle-1 font-weight-bold px-2 py-1 bg-primary-subtle text-primary"
              style="max-width: 130px"
            >
              {{ formatCurrency(Math.abs(remainingAmount)) }}
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-row v-for="(payment, index) in payments" :key="index">
              <v-col class="pb-0" cols="3">
                <div class="font-weight-bold mb-1">
                  {{ $t("t-amount") }} ({{ currency }})
                </div>
                <v-text-field
                  v-model="payment.amount"
                  @keydown="checkDigit"
                  @input="updateBalance"
                  hide-details
                  variant="solo"
                  density="compact"
                  class="text-field-component"
                  placeholder="`${$t('t-enter_amount')}`"
                  :class="{
                    'is-invalid': payment.amount.length < 1,
                  }"
                />
              </v-col>
              <v-col class="pb-0" cols="3">
                <div class="font-weight-bold mb-1">
                  {{ $t("t-payment_type") }}
                </div>
                <MenuSelect
                  :clearable="false"
                  v-model="payment.payType"
                  :items="payTypes"
                  class="mb-3"
                />
              </v-col>
              <v-col class="pb-0">
                <div class="font-weight-bold mb-1">
                  {{ $t("t-customer_name") }}
                </div>
                <v-text-field
                  v-model="payment.name"
                  hide-details
                  variant="solo"
                  density="compact"
                  class="text-field-component"
                  placeholder="`${$t('t-enter_customer_name')}`"
                />
              </v-col>
              <v-col cols="auto" class="align-self-center text-right">
                <v-btn
                  variant="elevated"
                  density="compact"
                  color="danger"
                  class="mt-4 px-0"
                  min-width="25"
                  @click="removePayment(index)"
                >
                  <i class="ph-trash ph-1x" />
                </v-btn>
              </v-col>
            </v-row>
          </v-col>
          <v-col>
            <v-alert
              class="mb-3 text-center"
              variant="tonal"
              density="compact"
              color="success"
              v-if="successMsg"
            >
              {{ successMsg }}
            </v-alert>
            <v-alert
              class="mb-3 text-center"
              variant="tonal"
              density="compact"
              color="danger"
              v-if="errorMsg"
            >
              {{ errorMsg }}
            </v-alert>
          </v-col>
        </v-row>

        <div class="text-center mt-2" cols="6">
          <v-btn
            :disabled="remainingAmount == 0 || remainingAmount < 0"
            color="success"
            variant="tonal"
            @click="addNewPayment"
          >
            {{ $t("t-add_new_payment") }}
          </v-btn>
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-row justify="end">
          <v-col class="text-right">
            <v-btn color="danger" @click="dialogValue = false"> Close </v-btn>
            <v-btn color="primary" variant="elevated" @click="onCloseTable">
              {{ $t("t-complete_order") }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
