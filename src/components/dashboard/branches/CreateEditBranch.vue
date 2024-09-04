<script lang="ts" setup>
import { ref, computed, defineProps, defineEmits, PropType } from "vue";
import {
  BranchListingType,
  ApiBranchListingType,
} from "@/components/dashboard/branches/types";
import { useVuelidate } from "@vuelidate/core";
import { required, maxLength } from "@vuelidate/validators";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";

const emit = defineEmits(["update:modelValue", "onCreateUpdate"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<BranchListingType>,
    required: true,
  },
  apiBranchData: {
    type: Object as PropType<ApiBranchListingType[]>,
    default: () => [],
  },
});
const isCreate = computed(() => props.data.id === -1);
const formData = ref<BranchListingType>(props.data);
const name = ref(formData.value.name || "");
const gm_id = ref<string | number | undefined>(
  formData.value.gm_id ?? undefined
);

const bill_split = ref();
if (formData.value.bill_split === 1) {
  bill_split.value = true;
} else {
  bill_split.value = false;
}
console.log("test", bill_split.value);
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
      gm_id: gm_id.value,
      bill_split: bill_split.value,
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
      :title="isCreate ? 'Add Branch' : 'Edit Branch'"
      title-class="py-0"
      style="overflow: hidden"
    >
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />
      <v-card-text data-simplebar style="max-height: calc(100vh - 500px)">
        <div class="font-weight-bold mb-1">
          Branch Name <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <v-text-field
          v-model="name"
          hide-details
          variant="solo"
          density="compact"
          class="text-field-component"
          placeholder="Enter Branch Name"
          :class="{
            'is-invalid': v$.name.$errors.length,
          }"
        />
        <div v-if="v$.name.$invalid" class="invalid-feedback">
          <span v-for="error in v$.name.$errors">
            {{ error.$message }}
          </span>
        </div>
        <v-switch
          class="mt-2"
          v-model="bill_split"
          hide-details
          color="primary"
        >
          <template #label>
            <span> Bill Split </span>
          </template>
        </v-switch>
        <div v-if="apiBranchData">
          <div class="font-weight-bold mb-1 mt-2">Branch</div>
          <MenuSelect
            v-model="gm_id"
            :items="apiBranchData"
            itemTitle="name"
            itemValue="id"
            placeholder="Select Branch"
          />
        </div>
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
