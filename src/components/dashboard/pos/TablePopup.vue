<script lang="ts" setup>
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import { TableDataType } from "@/components/dashboard/pos/types";
import HttpService from "@/app/http/httpService";
import { defineProps, defineEmits } from "vue";
import PageLoad from "@/app/common/components/common/PageLoad.vue";
import eventBus from "@/components/layouts/topBar/eventBus";
import Swal from "sweetalert2";
import { useI18n } from "vue-i18n";
import NoResult from "@/app/common/components/common/NoResult.vue";

const { t } = useI18n();
const http = new HttpService();
const canvasData = ref<TableDataType[]>([]);
const pageLoading = ref(true);
const unAuthorized = ref(false);
const branch_id = ref(localStorage.getItem("selectedBranchID"));
const newCartItemsLength = ref(0);
const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:showDialog", "table-selected"]);

const closeDialog = () => {
  emit("update:showDialog", false);
};

// State to track the selected card
const selectedCardId = ref<number | null>(null);

// Function to handle card selection
const selectCard = (id: number) => {
  if (newCartItemsLength.value > 0) {
    closeDialog();
    Swal.fire({
      icon: "warning",
      title: t("t-cannot-select-table"),
      text: t("t-clear_basket_msg"),
      timer: 2000,
    });
    return;
  }

  // Find the selected item by its id
  const selectedItem = canvasData.value.find((item) => item.id === id);

  if (selectedItem) {
    selectedCardId.value = id;
    // Emit both id and table_number as tableNumber
    emit("table-selected", {
      id,
      tableNumber: selectedItem.table_number,
    });
    eventBus.emit("onTableSelected");
    closeDialog();
  }
};

// Function to fetch data from the API
const fetchData = async () => {
  pageLoading.value = true;
  try {
    const response = await http.get(`tables/list/${branch_id.value}`);
    const data = response.data.data;

    // Parse the necessary fields
    canvasData.value = data.map((item: any) => ({
      ...item,
      classes: JSON.parse(item.classes),
      addedTables: item.addedTables ? JSON.parse(item.addedTables) : [],
      status: item.status,
    }));
  } catch (error: any) {
    if (error.response.status === 403) {
      unAuthorized.value = true;
    }
  }
  pageLoading.value = false;
};

// Computed property to filter out only tables
const filteredTables = computed(() => {
  return canvasData.value.filter((item) => item.type === "table");
});

const getCardColor = (orderInProgress: boolean) => {
  return orderInProgress ? "#c31432" : "#0f9b0f";
};

// Watch for the newCartItemsLength event from eventBus
const handleNewCartItemsLength = (length: number) => {
  // You can use this length in your component logic
  newCartItemsLength.value = length;
};
onMounted(() => {
  fetchData();
  eventBus.on("onSendToKitchen", () => {
    fetchData();
  });
  eventBus.on("onCompleteOrder", () => {
    fetchData();
  });
  eventBus.on(
    "branchChanged",
    (newBranch: { value: number; label: string }) => {
      branch_id.value = String(newBranch.value);
      fetchData(); // Fetch data with the updated branchId
    }
  );
  // Listen for newCartItemsLength event
  eventBus.on("newCartItemsLength", handleNewCartItemsLength);
});
</script>

<template>
  <v-dialog
    v-model="props.showDialog"
    width="600"
    persistent
    :scrollable="false"
    @update:modelValue="closeDialog"
  >
    <Card :title="`${$t('t-select-table')}`" title-class="py-0">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="closeDialog" />
      </template>
      <PageLoad v-if="pageLoading" />
      <div v-else>
        <v-row v-if="filteredTables.length" justify="center" class="ma-2">
          <v-col
            v-for="item in filteredTables"
            :key="item.id"
            cols="12"
            md="2"
            class="pa-6"
            :class="{ 'selected-card': item.id === selectedCardId }"
          >
            <div class="table-container">
              <div
                :class="[
                  'topChair top-left',
                  { 'in-progress': item.orderInProgress },
                ]"
              ></div>
              <div
                :class="[
                  'topChair top-right',
                  { 'in-progress': item.orderInProgress },
                ]"
              ></div>
              <div class="table-card">
                <v-card
                  :color="getCardColor(item.orderInProgress)"
                  class="mx-auto d-flex align-center justify-center"
                  width="70"
                  height="50"
                  @click="() => item.id !== undefined && selectCard(item.id)"
                >
                  <v-card-title class="d-flex justify-center">{{
                    item.table_number
                  }}</v-card-title>
                  <!-- <v-card-subtitle>{{ item.name }}</v-card-subtitle> -->
                </v-card>
              </div>
              <div
                :class="[
                  'bottomChair bottom-left',
                  { 'in-progress': item.orderInProgress },
                ]"
              ></div>
              <div
                :class="[
                  'bottomChair bottom-right',
                  { 'in-progress': item.orderInProgress },
                ]"
              ></div>
            </div>
          </v-col>
        </v-row>
        <NoResult v-else class="mt-0" />
      </div>
    </Card>
  </v-dialog>
</template>

<style>
.selected-card {
  border: 0px solid black !important;
  /* width: 80px !important;
  height: 80px !important; */
  background-color: rgb(160, 159, 159);
  padding: 10px;
  border-radius: 10px;
  box-sizing: border-box;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  /* margin: 5px; */
}

.table-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.table-card {
  position: relative;
  z-index: 1;
}

.topChair {
  width: 23px;
  height: 12px;
  background-color: #0d460d;
  border: 1px solid #0d6e0d;

  position: absolute;
  z-index: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.bottomChair {
  width: 23px;
  height: 12px;
  background-color: #0d460d;
  border: 1px solid #0d6e0d;
  position: absolute;
  z-index: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Chair seat */
.topChair::before {
  content: "";
  width: 18px;
  height: 3px;
  background-color: #0d460d;
  position: absolute;
  bottom: 5px;
  border-radius: 2px;
}

.bottomChair::before {
  content: "";
  width: 18px;
  height: 3px;
  background-color: #0d460d;
  position: absolute;
  bottom: 5px;
  border-radius: 2px;
}

/* Top-left Chair */
.topChair.top-left {
  border-radius: 10px 10px 0 0;
  /* Curved top edges */
  top: -10px;
  left: calc(50% - 30px);
}

/* Top-right Chair */
.topChair.top-right {
  border-radius: 10px 10px 0 0;
  /* Curved top edges */
  top: -10px;
  left: calc(50% + 8px);
}

/* Bottom-left Chair */
.bottomChair.bottom-left {
  border-radius: 0 0 10px 10px;
  /* Curved bottom edges */
  bottom: -10px;
  left: calc(50% - 30px);
}

/* Bottom-right Chair */
.bottomChair.bottom-right {
  border-radius: 0 0 10px 10px;
  /* Curved bottom edges */
  bottom: -10px;
  left: calc(50% + 8px);
}

.table-card .v-card {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.topChair.in-progress {
  background-color: #8b4513;
  border: 1px solid #654321;
}

.bottomChair.in-progress {
  background-color: #8b4513;
  border: 1px solid #654321;
}

.topChair.in-progress::before {
  background-color: #a0522d;
}

.bottomChair.in-progress::before {
  background-color: #a0522d;
}
</style>
