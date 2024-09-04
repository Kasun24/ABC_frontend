<script lang="ts" setup>
import { TableDataType } from "@/components/dashboard/tableManagement/types";
import { useVuelidate } from "@vuelidate/core";
import { maxLength, required, helpers } from "@vuelidate/validators";
import { PropType, computed, defineEmits, defineProps, ref } from "vue";
import { saveLock } from "@/components/dashboard/tableManagement/saveLock";
import { checkDigit } from "@/app/common/commonFunctions";

const emit = defineEmits(["update:modelValue", "onUpdate"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<TableDataType>,
    required: true,
  },
});

const formData = ref<TableDataType>(props.data);
const isTable = ref(formData.value.type === "table");
const tableNumber = ref(isTable.value ? formData.value.table_number || "" : "");
const name = ref(
  isTable.value ? formData.value.name || "" : formData.value.name || ""
);
const iscolor = ref(formData.value.color);
const color = ref(formData.value.color || "");

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

// Add validation rules
const positiveNumber = helpers.withMessage(
  "Positive number required",
  (value: number) => value > 0
);
const rules = {
  tableNumber: {
    positiveNumber: isTable.value ? positiveNumber : {},
    maxLength: maxLength(10),
  },
  name: { required, maxLength: maxLength(50) },
};

// Define validation rules and apply them to the form data using Vuelidate
const v$ = useVuelidate(rules, { tableNumber, name });

const onSave = async () => {
  // validate form
  v$.value.$validate();
  // check validation
  if (!v$.value.$invalid) {
    // save data
    const data = {
      ...props.data,
      table_number: isTable.value ? tableNumber.value : undefined,
      name: name.value,
      color: color.value,
    };

    if (saveLock.value) return; // Prevent multiple simultaneous saves
    saveLock.value = true;

    try {
      emit("onUpdate", data);
    } catch (error) {
      console.error("Error updating element:", error);
    } finally {
      saveLock.value = false;
    }
  }
};
</script>

<template>
  <v-dialog
    v-model="dialogValue"
    max-width="500"
    :scrollable="false"
    persistent
  >
    <Card
      :title="
        iscolor
          ? `${$t('t-edit')} ${$t('t-area')}`
          : `${$t('t-edit')} ${$t('t-table')}`
      "
      title-class="py-0"
      style="overflow: hidden"
    >
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />
      <v-card-text data-simplebar style="max-height: calc(100vh - 500px)">
        <div v-if="isTable">
          <div class="font-weight-bold mb-1">
            {{ $t("t-table_number") }}
            <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <v-text-field
            v-model="tableNumber"
            min="1"
            @keydown="checkDigit"
            hide-details
            variant="solo"
            density="compact"
            class="text-field-component"
            :class="{
              'is-invalid': v$.tableNumber.$errors.length,
            }"
          />
          <div v-if="v$.tableNumber.$invalid" class="invalid-feedback">
            <span v-for="error in v$.tableNumber.$errors">
              {{ error.$message }}
            </span>
          </div>
        </div>

        <div v-show="!isTable">
          <div class="font-weight-bold mb-1">
            {{ $t("t-name") }} <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <v-text-field
            v-model="name"
            hide-details
            variant="solo"
            density="compact"
            class="text-field-component"
            :class="{
              'is-invalid': v$.name.$errors.length,
            }"
          />

          <div v-if="v$.name.$invalid" class="invalid-feedback">
            <span v-for="error in v$.name.$errors">
              {{ error.$message }}
            </span>
          </div>
        </div>

        <div class="mb-3" v-if="iscolor">
          <div class="font-weight-bold mb-1 mt-3">
            {{ $t("t-color") }} <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <v-color-picker
            width="100%"
            v-model="color"
            hide-inputs
            show-swatches
          ></v-color-picker>
        </div>
      </v-card-text>

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
