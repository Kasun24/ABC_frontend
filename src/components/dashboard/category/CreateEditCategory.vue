<script lang="ts" setup>
import ImageUploader from "@/app/common/components/ImageUploader.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import {
  CategoryListingType,
  ExtraType,
} from "@/components/dashboard/category/types";
import {
  extraAddons,
  extraOptions,
  extraTableHeaders,
  promotionOptions,
  statusOptions,
} from "@/components/dashboard/category/utils";
import { useVuelidate } from "@vuelidate/core";
import { maxLength, required } from "@vuelidate/validators";
import { PropType, computed, defineEmits, defineProps, ref } from "vue";

const emit = defineEmits(["update:modelValue", "onCreateUpdate"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<CategoryListingType>,
    required: true,
  },
});
const tab = ref("info");
const isCreate = computed(() => props.data.id === -1);
const formData = ref<CategoryListingType>(props.data);
const name = ref(formData.value.name || "");
const tax = ref(formData.value.tax || 0);
const description = ref(formData.value.description || "");
const status = ref(formData.value.status || "");
const isPromotion = ref(formData.value.is_promotion || "");
const discount = ref(formData.value.discounts_disabled === "false");
const minCal = ref(formData.value.exclude_min_order_amount_cal === "false");
const pickup = ref(formData.value.disabled_for_pickup === "false");
const dinein = ref(formData.value.disabled_for_dine_in === "false");
const delivery = ref(formData.value.disabled_for_delivery === "false");
const visibility = ref(
  typeof formData.value.visibility === "string"
    ? JSON.parse(formData.value.visibility)
    : formData.value.visibility || []
);
const webImg = ref();
const appImg = ref();
const promotionImg = ref();
const extras = ref(formData.value.extras || []);
const expanded = ref([]);

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
  name: { required, maxLength: maxLength(255) },
  tax: { required },
  description: { required },
  status: { required },
  isPromotion: { required },
};

// Define validation rules and apply them to the form data using Vuelidate
const v$ = useVuelidate(rules, {
  name,
  tax,
  description,
  status,
  isPromotion,
});

const addExtra = (item: ExtraType) => {
  const newExtras = [...extras.value];
  const newItem = { ...item, addonOptional: "" }; // Add the addonOptional property
  newExtras.push(newItem);
  extras.value = newExtras;
};

const onSave = () => {
  // validate form
  v$.value.$validate();
  // check validation
  if (!v$.value.$invalid) {
    // save data
    const data = {
      ...props.data,
      name: name.value,
      tax: tax.value,
      description: description.value,
      status: status.value,
      isPromotion: isPromotion.value,
      discount: discount.value,
      minCal: minCal.value,
      pickup: pickup.value,
      dinein: dinein.value,
      delivery: delivery.value,
      visibility: visibility.value,
      webImg: webImg.value,
      appImg: appImg.value,
      promotionImg: promotionImg.value,
      extras: extras.value,
    };
    emit("onCreateUpdate", data);
  }
  console.log(visibility);
};

const deleteExtra = (item: ExtraType) => {
  const index = extras.value.findIndex((extra) => extra.id === item.id);
  if (index !== -1) {
    extras.value.splice(index, 1);
  }
};
</script>

