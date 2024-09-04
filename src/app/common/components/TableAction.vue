<script lang="ts" setup>
import { ref, defineProps, defineEmits } from "vue";
const emit = defineEmits(["onView", "onEdit", "onDelete", "onSync"]);
const props = defineProps({
  syncButton: {
    type: Boolean,
    default: false,
  },
  viewButton: {
    type: Boolean,
    default: false,
  },
  editButton: {
    type: Boolean,
    default: true,
  },
  deleteButton: {
    type: Boolean,
    default: true,
  },
});

const hasAnyButton = ref<boolean>(
  props.syncButton || props.viewButton || props.editButton || props.deleteButton
);
</script>
<template>
  <div class="d-flex" style="justify-content: end">
    <v-hover v-if="viewButton">
      <template v-slot:default="{ isHovering, props }">
        <v-btn
          v-bind="props"
          icon="ph-eye ph-sm"
          color="primary"
          density="compact"
          :variant="!isHovering ? 'tonal' : 'elevated'"
          rounded
          class="ml-1"
          @click="emit('onView')"
        />
      </template>
    </v-hover>
    <v-hover v-if="syncButton">
      <template v-slot:default="{ isHovering, props }">
        <v-btn
          v-bind="props"
          icon="ph-arrows-clockwise ph-sm"
          color="primary"
          density="compact"
          :variant="!isHovering ? 'tonal' : 'elevated'"
          rounded
          class="ml-1"
          @click="emit('onSync')"
        />
      </template>
    </v-hover>
    <v-hover v-if="editButton">
      <template v-slot:default="{ isHovering, props }">
        <v-btn
          v-bind="props"
          icon="ph-pencil ph-sm"
          color="secondary"
          density="compact"
          :variant="!isHovering ? 'tonal' : 'elevated'"
          rounded
          class="ml-1"
          @click="emit('onEdit')"
        />
      </template>
    </v-hover>
    <v-hover v-if="deleteButton">
      <template v-slot:default="{ isHovering, props }">
        <v-btn
          v-bind="props"
          icon="ph-trash ph-sm"
          color="danger"
          density="compact"
          rounded
          class="ml-1"
          :variant="!isHovering ? 'tonal' : 'elevated'"
          @click="emit('onDelete')"
        />
      </template>
    </v-hover>
    <v-btn
      v-if="!hasAnyButton"
      icon="ph-warning ph-sm"
      color="secondary-subtle"
      density="compact"
      rounded
      class="ml-1"
    />
  </div>
</template>
