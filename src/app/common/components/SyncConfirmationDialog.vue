<script lang="ts" setup>
import { computed, ref, watch } from "vue";

const emit = defineEmits(["update:modelValue", "onConfirm"]);
const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
  width: {
    type: Number,
    default: 550,
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const loading = ref(prop.loading);

const strings = ["Toppings", "Topping scenarios", "Menu categories", "Dishes", "Menu category images", "Dish images"];

const currentString = ref('');
let timeoutId: number | null = null;

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

watch(() => prop.loading, (newVal) => {
  loading.value = newVal;
  if (newVal) {
    updateString();
  } else if (timeoutId !== null) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
});

function updateString() {
  currentString.value = strings[Math.floor(Math.random() * strings.length)];
  const randomTime = getRandomInt(4000, 8000);
  timeoutId = window.setTimeout(updateString, randomTime);
}



const confirm = () => {
  loading.value = true;
  emit("onConfirm");
}

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    loading.value = false;
    emit("update:modelValue", dialog);
  },
});
</script>

<style scoped>

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.rotate {
  animation: rotate 2s linear infinite;
}

</style>
<template>
  <v-dialog :width="width" v-model="dialogValue">
    <v-card>
      <v-card-title> {{ title }} </v-card-title>
      <v-btn
        variant="text"
        class="confirm-close-icon"
        icon="ph-x"
        @click="dialogValue = false"
        :disabled="loading"
      />

      <v-card-text class="text-center ma-md-5">
        <div class="text-danger">
          <i class="ph-arrows-clockwise ph-4x" :class="loading ? 'rotate' : ''" />
        </div>
        <div class="mt-4">
          <h4 class="text-h6 font-weight-bold">
            <slot name="title"> {{ loading ? currentString + ' sync in progress' : 'Are you sure want to sync?'  }}  </slot>
          </h4>
          <p class="text-muted mx-4 mb-0 text-subtitle-1">
            <slot name="text">
             {{ loading ? 'Please wait this will take some time to complete' : 'This will be sync dishes with Gastro Master system' }} 
            </slot>
          </p>
        </div>
      </v-card-text>
      <v-card-actions class="d-flex justify-center mt-4 mb-7">
        
          <v-btn @click="dialogValue = false"   :disabled="loading"  class="me-2" flat variant="tonal">
          Close
        </v-btn>
        <v-btn
          color="danger"
          flat
          variant="elevated"
          @click="confirm()"
          :disabled="loading"
        >
         {{ loading ? 'Sync in progress' :'Yes, Sync!' }} 
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>