<script lang="ts" setup>
import interact from "interactjs";
import { computed, ref, watch, onMounted } from "vue";
import { TableDataType } from "@/components/dashboard/tableManagement/types";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import CreateElement from "@/components/dashboard/tableManagement/CreateElement.vue";
import EditElement from "@/components/dashboard/tableManagement/EditElement.vue";
import HttpService from "@/app/http/httpService";
import eventBus from "@/components/layouts/topBar/eventBus";
import Swal from "sweetalert2";
import { useI18n } from "vue-i18n";
import PageLoad from "@/app/common/components/common/PageLoad.vue";
import Unauthorized from "@/app/common/components/common/Unauthorized.vue";
import { getPermissions } from "@/app/http/services/permissionService";

const { t } = useI18n();
const http = new HttpService();
const canvasData = ref<TableDataType[]>([]);
const editModeActive = ref(false);
const pageLoading = ref(true);
const unAuthorized = ref(false);
const userPermissions = ref<number[]>([]);

// Function to fetch data from the API
const fetchData = async () => {
  try {
    const response = await http.get("table/list");
    const data = response.data.data;

    // Parse the necessary fields
    canvasData.value = data.map((item: any) => ({
      ...item,
      classes: JSON.parse(item.classes),
      addedTables: item.addedTables ? JSON.parse(item.addedTables) : [],
    }));
  } catch (error: any) {
    if (error.response.status === 403) {
      unAuthorized.value = true;
    }
  }
};

// const canvasData = ref<TableDataType[]>(tabledata);
const deleteDialog = ref(false);
const deletedId = ref<string | null>(null);
const selectedData = ref<TableDataType>();
const dialog = ref(false);

const zoomLevel = ref(1);
const maxZoomLevel = 1.5;
const minZoomLevel = 0.5;
const isZoomInDisabled = computed(() => zoomLevel.value >= maxZoomLevel);
const isZoomOutDisabled = computed(() => zoomLevel.value <= minZoomLevel);

function zoomIn() {
  zoomLevel.value += 0.1; // Increase zoom level
}

function zoomOut() {
  zoomLevel.value -= 0.1; // Decrease zoom level
}

function handleMouseWheel(event: WheelEvent) {
  const zoomStep = 0.1;
  const zoomChange = event.deltaY > 0 ? -zoomStep : zoomStep; // Determine whether to zoom in or out based on the mouse wheel direction
  // Increase or decrease zoom level by the zoom step
  zoomLevel.value += zoomChange;
  // Ensure zoom level stays within a reasonable range
  zoomLevel.value = Math.min(
    Math.max(zoomLevel.value, minZoomLevel),
    maxZoomLevel
  );
}

watch(zoomLevel, () => {
  interact(".draggable").resizable(true);
});

// enable draggables to be dropped into this
interact(".dropzone")
  .dropzone({
    // only accept elements matching this CSS selector
    accept: ".table",
    // Require a 75% element overlap for a drop to be possible
    overlap: 1,

    // listen for drop related events:
    ondropactivate: function (event) {
      // add active dropzone feedback
      event.target.classList.add("drop-active");
    },
    ondragenter: function (event) {
      var draggableElement = event.relatedTarget;
      var dropzoneElement = event.target;

      // feedback the possibility of a drop
      dropzoneElement.classList.add("drop-target");
      draggableElement.classList.add("can-drop");
      draggableElement.classList.remove("outside");
    },
    ondragleave: function (event) {
      // remove the drop feedback style
      event.target.classList.remove("drop-target");
      event.relatedTarget.classList.add("no-transform");
      event.relatedTarget.classList.remove("can-drop");
      event.relatedTarget.classList.add("outside");

      const areaId = event.target.id;
      const elementId = event.relatedTarget.id;
      removeTable(areaId, elementId);
    },
    ondrop: function (event) {
      event.relatedTarget.classList.add("dropped");
      const areaId = event.target.id;
      const elementId = event.relatedTarget.id;

      addArea(elementId, areaId);
      addTable(areaId, elementId);
    },
    ondropdeactivate: function (event) {
      // remove active dropzone feedback
      event.target.classList.remove("drop-active");
      event.target.classList.remove("drop-target");
    },
  })
  .resizable({
    // resize from all edges and corners
    edges: { left: true, right: true, bottom: true, top: true },

    listeners: {
      move(event) {
        var target = event.target;
        var x = parseFloat(target.getAttribute("data-x")) || 0;
        var y = parseFloat(target.getAttribute("data-y")) || 0;

        // update the element's style
        target.style.width = `${event.rect.width / zoomLevel.value}px`;
        target.style.height = `${event.rect.height / zoomLevel.value}px`;

        // translate when resizing from top or left edges
        x += event.deltaRect.left;
        y += event.deltaRect.top;

        target.style.transform = "translate(" + x + "px," + y + "px)";

        target.setAttribute("data-x", x);
        target.setAttribute("data-y", y);

        updateData();
      },
    },
    modifiers: [
      // keep the edges inside the parent
      interact.modifiers.restrictEdges({
        outer: "parent",
      }),

      // minimum size
      interact.modifiers.restrictSize({
        min: { width: 100, height: 50 },
      }),
    ],

    inertia: true,
  })
  .draggable({
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: "parent",
        endOnly: true,
      }),
    ],
    autoScroll: true,
    // dragMoveListener from the dragging demo above
    listeners: { move: dragMoveListener },
  });

