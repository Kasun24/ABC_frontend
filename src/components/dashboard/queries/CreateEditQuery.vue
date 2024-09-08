<script lang="ts" setup>
import { ref, computed, defineProps, defineEmits, PropType } from "vue";
import { QueryListingType } from "@/components/dashboard/queries/types";
import { useVuelidate } from "@vuelidate/core";
import { required, maxLength } from "@vuelidate/validators";

const emit = defineEmits(["update:modelValue", "onCreateUpdate"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<QueryListingType>,
    required: true,
  },
});

const isCreate = computed(() => props.data.id === -1);
const formData = ref<QueryListingType>(props.data);
const customer = ref(formData.value.customer_id || "");
const subject = ref(formData.value.subject || "");
const message = ref(formData.value.message || "");
const status = ref(formData.value.status || "");
const staffUser = ref(JSON.parse(localStorage.getItem("user_id") || "{}"));
const response = ref(formData.value.response || "");
const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

// Add validation rules
const rules = {
  customer: { required },
  subject: { required, maxLength: maxLength(100) },
  message: { maxLength: maxLength(255) },
  status: { required, maxLength: maxLength(50) },
  response: { maxLength: maxLength(200) },
};

// Define validation rules and apply them to the form data using Vuelidate
const v$ = useVuelidate(rules, {
  customer,
  subject,
  message,
  status,
  response,
});

const onSave = () => {
  // validate form
  v$.value.$validate();
  // check validation
  if (!v$.value.$invalid) {
    // save data
    const data = {
      ...props.data,
      customer_id: customer.value,
      subject: subject.value,
      message: message.value,
      status: response.value ? "closed" : status.value,
      response: response.value,
      user_id: 1,
    };

    emit("onCreateUpdate", data);
  }
};
</script>

<template>
  <v-dialog
    v-model="dialogValue"
    max-width="800"
    :scrollable="false"
    persistent
  >
    <Card
      :title="
        isCreate
          ? `${$t('t-add')} ${$t('t-query')}`
          : `${$t('t-edit')} ${$t('t-query')}`
      "
      title-class="py-0"
      style="overflow: hidden"
    >
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />
      <v-card-text data-simplebar style="max-height: calc(100vh - 500px)">
        <v-row>
          <v-col cols="12" lg="6"
            ><div class="font-weight-bold mb-1">
              {{ $t("t-customer") }}
            </div>
            <v-text-field
              v-model="customer"
              :disabled="!isCreate"
              hide-details
              variant="solo"
              density="compact"
              class="text-field-component"
              :placeholder="`${$t('t-enter_customer_id')}`"
              :class="{
                'is-invalid': v$.customer.$errors.length,
              }"
            />
            <div v-if="v$.customer.$errors" class="invalid-feedback">
              <span v-for="error in v$.customer.$errors">
                {{ error.$message }}
              </span>
            </div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-1">
              {{ $t("t-staff_user") }}
            </div>
            <v-text-field
              v-model="staffUser"
              :disabled="true"
              hide-details
              variant="solo"
              density="compact"
              class="text-field-component"
            />
          </v-col>
          <v-col cols="12" lg="12"
            ><div class="font-weight-bold mb-1">
              {{ $t("t-subject") }}
            </div>
            <v-text-field
              v-model="subject"
              :disabled="!isCreate"
              hide-details
              variant="solo"
              density="compact"
              class="text-field-component"
              :placeholder="`${$t('t-enter_subject')}`"
              :class="{
                'is-invalid': v$.subject.$errors.length,
              }"
            />
            <div v-if="v$.subject.$errors" class="invalid-feedback">
              <span v-for="error in v$.subject.$errors">
                {{ error.$message }}
              </span>
            </div>
          </v-col>
          <v-col cols="12" lg="12">
            <div class="font-weight-bold mb-1">
              {{ $t("t-message") }}
            </div>
            <v-textarea
              v-model="message"
              :disabled="!isCreate"
              hide-details
              variant="solo"
              density="compact"
              class="text-field-component"
              :placeholder="`${$t('t-enter_message')}`"
              :class="{
                'is-invalid': v$.message.$errors.length,
              }"
            />
            <div v-if="v$.message.$errors" class="invalid-feedback">
              <span v-for="error in v$.message.$errors">
                {{ error.$message }}
              </span>
            </div>
          </v-col>

          <v-col cols="12" lg="12">
            <div class="font-weight-bold mb-1">
              {{ $t("t-response") }}
            </div>
            <v-textarea
              v-model="response"
              hide-details
              variant="solo"
              density="compact"
              class="text-field-component"
              :placeholder="`${$t('t-enter_response')}`"
              :class="{
                'is-invalid': v$.response.$errors.length,
              }"
            />
            <div v-if="v$.response.$invalid" class="invalid-feedback">
              <span v-for="error in v$.response.$errors">
                {{ error.$message }}
              </span>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-row justify="end">
          <v-col class="text-right">
            <v-btn color="danger" @click="dialogValue = false">
              {{ $t("t-close") }}</v-btn
            >
            <v-btn color="primary" variant="elevated" @click="onSave">
              {{ isCreate ? $t("t-create") : $t("t-update") }}</v-btn
            >
          </v-col>
        </v-row>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
