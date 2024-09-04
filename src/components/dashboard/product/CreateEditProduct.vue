<script lang="ts" setup>
import CKEditor from "@/app/common/components/CKEditor.vue";
import Table from "@/app/common/components/Table.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import ImageUploader from "@/app/common/components/ImageUploader.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import HttpService from "@/app/http/httpService";
import { ProductListingType } from "@/components/dashboard/product/types";
import {
  additives,
  alagics,
  extraOptions,
  extraTableHeaders,
  statusOptions,
  taxValues,
} from "@/components/dashboard/product/utils";
import { useVuelidate } from "@vuelidate/core";
import { maxLength, numeric, required } from "@vuelidate/validators";
import {
  PropType,
  computed,
  defineEmits,
  defineProps,
  onMounted,
  ref,
} from "vue";

const emit = defineEmits(["update:modelValue", "onCreateUpdate"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<ProductListingType>,
    required: true,
  },
});
const http = new HttpService();
const page = ref(0);
const editorId = "product-description";
const tab = ref("info");
const expanded = ref([]);
const isCreate = computed(() => props.data.id === -1);
const formData = ref<ProductListingType>(props.data);
const productNo = ref(formData.value.dish_number || "");
const productName = ref(formData.value.name || "");
const points = ref(formData.value.points_per_dish || "0");
const category = ref(formData.value.menu_categories_id);
const img = ref(formData.value.img ? [formData.value.img] : []);
const alagic = ref(
  formData.value.alagic_ids
    ? formData.value.alagic_ids.split(",").map(Number)
    : []
);
const additive = ref(
  formData.value.additive_ids
    ? formData.value.additive_ids.split(",").map(Number)
    : []
);
const description = ref(formData.value.description || "");
const isCustomizable = ref(formData.value.is_customise === "true");
const isSize = ref(formData.value.is_size === "true");
const isCombo = ref(formData.value.is_combo === "true");
const dinein = ref(formData.value.dine_in || 0);
const deliver = ref(formData.value.delivery || 0);
const pickup = ref(formData.value.pickup || 0);
const tax = ref(formData.value.tax || "0");
const status = ref(formData.value.status || "");
const topingScenarios = ref(formData.value.topingScenarios || []);
const allTopingScenarios = ref();
const menuCategory = ref([]);
const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const getCategories = async () => {
  const response = await http.get(`menu-category/list`);
  menuCategory.value = response.data.data.data.map((item: any) => ({
    value: item.id,
    label: item.name,
  }));
};

const getTopingSenarios = async () => {
  const response = await http.get(`toping-scenario/list`);
  allTopingScenarios.value = response.data.data.map((item: any) => ({
    value: item.id,
    label: item.name,
  }));
};

// Add validation rules
const rules = {
  productNo: { required, maxLength: maxLength(255) },
  productName: { required },
  points: { required, numeric },
  category: { required },
  tax: { required },
  status: { required },
  dinein: { numeric },
  deliver: { numeric },
  pickup: { numeric },
};

// Define validation rules and apply them to the form data using Vuelidate
const v$ = useVuelidate(rules, {
  productNo,
  productName,
  points,
  category,
  tax,
  status,
  dinein,
  deliver,
  pickup,
});

//Function to handle form submission.

const onSave = () => {
  // validate form
  v$.value.$validate();
  // check validation
  if (!v$.value.$invalid) {
    // save data
    const data = {
      ...props.data,
      productNo: productNo.value,
      productName: productName.value,
      points: points.value,
      category: category.value,
      img: img.value,
      alagic: alagic.value,
      additive: additive.value,
      description: description.value,
      isCustomizable: isCustomizable.value,
      isSize: isSize.value,
      isCombo: isCombo.value,
      dinein: dinein.value,
      deliver: deliver.value,
      pickup: pickup.value,
      tax: tax.value,
      status: status.value,
      topingScenarios: topingScenarios.value,
    };

    emit("onCreateUpdate", data);
    console.log(data);
  }
};
const deleteTopingScenario = (item: ProductListingType) => {
  // send Toping Scenario remove request
};
onMounted(() => {
  getCategories();
  getTopingSenarios();
});
</script>

