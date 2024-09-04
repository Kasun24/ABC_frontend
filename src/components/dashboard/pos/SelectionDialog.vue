<script lang="ts" setup>
import {
  ref,
  computed,
  defineProps,
  defineEmits,
  PropType,
  onMounted,
  watch,
  nextTick,
} from "vue";
import { ProductGridType } from "@/components/dashboard/pos/types";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import {
  formatCurrency,
  cartDetails,
  selectedDish,
  calculateCartAmountsLive,
  selectTopingAddon,
  selected_toppings,
  getActiveToppings,
  selected_size,
  selectedScenarios,
  errors,
  onDropdownToppingSelect,
  toppingQtyChange,
  check_is_selected,
  selected_size_id,
} from "@/app/common/commonFunctions";
import HttpService from "@/app/http/httpService";

const emit = defineEmits(["update:modelValue", "onAddCart"]);
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<ProductGridType>,
    required: true,
  },
});

const http = new HttpService();
const formData = ref<ProductGridType>(props.data);
const dish_name = ref(selectedDish.value.name || "");
const dish_price = ref(selectedDish.value.dine_in || 0);
const btnLoading = ref(false);

const selectedSizes = ref<any>(
  selectedDish.value?.is_size === "true" ? selectedDish.value?.sizes : null
);

const selectedSizeID = ref<number>(
  Number(
    selectedDish.value?.is_size === "true"
      ? selectedDish.value?.sizes[0]?.id
      : null
  )
);

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

console.log("Dish : ", props.data);

const sizeFilteredData = computed(() => {
  if (selectedSizes.value && selectedSizes.value.length) {
    return selectedSizes.value.filter(
      (item: any) => item?.id === selectedSizeID.value
    );
  } else {
    return [];
  }
});

const scenarioFilteredData = computed(() => {
  if (selectedScenarios.value && selectedScenarios.value.length) {
    return selectedScenarios.value.filter(
      (item: any) => item?.status === "true"
    );
  } else {
    return [];
  }
});

const handleCheckboxChange = (
  topping: any,
  scenario: any,
  toppingIndex: number
) => {
  selectTopingAddon(topping, scenario, toppingIndex);
};

const getActiveSizes = (selectSizes: any[]) => {
  if (selectSizes && selectSizes.length) {
    return selectSizes.filter((sizes) => {
      return sizes.status === "true";
    });
  } else {
    return [];
  }
};

// Watch the selectedSizeID computed property
watch(selectedSizeID, (newValue) => {
  let selecSize = selectedSizes.value.filter(
    (item: any) => item?.id === newValue
  );
  onSelectedSize(selecSize[0]);
});

// Define the selectedSize function
const onSelectedSize = (selecSize: any) => {
  selected_size.value = selecSize;
  selected_size_id.value = selecSize.id;
};

