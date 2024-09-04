<script lang="ts" setup>
import { ref, defineProps, computed, onMounted } from "vue";
import { TableDataType } from "@/components/dashboard/tableManagement/types";
import HttpService from "@/app/http/httpService";
import Swal from "sweetalert2";
import { useI18n } from "vue-i18n";
import { saveLock } from "@/components/dashboard/tableManagement/saveLock";
import { getPermissions } from "@/app/http/services/permissionService";

const { t } = useI18n();
const http = new HttpService();
const editModeActive = ref(false);
const alertMsg = ref();
const userPermissions = ref<number[]>([]);

const emit = defineEmits(["onEditMode", "loadingDone"]);

const props = defineProps({
  canvasData: {
    type: Array as () => TableDataType[],
    required: true,
  },
});

const tableCount = computed(
  () => props.canvasData.filter((item) => item.type === "table").length || 0
);
const tableZoneCount = computed(
  () => props.canvasData.filter((item) => item.type === "tableZone").length || 0
);

const addNewTable = async () => {
  const newTable: TableDataType = {
    table_number: tableCount.value + 1,
    name: "table " + (tableCount.value + 1),
    type: "table",
    elementId: "table-" + (tableCount.value + 1),
    classes: ["table"],
    locationX: 0,
    locationY: 0,
    width: 85,
    height: 40,
    relatedArea: "",
  };
  if (editModeActive.value) {
    try {
      props.canvasData.push(newTable);
    } catch (error) {
      console.error("Error saving table:", error);
    }
  }
};

const addNewTableZone = async () => {
  const newTableZone: TableDataType = {
    name: "Area " + (tableZoneCount.value + 1),
    type: "tableZone",
    elementId: "dropzone-" + (tableZoneCount.value + 1),
    classes: ["dropzone"],
    locationX: 0,
    locationY: 0,
    width: 200,
    height: 100,
    addedTables: [],
    color: "black",
  };
  if (editModeActive.value) {
    try {
      props.canvasData.push(newTableZone);
    } catch (error) {
      console.error("Error saving table zone:", error);
    }
  }
};

const toggleEditMode = () => {
  if (editModeActive.value) {
    saveData();
    document.getElementById("outer-dropzone")?.classList.add("save-mode");
    editModeActive.value = false;
  } else {
    editMode();
  }
  const isEdit = editModeActive.value;
  emit("onEditMode", isEdit);
};
const editMode = () => {
  document.getElementById("outer-dropzone")?.classList.remove("save-mode");
  editModeActive.value = true;
};

const saveData = async () => {
  if (saveLock.value) return; // Prevent multiple simultaneous saves
  saveLock.value = true;
  try {
    const uniqueData = [
      ...new Map(
        props.canvasData.map((item) => [item.elementId, item])
      ).values(),
    ];
    const response = await http.post("table/create", {
      data: uniqueData,
    });
    alertMsg.value = response.data;
    const icon = alertMsg.value.status ? "success" : "error";
    const title = alertMsg.value.status ? t("t-success") : t("t-error");
    const text = alertMsg.value.status
      ? alertMsg.value.message
      : `${alertMsg.value.message}: ${alertMsg.value.table_number}`;

    Swal.fire({ icon, title, text, timer: 2000 });
  } catch (error) {
    console.error("Error updating data:", error);
  } finally {
    saveLock.value = false;
  }
};
onMounted(async () => {
  try {
    // Fetch permissions
    userPermissions.value = await getPermissions();
    // Fetch other necessary data
  } catch (error) {
    console.error("Failed to fetch permissions:", error);
  }
  emit("loadingDone");
});
</script>

<template>
  <div v-if="userPermissions.includes(20)">
    <v-badge class="w-100" color="info" :content="tableCount">
      <v-btn color="secondary" class="w-100" @click="addNewTable"
        ><i class="ph-plus-circle mr-1" /> {{ $t("t-table") }}</v-btn
      >
    </v-badge>
    <v-badge class="w-100 mt-3" color="info" :content="tableZoneCount">
      <v-btn color="secondary" class="w-100" @click="addNewTableZone"
        ><i class="ph-plus-circle mr-1" /> {{ $t("t-area") }}</v-btn
      >
    </v-badge>
    <div class="mt-5">
      <v-btn class="w-100" color="primary" @click="toggleEditMode()">
        {{ editModeActive ? "Save Data" : "Edit Mode" }}
      </v-btn>
    </div>
  </div>
</template>