<template>
  <v-dialog
    v-model="dialogValue"
    max-width="75%"
    :scrollable="false"
    persistent
  >
    <Card
      :title="isCreate ? 'Add Category' : 'Edit Category'"
      title-class="py-0"
      style="overflow: hidden"
    >
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />
      <v-card-text data-simplebar style="max-height: calc(100vh - 200px)">
        <v-tabs v-model="tab" class="bg-primary-subtle">
          <v-tab value="info" key="'tab-1"> Category Info </v-tab>
          <v-tab value="config" key="'tab-2"> Extra Addons </v-tab>
        </v-tabs>
        <v-divider />

        <v-window v-model="tab" class="px-5">
          <v-window-item key="tab-content-1" value="info">
            <v-row class="mt-4">
              <v-col cols="12" lg="6">
                <div class="font-weight-bold mb-1">
                  Category Name
                  <i class="ph-asterisk ph-xs text-danger" />
                </div>
                <v-text-field
                  v-model="name"
                  hide-details
                  variant="solo"
                  density="compact"
                  class="text-field-component"
                  placeholder="Enter Category Name"
                  :class="{
                    'is-invalid': v$.name.$errors.length,
                  }"
                />
                <div v-if="v$.name.$errors" class="invalid-feedback">
                  <span v-for="error in v$.name.$errors">
                    {{ error.$message }}
                  </span>
                </div>
              </v-col>
              <v-col cols="12" lg="6">
                <div class="font-weight-bold mb-1">
                  Tax <i class="ph-asterisk ph-xs text-danger" />
                </div>
                <v-text-field
                  v-model="tax"
                  hide-details
                  variant="solo"
                  density="compact"
                  class="text-field-component"
                  placeholder="Enter tax amount"
                  :class="{
                    'is-invalid': v$.tax.$errors.length,
                  }"
                />
                <div v-if="v$.tax.$errors" class="invalid-feedback">
                  <span v-for="error in v$.tax.$errors">
                    {{ error.$message }}
                  </span>
                </div>
              </v-col>
              <v-col cols="12" lg="6">
                <div class="font-weight-bold mb-1">
                  Description
                  <i class="ph-asterisk ph-xs text-danger" />
                </div>
                <v-textarea
                  v-model="description"
                  hide-details
                  variant="solo"
                  density="compact"
                  class="text-field-component"
                  placeholder="Enter description"
                  :class="{
                    'is-invalid': v$.description.$errors.length,
                  }"
                />
                <div v-if="v$.description.$errors" class="invalid-feedback">
                  <span v-for="error in v$.description.$errors">
                    {{ error.$message }}
                  </span>
                </div>
              </v-col>
              <v-col cols="6" lg="3">
                <div class="font-weight-bold mb-1">
                  Status
                  <i class="ph-asterisk ph-xs text-danger" />
                </div>
                <MenuSelect
                  v-model="status"
                  :items="statusOptions"
                  :class="{
                    'is-invalid': v$.status.$errors.length,
                  }"
                />
                <div v-if="v$.status.$errors" class="invalid-feedback">
                  <span v-for="error in v$.status.$errors">
                    {{ error.$message }}
                  </span>
                </div>
              </v-col>
              <v-col cols="6" lg="3">
                <div class="font-weight-bold mb-1">
                  Is Promotion
                  <i class="ph-asterisk ph-xs text-danger" />
                </div>
                <MenuSelect
                  v-model="isPromotion"
                  :items="promotionOptions"
                  :class="{
                    'is-invalid': v$.isPromotion.$errors.length,
                  }"
                />
                <div v-if="v$.isPromotion.$errors" class="invalid-feedback">
                  <span v-for="error in v$.isPromotion.$errors">
                    {{ error.$message }}
                  </span>
                </div>
              </v-col>
            </v-row>
            <Card title="Restaurant details" class="border mt-4">
              <v-card-text>
                <v-row>
                  <v-col cols="12" lg="4">
                    <v-switch
                      v-model="discount"
                      density="compact"
                      inset
                      hide-details
                      color="primary"
                    >
                      <template #label>
                        <span> Disable discount for category</span>
                      </template>
                    </v-switch>
                  </v-col>
                  <v-col cols="12" lg="8">
                    <v-switch
                      v-model="minCal"
                      density="compact"
                      inset
                      hide-details
                      color="primary"
                    >
                      <template #label>
                        <span> exclude min cal for category </span>
                      </template>
                    </v-switch>
                  </v-col>
                  <v-col cols="12" lg="4">
                    <v-switch
                      v-model="pickup"
                      density="compact"
                      inset
                      hide-details
                      color="primary"
                    >
                      <template #label>
                        <span class="text-primary font-weight-bold">
                          Pickup
                        </span>
                      </template>
                    </v-switch>
                  </v-col>
                  <v-col cols="12" lg="4">
                    <v-switch
                      v-model="dinein"
                      density="compact"
                      inset
                      hide-details
                      color="primary"
                    >
                      <template #label>
                        <span class="text-primary font-weight-bold">
                          Dine In
                        </span>
                      </template>
                    </v-switch>
                  </v-col>
                  <v-col cols="12" lg="4">
                    <v-switch
                      v-model="delivery"
                      density="compact"
                      inset
                      hide-details
                      color="primary"
                    >
                      <template #label>
                        <span class="text-primary font-weight-bold">
                          Delivery
                        </span>
                      </template>
                    </v-switch>
                  </v-col>
                </v-row>
              </v-card-text>
            </Card>
            <Card title="Visibility" class="border mt-4">
              <v-card-text>
                <p class="text-muted mb-0">
                  Category will be visible in the following days
                </p>
                <v-row class="mt-5">
                  <v-col
                    v-for="(item, index) in visibility"
                    :key="'day-' + index"
                    cols="12"
                    lg="6"
                  >
                    <v-row class="border-t">
                      <v-col>
                        <v-checkbox
                          label="Visibility"
                          color="primary"
                          hide-details
                          density="compact"
                          v-model="item.isActive"
                        >
                          <template #label
                            ><span>{{ item.day }}</span></template
                          >
                        </v-checkbox></v-col
                      >
                      <v-col>
                        <v-switch
                          v-model="item.allday"
                          density="compact"
                          hide-details
                          color="primary"
                        >
                          <template #label>
                            <span> All day</span>
                          </template>
                        </v-switch>
                      </v-col>
                      <v-col v-if="item.allday == false">
                        <VueDatePicker
                          v-model="item.timeSlot.from"
                          :disabled="item.allday"
                          time-picker
                          :teleport="true"
                          placeholder="From"
                      /></v-col>
                      <v-col v-if="item.allday == false">
                        <VueDatePicker
                          v-model="item.timeSlot.to"
                          :disabled="item.allday"
                          time-picker
                          :teleport="true"
                          placeholder="To"
                      /></v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-card-text>
            </Card>
            <Card title="Images" class="border mt-4">
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="4">
                    <div class="font-weight-bold mb-1">
                      Web Image
                    </div>
                    <ImageUploader
                      text="Drop file here or click to upload"
                      v-model="webImg"
                      :multiple="false"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="font-weight-bold mb-1">App Image</div>
                    <ImageUploader
                      text="Drop file here or click to upload"
                      v-model="appImg"
                      :multiple="false"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="font-weight-bold mb-1">Promotion Image</div>
                    <ImageUploader
                      text="Drop file here or click to upload"
                      v-model="promotionImg"
                      :multiple="false"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </Card>
          </v-window-item>
          <v-window-item key="tab-content-2" value="config">
            <v-row class="my-4">
              <v-col cols="9">
                <MenuSelect placeholder="Import extras" />

                <v-data-table
                  v-model:expanded="expanded"
                  :headerItems="extraTableHeaders"
                  :items="extras"
                  show-expand
                  class="header-footer-none mt-4"
                >
                  <template v-slot:item.addonOptional="{ item }">
                    <td>
                      <MenuSelect
                        v-model="item.addonOptional"
                        :items="extraOptions"
                        :clearable="false"
                      />
                    </td>
                  </template>
                  <template v-slot:item.action="{ item }">
                    <td>
                      <v-btn
                        icon="mdi-delete"
                        @click="deleteExtra(item)"
                      ></v-btn>
                    </td>
                  </template>

                  <template v-slot:expanded-row="{ item }">
                    <tr>
                      <td colspan="5" class="px-0">
                        <v-card class="mx-0" color="light">
                          <v-card-text>
                            <div class="mb-1">Topings</div>
                            <MenuSelect placeholder="Topings" />
                          </v-card-text>
                        </v-card>
                      </td>
                    </tr>
                  </template>
                </v-data-table>
              </v-col>
              <v-col cols="3">
                <v-btn
                  v-for="(item, index) in extraAddons"
                  :key="'extra-btn-' + index"
                  color="secondary"
                  class="mb-2 w-100"
                  @click="addExtra(item)"
                >
                  {{ item.name }}</v-btn
                >
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
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
<style>
.header-footer-none thead,
.header-footer-none .v-data-table-footer {
  display: none;
}
</style>