function scrollToFirstElement() {
  const firstElement = document.querySelector(".error-msg");
  if (firstElement) {
    (firstElement as HTMLElement).scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

const addItemToCart = async () => {
  errors.value = [];
  let error_on_dish = false;
  let selected_size_or_scenario = [];

  if (selectedDish.value?.is_size == "true") {
    if (selected_size_id.value === null) {
      errors.value["size_select"] = "please_select_a_size";
      await nextTick(); // Wait for the DOM to update
      scrollToFirstElement(); // Scroll after DOM update
      return;
    }
    selected_size_or_scenario = selected_size.value.scenarios;
  } else {
    selected_size_or_scenario = selectedScenarios.value;
  }

  if (selected_size_or_scenario) {
    try {
      selected_size_or_scenario.forEach((element: any) => {
        let this_scenario_selected_count = 0;
        element["topings"].forEach((elementt: any) => {
          let selected_count = check_is_selected(
            elementt.id,
            elementt.is_mandatory,
            element.btn_type
          );
          this_scenario_selected_count += selected_count;
        });

        if (element.is_mandatory == "true") {
          if (element.btn_type == "optional") {
            if (
              !(
                element.min_toping_count <= this_scenario_selected_count &&
                element.max_toping_count >= this_scenario_selected_count
              )
            ) {
              errors.value["error_in_scenario_" + element.id] = true;
              error_on_dish = true;
            }
          } else {
            if (!(element.min_toping_count <= this_scenario_selected_count)) {
              errors.value["error_in_scenario_" + element.id] = true;
              error_on_dish = true;
            }
          }
        }
      });

      if (error_on_dish) {
        const errorElements = errors.value;
        if (Object.keys(errorElements).length > 0) {
          console.log("errorElements", errorElements);
          await nextTick(); // Wait for the DOM to update
          scrollToFirstElement(); // Scroll after DOM update
        }
      }
    } catch (error) {
      console.error("Error in addItemToCart: ", error);
    }
  }

  if (errors.value["mandatory_toping_should_be_selected"] || error_on_dish) {
    errors.value["mandatory_toping_should_be_selected"] = true;
    await nextTick(); // Wait for the DOM to update
    scrollToFirstElement(); // Scroll after DOM update
    return false;
  }

  const data = {
    id: selectedDish.value?.id,
    delivery: selectedDish.value?.delivery,
    dine_in: selectedDish.value?.dine_in,
    pickup: selectedDish.value?.pickup,
    dish_number: selectedDish.value?.dish_number,
    is_combo: selectedDish.value?.is_combo,
    is_customise: selectedDish.value?.is_customise,
    is_size: selectedDish.value?.is_size,
    name: selectedDish.value?.name,
    position: selectedDish.value?.position,
    status: selectedDish.value?.status,
    tax: selectedDish.value?.tax,
    type: selectedDish.value?.type,
    count: selectedDish.value?.count ? selectedDish.value?.count : 1,
    branch_id: selectedDish.value?.branch_id,
    selected_size_id:
      selectedDish.value?.is_size === "true" ? selected_size_id.value : null,
    selected_toppings:
      selectedDish.value?.is_customise === "true" ||
      selectedDish.value?.is_size === "true"
        ? selected_toppings.value
        : [],
  };

  cartDetails.value.push(data);
  emit("onAddCart");
  console.log("Dish added to the cart!", "success");
  calculateCartAmountsLive();
  dialogValue.value = false;
  return true;
};

const automaticallyAddItemToCart = () => {
  if (
    selectedDish.value.is_customise === "false" &&
    selectedDish.value.is_size === "false"
  ) {
    calculateCartAmountsLive();
    emit("onAddCart");
    dialogValue.value = false;
  }
};
onMounted(() => {
  automaticallyAddItemToCart();
});
</script>

<template>
  <v-dialog
    v-model="dialogValue"
    style="max-width: 500px"
    :scrollable="false"
    persistent
  >
    <Card
      :title="dish_name + ' (' + formatCurrency(dish_price) + ')'"
      title-class="py-0 text-wrap"
      style="overflow: hidden"
    >
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>

      <v-divider />
      <v-card-text
        data-simplebar
        style="max-height: calc(100vh - 500px)"
        v-if="selectedDish.is_size === 'true'"
      >
        <MenuSelect
          :clearable="false"
          v-model="selectedSizeID"
          :items="getActiveSizes(selectedSizes)"
          itemTitle="name"
          itemValue="id"
          placeholder="`${$t('t-select_size')}`"
        />
      </v-card-text>

      <v-card-text
        data-simplebar
        style="max-height: calc(100vh - 500px)"
        v-if="selectedDish.is_size === 'true' && sizeFilteredData"
      >
        <div
          v-for="(scenario, index) in sizeFilteredData[0]?.scenarios"
          :key="'scenarios-item-' + index"
        >
          <div class="font-weight-bold mb-2" style="padding-top: 10px">
            {{ scenario.name }}
          </div>

          <div v-if="scenario.btn_type == 'optional'">
            <div v-if="scenario.is_mandatory == 'true'">
              <v-alert
                variant="tonal"
                density="compact"
                color="primary"
                v-if="scenario.min_toping_count == scenario.max_toping_count"
              >
                {{ $t("t-you_can_select") }} {{ scenario.min_toping_count }}
                {{ $t("t-item_s_here") }}
              </v-alert>
              <v-alert
                class="error-msg"
                variant="tonal"
                density="compact"
                color="danger"
                v-if="scenario.min_toping_count != scenario.max_toping_count"
              >
                ({{ $t("t-please_select") }} {{ scenario.min_toping_count }}
                {{ $t("t-to") }} {{ scenario.max_toping_count }}
                {{ $t("t-item_s_here") }})
              </v-alert>
            </div>

            <div v-if="errors['error_in_scenario_' + scenario.id]">
              <v-alert
                class="error-msg"
                variant="tonal"
                density="compact"
                color="danger"
                v-if="scenario.min_toping_count == scenario.max_toping_count"
              >
                {{ $t("t-you_must_select") }} {{ scenario.min_toping_count }}
                {{ $t("t-item_s_here") }}
              </v-alert>
              <v-alert
                class="error-msg"
                variant="tonal"
                density="compact"
                color="danger"
                v-if="scenario.min_toping_count != scenario.max_toping_count"
              >
                {{ $t("t-you_should_select") }}
                {{ scenario.min_toping_count }} {{ $t("t-to") }}
                {{ scenario.max_toping_count }} {{ $t("t-item_s_here") }}
              </v-alert>
            </div>

            <div
              v-if="
                scenario.is_mandatory == 'true' &&
                !(
                  scenario.min_toping_count == 1 &&
                  scenario.max_toping_count == 1
                )
              "
            >
              <Table>
                <tr
                  v-for="(topping, inde) in getActiveToppings(scenario.topings)"
                  :key="'topping-item-' + inde"
                >
                  <td>
                    <v-checkbox
                      v-model="topping.checked"
                      :disabled="!topping.checked && scenario.disable_rest"
                      hide-details
                      density="compact"
                      color="primary"
                      @change="handleCheckboxChange(topping, scenario, inde)"
                    >
                      <template #label>
                        <span
                          >{{ topping.name }} ({{
                            formatCurrency(topping.dine_in)
                          }})</span
                        >
                      </template>
                    </v-checkbox>
                  </td>
                  <td v-if="topping.checked" class="ps-5" style="display: flex">
                    <v-btn
                      v-if="
                        topping.count_selected && topping.count_selected > 1
                      "
                      class="px-0 input-step"
                      size="small"
                      min-width="25"
                      variant="tonal"
                      @click="toppingQtyChange(topping, '-')"
                      >–</v-btn
                    >
                    <div class="product-quantity">
                      {{ topping.count_selected }}
                    </div>
                    <v-btn
                      v-if="!scenario.disable_rest"
                      class="px-0 input-step"
                      size="small"
                      min-width="25"
                      variant="tonal"
                      @click="toppingQtyChange(topping, '+')"
                      >+</v-btn
                    >
                  </td>
                </tr>
              </Table>
            </div>

            <div
              v-if="
                scenario.is_mandatory == 'false' ||
                (scenario.is_mandatory == 'true' &&
                  scenario.min_toping_count == 1 &&
                  scenario.max_toping_count == 1)
              "
            >
              <div>
                <span> {{ $t("t-select_topping") }} </span>
              </div>
              <v-autocomplete
                class="menu-select-filter menu-select-autocomplete"
                variant="solo"
                :items="getActiveToppings(scenario.topings)"
                density="compact"
                :clearable="false"
                hide-selected
                hide-details
                itemTitle="name"
                itemValue="id"
                single-line
                placeholder="`${$t('t-select_topping')}`"
                :item-height="30"
                return-object
                @update:modelValue="onDropdownToppingSelect(scenario, $event)"
              >
              </v-autocomplete>
            </div>
          </div>

          <div v-if="scenario.btn_type == 'add-on'">
            <v-alert
              class="mb-1"
              variant="tonal"
              density="compact"
              color="primary"
              v-if="scenario.is_mandatory == 'true'"
            >
              {{ $t("t-you_can_select") }} {{ scenario.min_toping_count }}
              {{ $t("t-item_s_here") }}
            </v-alert>

            <v-alert
              class="mb-1 error-msg"
              variant="tonal"
              density="compact"
              color="danger"
              v-if="errors['error_in_scenario_' + scenario.id]"
            >
              {{ $t("t-you_must_select") }} {{ scenario.min_toping_count }}
              {{ $t("t-item_s_here") }}
            </v-alert>

            <Table>
              <tr
                v-for="(topping, inde) in getActiveToppings(scenario.topings)"
                :key="'topping-item-' + inde"
              >
                <td>
                  <v-checkbox
                    v-model="topping.checked"
                    :disabled="!topping.checked && scenario.disable_rest"
                    hide-details
                    density="compact"
                    color="primary"
                    @change="handleCheckboxChange(topping, scenario, inde)"
                  >
                    <template #label>
                      <span
                        >{{ topping.name }} ({{
                          formatCurrency(topping.dine_in)
                        }})</span
                      >
                    </template>
                  </v-checkbox>
                </td>
                <td class="ps-5" v-if="topping.checked" style="display: flex">
                  <v-btn
                    v-if="topping.count_selected && topping.count_selected > 1"
                    class="px-0 input-step"
                    size="small"
                    min-width="25"
                    variant="tonal"
                    @click="toppingQtyChange(topping, '-')"
                    >–</v-btn
                  >
                  <div class="product-quantity">
                    {{ topping.count_selected }}
                  </div>
                  <v-btn
                    v-if="!scenario.disable_rest"
                    class="px-0 input-step"
                    size="small"
                    min-width="25"
                    variant="tonal"
                    @click="toppingQtyChange(topping, '+')"
                    >+</v-btn
                  >
                </td>
              </tr>
            </Table>
          </div>
        </div>
      </v-card-text>

      <v-card-text
        data-simplebar
        style="max-height: calc(100vh - 500px)"
        v-if="selectedDish.is_customise === 'true' && scenarioFilteredData"
      >
        <div
          v-for="(scenario, index) in scenarioFilteredData"
          :key="'scenarios-item-' + index"
        >
          <div class="font-weight-bold mb-2" style="padding-top: 10px">
            {{ scenario.name }}
          </div>

          <div
            v-if="
              scenario.btn_type == 'optional' && scenario.is_mandatory == 'true'
            "
          >
            <v-alert
              class="mb-1"
              variant="tonal"
              density="compact"
              color="primary"
              v-if="scenario.min_toping_count == scenario.max_toping_count"
            >
              {{ $t("t-you_can_select") }} {{ scenario.min_toping_count }}
              {{ $t("t-item_s_here") }}
            </v-alert>
            <v-alert
              class="mb-1 error-msg"
              variant="tonal"
              density="compact"
              color="danger"
              v-if="scenario.min_toping_count != scenario.max_toping_count"
            >
              {{ $t("t-please_select") }} {{ scenario.min_toping_count }} to
              {{ scenario.max_toping_count }} {{ $t("t-item_s_here") }}
            </v-alert>
          </div>

          <div
            v-if="
              scenario.btn_type == 'optional' &&
              errors['error_in_scenario_' + scenario.id]
            "
          >
            <v-alert
              class="mb-1 error-msg"
              variant="tonal"
              density="compact"
              color="danger"
              v-if="scenario.min_toping_count == scenario.max_toping_count"
            >
              {{ $t("t-you_must_select") }} {{ scenario.min_toping_count }}
              {{ $t("t-item_s_here") }}
            </v-alert>
            <v-alert
              class="mb-1 error-msg"
              variant="tonal"
              density="compact"
              color="danger"
              v-if="scenario.min_toping_count != scenario.max_toping_count"
            >
              {{ $t("t-you_should_select") }}
              {{ scenario.min_toping_count }} to
              {{ scenario.max_toping_count }} {{ $t("t-item_s_here") }}
            </v-alert>
          </div>

          <v-alert
            class="mb-1"
            variant="tonal"
            density="compact"
            color="primary"
            v-if="
              scenario.btn_type == 'add-on' && scenario.is_mandatory == 'true'
            "
          >
            {{ $t("t-you_can_select") }} {{ scenario.min_toping_count }}
            {{ $t("t-item_s_here") }}
          </v-alert>

          <v-alert
            class="mb-1 error-msg"
            variant="tonal"
            density="compact"
            color="danger"
            v-if="
              scenario.btn_type == 'add-on' &&
              errors['error_in_scenario_' + scenario.id]
            "
          >
            {{ $t("t-you_must_select") }} {{ scenario.min_toping_count }}
            {{ $t("t-item_s_here") }}
          </v-alert>

          <div
            v-if="
              scenario.is_mandatory == 'true' &&
              !(
                scenario.min_toping_count == 1 && scenario.max_toping_count == 1
              )
            "
          >
            <Table>
              <tr
                v-for="(topping, inde) in getActiveToppings(scenario.topings)"
                :key="'topping-item-' + inde"
              >
                <td>
                  <v-checkbox
                    v-model="topping.checked"
                    :disabled="!topping.checked && scenario.disable_rest"
                    hide-details
                    density="compact"
                    color="primary"
                    @change="handleCheckboxChange(topping, scenario, inde)"
                  >
                    <template #label>
                      <span
                        >{{ topping.name }} ({{
                          formatCurrency(topping.dine_in)
                        }})</span
                      >
                    </template>
                  </v-checkbox>
                </td>
                <td class="ps-5" v-if="topping.checked" style="display: flex">
                  <v-btn
                    v-if="topping.count_selected && topping.count_selected > 1"
                    class="px-0 input-step"
                    size="small"
                    min-width="25"
                    variant="tonal"
                    @click="toppingQtyChange(topping, '-')"
                    >–</v-btn
                  >
                  <div class="product-quantity">
                    {{ topping.count_selected }}
                  </div>
                  <v-btn
                    v-if="!scenario.disable_rest"
                    class="px-0 input-step"
                    size="small"
                    min-width="25"
                    variant="tonal"
                    @click="toppingQtyChange(topping, '+')"
                    >+</v-btn
                  >
                </td>
              </tr>
            </Table>
          </div>

          <div
            class="dropdown-wrapper"
            v-if="
              scenario.is_mandatory == 'false' ||
              (scenario.is_mandatory == 'true' &&
                scenario.min_toping_count == 1 &&
                scenario.max_toping_count == 1)
            "
          >
            <v-autocomplete
              class="menu-select-filter menu-select-autocomplete"
              variant="solo"
              :items="getActiveToppings(scenario.topings)"
              density="compact"
              :clearable="false"
              hide-selected
              hide-details
              itemTitle="name"
              itemValue="id"
              single-line
              placeholder="`${$t('t-select_topping')}`"
              :item-height="30"
              return-object
              @update:modelValue="onDropdownToppingSelect(scenario, $event)"
            >
            </v-autocomplete>
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-row justify="end">
          <v-col class="text-right">
            <v-btn color="danger" @click="dialogValue = false"> Close</v-btn>
            <v-btn color="primary" variant="elevated" @click="addItemToCart">
              <span v-if="!btnLoading">{{ $t("t-add_to_basket") }}</span>
              <v-progress-circular
                v-else
                model-value="20"
                color="white"
                indeterminate
              ></v-progress-circular>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
