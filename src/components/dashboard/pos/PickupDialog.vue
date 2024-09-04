<script lang="ts" setup>
import { ref, computed, defineEmits, defineProps, watch } from "vue";
import { useVuelidate } from "@vuelidate/core";
import { required, maxLength, numeric, minLength } from "@vuelidate/validators";

const emit = defineEmits(["update:modelValue", "onAddPickup"]);

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

// Add validation rules
const rules = {
  contactNo: {
    required,
    numeric,
    minLength: minLength(10),
    maxLength: maxLength(18),
  },
  name: { required, maxLength: maxLength(50) },
};

// Define validation rules and apply them to the form data using Vuelidate
const v$ = useVuelidate(rules, { name, contactNo });
watch(dialogValue, (newValue) => {
  if (!newValue) {
    // Reset the form data
    contactNo.value = "";
    name.value = "";
    // Reset the validation
    v$.value.$reset();
  }
});
const onSave = () => {
  v$.value.$validate();
  // check validation
  if (!v$.value.$invalid) {
    const data = {
      mobile_number: contactNo.value,
      name: name.value,
    };
    emit("onAddPickup", data);
  }
};
</script>

<template>
  <v-dialog
    v-model="dialogValue"
    style="max-width: 500px"
    :scrollable="false"
    persistent
  >
    <Card
      :title="`${$t('t-pickup')}`"
      title-class="py-0 text-wrap"
      style="overflow: hidden"
    >
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>

      <v-divider />
      <v-card-text style="max-height: calc(100vh - 500px)">
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
          <span class="d-block" v-for="error in v$.contactNo.$errors">
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
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-row justify="end">
          <v-col class="text-right">
            <v-btn color="danger" @click="dialogValue = false"> Close</v-btn>
            <v-btn @click="onSave" color="primary" variant="elevated">
              <span>{{ "Create" }}</span>
              <!-- <v-progress-circular
                model-value="20"
                color="white"
                indeterminate
              ></v-progress-circular> -->
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
