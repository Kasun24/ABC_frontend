<script lang="ts" setup>
import { ref, computed } from "vue";

const props = defineProps({
  placeholder: {
    type: String,
    default: "",
  },
  items: {
    type: Array,
    default: () => [],
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: [String, Number, Array],
    default: null, // Use null as default to handle falsy values like 0
  },
  itemTitle: {
    type: String,
    default: "label",
  },
  itemValue: {
    type: String,
    default: "value",
  },
});

const itemTitle = ref(props.itemTitle);
const itemValue = ref(props.itemValue);

const emit = defineEmits(["update:modelValue"]);

const selected = computed({
  get() {
    return props.modelValue ?? null; // Use null as fallback value
  },
  set(selected: string | number | any) {
    emit("update:modelValue", selected);
  },
});

const onClear = () => {
  emit("update:modelValue", null);
};
</script>

<template>
  <v-autocomplete
    class="menu-select-filter menu-select-autocomplete"
    v-model="selected"
    variant="solo"
    :items="items"
    density="compact"
    clearable
    hide-selected
    hide-details
    :item-title="itemTitle"
    :item-value="itemValue"
    closable-chips
    single-line
    :chips="multiple"
    :multiple="multiple"
    placeholder="placeholder"
    clear-icon="ph-x"
    :item-height="30"
    @click:clear="onClear"
  >
  </v-autocomplete>
</template>