<template>
  <v-dialog
    v-model="dialogValue"
    max-width="75%"
    :scrollable="false"
    persistent
  >
    <Card
      :title="
        isCreate
          ? `${$t('t-add')} ${$t('t-product')}`
          : `${$t('t-edit')} ${$t('t-product')}`
      "
      title-class="py-0"
      style="overflow: hidden"
    >
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />
      <v-card-text data-simplebar style="max-height: calc(100vh - 200px)">
        <v-tabs v-model="tab" class="bg-primary-subtle">
          <v-tab value="info" key="'tab-1"> {{ $t("t-info") }} </v-tab>
          <v-tab value="config" key="'tab-2"> {{ $t("t-extra") }} </v-tab>
          <v-tab value="cross" key="'tab-2">
            {{ $t("t-cross-selling") }}
          </v-tab>
        </v-tabs>
        <v-divider />

        <v-window v-model="tab" class="px-5">
          <v-window-item key="tab-content-1" value="info">
            <v-row class="mt-4">
              <v-col cols="12" lg="3">
                <div class="font-weight-bold mb-1">
                  {{ $t("t-product-name") }}
                  <i class="ph-asterisk ph-xs text-danger" />
                </div>
                <v-text-field
                  v-model="productName"
                  hide-details
                  variant="solo"
                  density="compact"
                  class="text-field-component"
                  placeholder="`${$t('t-enter-product-name')}`"
                  :class="{
                    'is-invalid': v$.productName.$errors.length,
                  }"
                />
                <div v-if="v$.productName.$errors" class="invalid-feedback">
                  <span v-for="error in v$.productName.$errors">
                    {{ error.$message }}
                  </span>
                </div>
              </v-col>
              <v-col cols="12" lg="3">
                <div class="font-weight-bold mb-1">
                  {{ $t("t-points-per-product") }}
                  <i class="ph-asterisk ph-xs text-danger" />
                </div>
                <v-text-field
                  v-model="points"
                  hide-details
                  variant="solo"
                  density="compact"
                  class="text-field-component"
                  placeholder="`${$t('t-enter-user-points')}`"
                  :class="{
                    'is-invalid': v$.points.$errors.length,
                  }"
                />
                <div v-if="v$.points.$errors" class="invalid-feedback">
                  <span v-for="error in v$.points.$errors">
                    {{ error.$message }}
                  </span>
                </div>
              </v-col>
              <v-col cols="12" lg="3">
                <div class="font-weight-bold mb-1">
                  {{ $t("t-status") }}
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
              <v-col cols="12" lg="3">
                <div class="font-weight-bold mb-1">
                  {{ $t("t-product-no") }}
                  <i class="ph-asterisk ph-xs text-danger" />
                </div>
                <v-text-field
                  v-model="productNo"
                  hide-details
                  variant="solo"
                  density="compact"
                  class="text-field-component"
                  placeholder="`${$t('t-enter-product-no')}`"
                  :class="{
                    'is-invalid': v$.productNo.$errors.length,
                  }"
                />
                <div v-if="v$.productNo.$errors" class="invalid-feedback">
                  <span v-for="error in v$.productNo.$errors">
                    {{ error.$message }}
                  </span>
                </div>
              </v-col>
              <v-col cols="12" lg="2">
                <div class="font-weight-bold mb-1">
                  {{ $t("t-category") }}
                  <i class="ph-asterisk ph-xs text-danger" />
                </div>
                <MenuSelect
                  v-model="category"
                  :items="menuCategory"
                  :class="{
                    'is-invalid': v$.status.$errors.length,
                  }"
                />
                <div v-if="v$.category.$errors" class="invalid-feedback">
                  <span v-for="error in v$.category.$errors">
                    {{ error.$message }}
                  </span>
                </div>
              </v-col>
              <v-col cols="12" lg="2">
                <div class="font-weight-bold mb-1">
                  {{ $t("t-tax") }} <i class="ph-asterisk ph-xs text-danger" />
                </div>
                <MenuSelect
                  v-model="tax"
                  :items="taxValues"
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

              <v-col cols="12" lg="4">
                <div class="font-weight-bold mb-1">{{ $t("t-alagic") }}</div>
                <MenuSelect
                  v-model="alagic"
                  :items="alagics"
                  :multiple="true"
                />
              </v-col>
              <v-col cols="12" lg="4">
                <div class="font-weight-bold mb-1">{{ $t("t-additives") }}</div>
                <MenuSelect
                  v-model="additive"
                  :items="additives"
                  :multiple="true"
                />
              </v-col>
              <v-col cols="12" lg="6">
                <div class="font-weight-bold mb-1">
                  {{ $t("t-product-description") }}
                </div>
                <div class="ckeditor-wrapper">
                  <div :id="editorId"></div>
                  <CKEditor :id="editorId" v-model="description" />
                </div>
              </v-col>
              <v-col cols="12" lg="6">
                <div class="font-weight-bold mb-1">
                  {{ $t("t-product-image") }}
                </div>
                <ImageUploader
                  :text="`${$t('t-drop-file-here-or-click-to-upload')}`"
                  v-model="img"
                  :multiple="false"
                />
              </v-col>
              <v-col cols="12" lg="4">
                <v-checkbox
                  :label="`${$t('t-customizable')}`"
                  color="primary"
                  hide-details
                  density="compact"
                  v-model="isCustomizable"
                >
                  <template #label
                    ><span></span>{{ $t("t-is-customizable") }}</template
                  >
                </v-checkbox>
              </v-col>
              <v-col cols="12" lg="4">
                <v-checkbox
                  :label="`${$t('t-size')}`"
                  color="primary"
                  hide-details
                  density="compact"
                  v-model="isSize"
                >
                  <template #label
                    ><span></span>{{ $t("t-is-sizes-available") }}</template
                  >
                </v-checkbox>
              </v-col>
              <v-col cols="12" lg="4">
                <v-checkbox
                  :label="`${$t('t-combo')}`"
                  color="primary"
                  hide-details
                  density="compact"
                  v-model="isCombo"
                >
                  <template #label
                    ><span></span>{{ $t("t-is-product-combo") }}</template
                  >
                </v-checkbox>
              </v-col>
            </v-row>
            <Card :title="$t('t-prices')" class="border mt-4">
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="4">
                    <div class="font-weight-bold mb-1">
                      {{ $t("t-dine-in-price") }}
                    </div>
                    <v-text-field
                      v-model="dinein"
                      hide-details
                      variant="solo"
                      density="compact"
                      class="text-field-component"
                      :class="{
                        'is-invalid': v$.dinein.$errors.length,
                      }"
                    />
                    <div v-if="v$.dinein.$errors" class="invalid-feedback">
                      <span v-for="error in v$.dinein.$errors">
                        {{ error.$message }}
                      </span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="font-weight-bold mb-1">
                      {{ $t("t-deliver-price") }}
                    </div>
                    <v-text-field
                      v-model="deliver"
                      hide-details
                      variant="solo"
                      density="compact"
                      class="text-field-component"
                      :class="{
                        'is-invalid': v$.deliver.$errors.length,
                      }"
                    />
                    <div v-if="v$.deliver.$errors" class="invalid-feedback">
                      <span v-for="error in v$.deliver.$errors">
                        {{ error.$message }}
                      </span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="font-weight-bold mb-1">
                      {{ $t("t-pick-up-price") }}
                    </div>
                    <v-text-field
                      v-model="pickup"
                      hide-details
                      variant="solo"
                      density="compact"
                      class="text-field-component"
                      :class="{
                        'is-invalid': v$.pickup.$errors.length,
                      }"
                    />
                    <div v-if="v$.pickup.$errors" class="invalid-feedback">
                      <span v-for="error in v$.pickup.$errors">
                        {{ error.$message }}
                      </span>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </Card>
          </v-window-item>
          <v-window-item key="tab-content-2" value="config">
            <v-data-table
              v-model:expanded="expanded"
              :headerItems="extraTableHeaders"
              :items="topingScenarios"
              show-expand
              class="header-footer-none mt-4"
            >
              <template v-slot:item.isActive="{ item }">
                <td>
                  <v-switch density="compact" hide-details color="primary">
                    <template #label>
                      <span> {{ $t("t-active") }} </span>
                    </template>
                  </v-switch>
                </td>
              </template>
              <template v-slot:item.addonOptional="{ item }">
                <td>
                  <MenuSelect :items="extraOptions" :clearable="false" />
                </td>
              </template>
              <template v-slot:item.mandatory="{ item }">
                <td>
                  <v-checkbox hide-details density="compact">{{
                    $t("t-mandatory")
                  }}</v-checkbox>
                </td>
              </template>
              <template v-slot:item.action="{ item }">
                <td>
                  <div class="text-right">
                    <v-btn
                      icon="mdi-delete"
                      @click="deleteTopingScenario(item)"
                    ></v-btn>
                  </div>
                </td>
              </template>

              <template v-slot:expanded-row="{ item }">
                <tr>
                  <td colspan="5" class="px-0">
                    <v-card class="mx-0" color="light">
                      <v-card-text>
                        <div class="mb-1">{{ $t("t-topping") }}</div>
                        <MenuSelect placeholder="`${$t('t-topping')}`" />
                      </v-card-text>
                    </v-card>
                  </td>
                </tr>
              </template>
            </v-data-table>
          </v-window-item>
          <v-window-item key="tab-content-3" value="cross">
            <div class="mt-4 mb-1">{{ $t("t-topping") }}</div>
            <MenuSelect placeholder="`${$t('t-topping')}`" />
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
