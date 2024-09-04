<script lang="ts" setup>
import { computed } from "vue";
import {
  Img1,
} from "@/assets/images/products/utils";
import { formatCurrency } from "@/app/common/commonFunctions";

const emit = defineEmits(["onSelect", "onOverview"]);

const prop = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const isDiscount = computed(() => {
  return parseFloat(prop.product.discount) > 1;
});

const onSelect = () => {
  emit("onSelect", prop.product);
};
</script>
<template>
  <v-card class="position-relative">
    <v-card-text class="pb-0">
      <div class="product-grid-card-ribbon" v-if="product.is_promotion">
        {{ $t("t-promotion") }}
      </div>
      <div class="w-50 mx-auto mb-3">
        <v-img :src="product.is_image? product.src: Img1" hight="190" />
      </div>
      <div class="d-flex justify-space-between">
        <div>
          <span class="text-subtitle-1 font-weight-bold">
            {{
              formatCurrency(isDiscount
                ? (
                    product.price -
                    (product.price * product.discount) / 100
                  ).toFixed(2)
                : product.dine_in)
            }}
          </span>
          <span
            v-if="isDiscount"
            class="text-muted ms-1 text-decoration-line-through"
          >
            {{ formatCurrency(product.dine_in) }}
          </span>
        </div>
        <v-chip color="warning" size="small" rounded label>
          <i class="bx bxs-star" /> {{ product.points_per_dish }}
        </v-chip>
      </div>
      <div class="text-subtitle-2 font-weight-bold text-truncate">
        {{ product.name }}
      </div>
      <div class="text-muted text-decoration-underline mt-1">
        {{ product.menu_categories_id.name }}
      </div>
    </v-card-text>
    <v-card-actions class="px-4 pb-4">
      <v-row no-gutters>
        <v-col cols>
          <v-btn variant="flat" block color="primary" @click="onSelect">
            {{ $t("t-select") }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>
