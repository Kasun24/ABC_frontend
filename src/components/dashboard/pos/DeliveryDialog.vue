<script lang="ts" setup>
import { ref, computed, defineEmits, defineProps, PropType } from "vue";
import { formatCurrency } from "@/app/common/commonFunctions";
import { useVuelidate } from "@vuelidate/core";
import { required, maxLength } from "@vuelidate/validators";

const emit = defineEmits(["update:modelValue", "onAddCart"]);
const deliveyOrders = [
  {
    contactNo: "+94 712 345 678",
    name: "John Doe",
    address: "No. 12, Colombo 03, Sri Lanka",
    total: 75,
    orderNo: "#123456789",
    status: "pending",
  },
  {
    contactNo: "+94 712 345 678",
    name: "John Doe",
    address: "No. 12, Colombo 03, Sri Lanka",
    total: 100,
    orderNo: "#123456789",
    status: "completed",
  },
];
const addDialogValue = ref(false);
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
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

const contactNo = ref("");
const name = ref("");
const address = ref("");
// Add validation rules
const rules = {
  contactNo: { required, maxLength: maxLength(50) },
  name: { required, maxLength: maxLength(50) },
  address: { maxLength: maxLength(255) },
};

// Define validation rules and apply them to the form data using Vuelidate
const v$ = useVuelidate(rules, { name, contactNo, address });
const addNewDelivery = () => {
  addDialogValue.value = true;
};
const onAddDelivery = () => {
  v$.value.$validate();
  // check validation
  if (!v$.value.$invalid) {
    console.log("New delivery added");
  }
};
</script>

<template>
  <v-dialog
    v-model="dialogValue"
    style="max-width: 1000px"
    :scrollable="false"
    persistent
  >
    <Card
      :title="`${$t('t-delivery')}`"
      title-class="py-0 text-wrap"
      style="overflow: hidden"
    >
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>

      <v-divider />
      <v-card-text data-simplebar style="max-height: calc(100vh - 500px)">
        <v-row>
          <v-col cols="12" lg="4">
            <v-card class="h-100 bg-primary-subtle">
              <div class="h-100 d-flex align-center justify-center">
                <v-btn
                  @click="addNewDelivery"
                  class="w-100 h-100"
                  rounded="lg"
                  color="primary"
                >
                  <i class="ph-plus-circle me-1"></i>
                  {{ $t("t-add_new") }}
                </v-btn>
              </div>
            </v-card>
          </v-col>
          <v-col
            cols="12"
            lg="4"
            v-for="(item, index) in deliveyOrders"
            :key="'deliveyOrders-' + index"
          >
            <v-card
              :class="
                item.status === 'completed'
                  ? 'bg-success-subtle'
                  : 'bg-danger-subtle'
              "
            >
              <v-card-title class="d-flex justify-space-between">
                <div>
                  <span class="text-subtitle-2 font-weight-bold me-2">
                    {{ item.name }}
                  </span>
                </div>
                <div>{{ formatCurrency(item.total) }}</div>
              </v-card-title>
              <v-card-text class="pb-0">
                <p>{{ item.contactNo }}</p>
                <p>{{ item.address }}</p>
              </v-card-text>
              <v-card-actions class="mt-2">
                <v-btn
                  rounded="lg"
                  size="small"
                  :disabled="item.status === 'pending'"
                  variant="elevated"
                  class="mx-auto"
                  color="primary"
                >
                  {{ $t("t-close_order") }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-row justify="end">
          <v-col class="text-right">
            <v-btn color="danger" @click="dialogValue = false"> Close</v-btn>
            <!-- <v-btn color="primary" variant="elevated">
              <span>{{ $t("t-add_to_basket") }}</span>
              <v-progress-circular
                model-value="20"
                color="white"
                indeterminate
              ></v-progress-circular>
            </v-btn> -->
          </v-col>
        </v-row>
      </v-card-actions>
    </Card>
  </v-dialog>
  <v-dialog
    v-model="addDialogValue"
    style="max-width: 500px"
    :scrollable="false"
    persistent
  >
    <Card
      :title="`${$t('t-add_new_delivery')}`"
      title-class="py-0 text-wrap"
      style="overflow: hidden"
    >
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="addDialogValue = false" />
      </template>

      <v-divider />
      <v-card-text data-simplebar style="max-height: calc(100vh - 500px)">
        <div class="font-weight-bold mb-1">
          {{ $t("t-customer_phone_number") }}
          <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <v-text-field
          v-model="contactNo"
          hide-details
          variant="solo"
          density="compact"
          class="text-field-component"
          placeholder="`${$t('t-enter_mobile_number')}`"
          :class="{
            'is-invalid': v$.contactNo.$errors.length,
          }"
        />
        <div v-if="v$.contactNo.$invalid" class="invalid-feedback">
          <span v-for="error in v$.contactNo.$errors">
            {{ error.$message }}
          </span>
        </div>
        <div class="font-weight-bold mb-1 mt-3">
          {{ $t("t-customer_name") }}
          <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <v-text-field
          v-model="name"
          hide-details
          variant="solo"
          density="compact"
          class="text-field-component"
          placeholder="`${$t('t-enter_customer_name')}`"
          :class="{
            'is-invalid': v$.name.$errors.length,
          }"
        />
        <div v-if="v$.name.$invalid" class="invalid-feedback">
          <span v-for="error in v$.name.$errors">
            {{ error.$message }}
          </span>
        </div>
        <div class="font-weight-bold mb-1 mt-3">
          {{ $t("t-customer_address") }}
        </div>
        <v-text-field
          v-model="address"
          hide-details
          variant="solo"
          density="compact"
          class="text-field-component"
          placeholder="`${$t('t-enter_customer_address')}`"
          :class="{
            'is-invalid': v$.address.$errors.length,
          }"
        />
        <div v-if="v$.address.$invalid" class="invalid-feedback">
          <span v-for="error in v$.address.$errors">
            {{ error.$message }}
          </span>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-row justify="end">
          <v-col class="text-right">
            <v-btn color="danger" @click="addDialogValue = false"> Close</v-btn>
            <v-btn color="primary" variant="elevated" @click="onAddDelivery">
              <span>{{ "Create" }}</span>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
