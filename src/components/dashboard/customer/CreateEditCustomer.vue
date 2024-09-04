<script lang="ts" setup>
import { ref, computed, defineProps, defineEmits, PropType } from "vue";
import { CustomerListingType } from "@/components/dashboard/customer/types";
import { useVuelidate } from "@vuelidate/core";
import {
  required,
  maxLength,
  numeric,
  minLength,
  email as EmailAddress,
} from "@vuelidate/validators";

const emit = defineEmits(["update:modelValue", "onCreateUpdate"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<CustomerListingType>,
    required: true,
  },
});

const isCreate = computed(() => props.data.id === -1);
const formData = ref<CustomerListingType>(props.data);
const first_name = ref(formData.value.first_name || "");
const last_name = ref(formData.value.last_name || "");
const mobile_number = ref(formData.value.mobile_number || "");
const email = ref(formData.value.email || "");
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
  first_name: { required, maxLength: maxLength(50) },
  last_name: { maxLength: maxLength(50) },
  mobile_number: {
    required,
    numeric,
    minLength: minLength(10),
    maxLength: maxLength(18),
  },
  email: {
    maxLength: { EmailAddress, maxLength: maxLength(50) },
  },
};

// Define validation rules and apply them to the form data using Vuelidate
const v$ = useVuelidate(rules, { first_name, last_name, mobile_number, email });

const onSave = () => {
  // validate form
  v$.value.$validate();
  // check validation
  if (!v$.value.$invalid) {
    // save data
    const data = {
      ...props.data,
      first_name: first_name.value,
      last_name: last_name.value,
      mobile_number: mobile_number.value,
      email: email.value,
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
          ? 'Add Customer'
          : 'Edit Customer'
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
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-1">
              Customer First Name
              <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <v-text-field
              v-model="first_name"
              hide-details
              variant="solo"
              density="compact"
              class="text-field-component"
              placeholder="Enter customer first name" 
              :class="{
                'is-invalid': v$.first_name.$errors.length,
              }"
            />
            <div v-if="v$.first_name.$invalid" class="invalid-feedback">
              <span v-for="error in v$.first_name.$errors">
                {{ error.$message }}
              </span>
            </div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-1">
              Customer Last Name
              <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <v-text-field
              v-model="last_name"
              hide-details
              variant="solo"
              density="compact"
              class="text-field-component"
              placeholder="Enter customer last name"
              :class="{
                'is-invalid': v$.last_name.$errors.length,
              }"
            />
            <div v-if="v$.last_name.$invalid" class="invalid-feedback">
              <span v-for="error in v$.last_name.$errors">
                {{ error.$message }}
              </span>
            </div>
          </v-col>
          <v-col>
            <div class="font-weight-bold mb-1">
              Phone Number
              <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <v-text-field
              v-model="mobile_number"
              hide-details
              variant="solo"
              density="compact"
              class="text-field-component"
              placeholder="Enter customer phone number"
              :class="{
                'is-invalid': v$.mobile_number.$errors.length,
              }"
            />
            <div v-if="v$.mobile_number.$invalid" class="invalid-feedback">
              <span v-for="error in v$.mobile_number.$errors">
                {{ error.$message }}
              </span>
            </div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-1">
              Email
            </div>
            <v-text-field
              v-model="email"
              hide-details
              variant="solo"
              density="compact"
              class="text-field-component"
              placeholder="Enter customer email"
              :class="{
                'is-invalid': v$.email.$errors.length,
              }"
            />
            <div v-if="v$.email.$invalid" class="invalid-feedback">
              <span v-for="error in v$.email.$errors">
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
