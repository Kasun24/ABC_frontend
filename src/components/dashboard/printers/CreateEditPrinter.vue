<script lang="ts" setup>
import { ref, computed, defineProps, defineEmits, PropType } from "vue";
import { PrinterListingType } from "@/components/dashboard/printers/types";
import { useVuelidate } from "@vuelidate/core";
import { required, maxLength } from "@vuelidate/validators";

const emit = defineEmits(["update:modelValue", "onCreateUpdate"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<PrinterListingType>,
    required: true,
  },
});

const isCreate = computed(() => props.data.id === -1);
const formData = ref<PrinterListingType>(props.data);
const name = ref(formData.value.name || "");
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
  name: { required, maxLength: maxLength(50) },
};

// Define validation rules and apply them to the form data using Vuelidate
const v$ = useVuelidate(rules, { name });

const onSave = () => {
  // validate form
  v$.value.$validate();
  // check validation
  if (!v$.value.$invalid) {
    // save data
    const data = {
      ...props.data,
      name: name.value,
    };

    emit("onCreateUpdate", data);
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
        isCreate
          ? `${$t('t-add')} ${$t('t-printer')}`
          : `${$t('t-edit')} ${$t('t-printer')}`
      "
      title-class="py-0"
      style="overflow: hidden"
    >
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />
      <v-card-text data-simplebar style="max-height: calc(100vh - 500px)">
        <div class="font-weight-bold mb-1">
          {{ $t("t-printer-name") }} <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <v-text-field
          v-model="name"
          hide-details
          variant="solo"
          density="compact"
          class="text-field-component"
          :placeholder="`${$t('t-enter-printer-name')}`"
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