interact(".table").draggable({
  inertia: true,
  modifiers: [
    interact.modifiers.restrictRect({
      restriction: "parent",
      endOnly: true,
    }),
  ],
  autoScroll: true,
  // dragMoveListener from the dragging demo above
  listeners: { move: dragMoveListener },
});

function dragMoveListener(event: any) {
  var target = event.target;
  var targetId = target.id;
  // keep the dragged position in the data-x/data-y attributes
  var x =
    (parseFloat(target.getAttribute("data-x")) || 0) +
    event.dx / zoomLevel.value;
  var y =
    (parseFloat(target.getAttribute("data-y")) || 0) +
    event.dy / zoomLevel.value;

  // translate the element
  target.style.transform = "translate(" + x + "px, " + y + "px)";

  // update the posiion attributes
  target.setAttribute("data-x", x);
  target.setAttribute("data-y", y);

  const activeItem = canvasData.value.find(
    (item) => item.elementId === targetId && item.type === "tableZone"
  );

  var relatedTables = activeItem?.addedTables;

  // Loop through the IDs and set styles for each table
  relatedTables?.forEach((tableId) => {
    // Find the table in canvasData based on its ID
    const table = canvasData.value.find((item) => item.elementId === tableId);
    if (table) {
      // Apply styles to the table
      const tableElement = document.getElementById(tableId);
      if (tableElement) {
        // translate the element
        tableElement.style.transform = "translate(" + x + "px, " + y + "px)";

        // update the posiion attributes
        tableElement.setAttribute("data-x", x.toString());
        tableElement.setAttribute("data-y", y.toString());
      }
    }
  });

  updateData();
}

// item click to edit
const onElementClick = (data: TableDataType) => {
  selectedData.value = data;
  dialog.value = true;
};

watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    selectedData.value = undefined;
  }
});

// update related area on table
const addArea = (elementId: string, areaId: string) => {
  const draggableTable = canvasData.value.find(
    (item) => item.elementId === elementId
  );
  if (draggableTable?.classes.includes("can-drop")) {
    draggableTable.relatedArea = areaId;
  }
};

// add table to area
const addTable = (areaId: string, elementId: string) => {
  const draggableArea = canvasData.value.find(
    (item) => item.elementId === areaId
  );
  if (draggableArea) {
    if (!draggableArea.addedTables?.includes(elementId)) {
      draggableArea.addedTables?.push(elementId);
    }
  }
};
// remove table from area
const removeTable = (areaId: string, elementId: string) => {
  const draggableArea = canvasData.value.find(
    (item) => item.elementId === areaId
  );
  if (draggableArea) {
    if (draggableArea.addedTables?.includes(elementId)) {
      draggableArea.addedTables = draggableArea.addedTables?.filter(
        (id) => id !== elementId
      );
    }
  }
};
// Update element
const onUpdate = (data: TableDataType) => {
  dialog.value = false;
  // Find the element in canvasData based on ID
  const index = canvasData.value.findIndex(
    (item) => item.elementId === data.elementId
  );
  if (index !== -1) {
    // Update the element in canvasData
    if (data.type === "table") {
      canvasData.value[index].table_number = data.table_number;
    }
    canvasData.value[index].name = data.name;
    canvasData.value[index].color = data.color;
  }
};

const updateData = () => {
  canvasData.value.forEach((item) => {
    const element = document.getElementById(item.elementId);
    if (element) {
      item.locationX =
        parseFloat(element.style.left) +
        (parseFloat(element.getAttribute("data-x")!) || 0);
      item.locationY =
        parseFloat(element.style.top) +
        (parseFloat(element.getAttribute("data-y")!) || 0);
      item.width = parseFloat(element.style.width);
      item.height = parseFloat(element.style.height);
      item.classes = element.getAttribute("class")?.split(" ") || [];
      element.style.transform = "translate(0, 0)";
      element.setAttribute("data-x", "0");
      element.setAttribute("data-y", "0");
    }
  });
};

const onClickDelete = (id: string) => {
  deletedId.value = id;
  deleteDialog.value = true;
};
const onConfirm = () => {
  // Get the ID of the item to be deleted
  const idToDelete = deletedId.value;

  // Find the item in canvasData based on its ID
  const itemToDelete = canvasData.value.find(
    (item) => item.elementId === idToDelete
  );

  if (itemToDelete) {
    // If the item is a tableZone and has associated tables
    if (itemToDelete.type === "tableZone" && itemToDelete.addedTables?.length) {
      Swal.fire({
        icon: "warning",
        title: t("t-warning"),
        text: t("t-area-has-tables"),
      });
      deleteDialog.value = false;
    } else if (itemToDelete.type === "tableZone") {
      canvasData.value = canvasData.value.filter(
        (item) => item.elementId !== idToDelete
      );
      Swal.fire({
        position: "top-end",
        toast: true,
        icon: "success",
        title: t("t-area_deleted"),
        showConfirmButton: false,
        timer: 1500,
      });
    } else if (itemToDelete.type === "table") {
      const relatedAreaId = itemToDelete.relatedArea;
      if (relatedAreaId) {
        const relatedArea = canvasData.value.find(
          (item) => item.elementId === relatedAreaId
        );

        if (relatedArea && relatedArea.addedTables) {
          // Remove the table from the relatedArea's addedTables
          relatedArea.addedTables = relatedArea.addedTables.filter(
            (tableId) => tableId !== itemToDelete.elementId
          );
        }
      }
      canvasData.value = canvasData.value.filter(
        (item) => item.elementId !== idToDelete
      );
      Swal.fire({
        position: "top-end",
        toast: true,
        icon: "success",
        title: t("t-table_deleted"),
        showConfirmButton: false,
        timer: 1500,
      });
    }
    deleteDialog.value = false;
  }
};

// change edit mode on emit
function onEditMode(editMode: boolean) {
  editModeActive.value = editMode;
}

const onLoadingDone = () => {
  pageLoading.value = false;
};
// fetch data on component mount
onMounted(async () => {
  pageLoading.value = true;
  try {
    // Fetch permissions
    userPermissions.value = await getPermissions();
    // Fetch other necessary data
    await fetchData();
    eventBus.on("branchChanged", () => {
      fetchData();
    });
  } catch (error) {
    console.error("Failed to fetch permissions:", error);
  }
  pageLoading.value = false;
});
</script>

<template>
  <PageLoad v-if="pageLoading" />
  <div v-else>
    <Unauthorized v-if="unAuthorized || !userPermissions.includes(19)" />
    <v-row v-else>
      <v-col cols="auto">
        <CreateElement
          :canvasData="canvasData"
          @onEditMode="onEditMode"
          @loadingDone="onLoadingDone"
        />
      </v-col>
      <v-col>
        <div class="dropzone-container">
          <div class="dropzone-sec" @wheel.prevent="handleMouseWheel">
            <div
              id="outer-dropzone"
              class="bg-light save-mode"
              :style="{ transform: `scale(${zoomLevel})` }"
            >
              <!-- add here table and table zone divs from canvasData -->
              <div
                v-for="item in canvasData"
                :key="item.elementId"
                :id="item.elementId"
                :class="[item.classes]"
                :style="{
                  left: item.locationX + 'px',
                  top: item.locationY + 'px',
                  width: item.width + 'px',
                  height: item.height + 'px',
                  backgroundColor: item.color + '!important',
                }"
              >
                <div class="table-chair-container">
                  <div class="chair chair-1"></div>
                  <div class="chair chair-2"></div>
                  <div class="chair chair-3"></div>
                  <div class="chair chair-4"></div>
                </div>

                <div class="position-relative">
                  {{ item.type === "table" ? item.table_number : item.name }}
                  <v-btn
                    v-if="editModeActive && userPermissions.includes(22)"
                    class="action-btn del-btn"
                    @click="onClickDelete(item.elementId)"
                  >
                    <i class="ph-trash-bold" />
                  </v-btn>
                  <v-btn
                    v-if="editModeActive && userPermissions.includes(21)"
                    class="action-btn edit-btn"
                    @click="onElementClick(item)"
                  >
                    <i class="ph-pencil-bold" />
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
          <div class="zoombtns">
            <v-btn
              size="small"
              variant="elevated"
              icon
              color="secondary"
              @click="zoomIn"
              :disabled="isZoomInDisabled"
            >
              <i class="ph-magnifying-glass-plus" />
            </v-btn>
            <v-btn
              size="small"
              variant="elevated"
              icon
              color="secondary"
              class="mt-1"
              @click="zoomOut"
              :disabled="isZoomOutDisabled"
            >
              <i class="ph-magnifying-glass-minus" />
            </v-btn>
          </div>
        </div>

        <EditElement
          v-if="selectedData"
          :data="selectedData"
          v-model="dialog"
          @onUpdate="onUpdate"
        />
        <RemoveItemConfirmationDialog
          v-if="deletedId"
          v-model="deleteDialog"
          @onConfirm="onConfirm"
        />
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
@import "./style.css";
</style>
