<script lang="ts" setup>
import TableAction from "@/app/common/components/TableAction.vue";
import HttpService from "@/app/http/httpService";
import { useVuelidate } from "@vuelidate/core";
import { maxLength, required } from "@vuelidate/validators";
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { TopingSenarioList } from "@/components/dashboard/toping-scenario/types";
import eventBus from "@/components/layouts/topBar/eventBus";
import { getPermissions } from "@/app/http/services/permissionService";
import Unauthorized from "@/app/common/components/common/Unauthorized.vue";
import PageLoad from "@/app/common/components/common/PageLoad.vue";
import NoResult from "@/app/common/components/common/NoResult.vue";

const { t } = useI18n();
const deleteId = ref<number | null>(null);
const dialogVisible = ref(false);
const newItem = ref("");
const nameModel = ref("");
const items = ref<TopingSenarioList[]>([]);
const isEditMode = ref(false);
const editItemId = ref<number | null>(null);
const loading = ref(false);
const http = new HttpService();
const pageLoading = ref(false);
const userPermissions = ref<number[]>([]);
const unAuthorized = ref(false);

const closePopup = () => {
  dialogVisible.value = false;
  newItem.value = "";
  isEditMode.value = false;
  editItemId.value = null;
  nameModel.value = "";
};

interface Item {
  id: number;
  name: string;
}

// Add validation rules
const rules = {
  nameModel: { required, maxLength: maxLength(255) },
};

const v$ = useVuelidate(rules, {
  nameModel,
});

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await http.get("toping-scenario/list");
    // mappedData.value = response.data.data.data;
    // tableData.value = data;
    items.value = response.data.data;
  } catch (error: any) {
    if (error.response.status === 403) {
      unAuthorized.value = true;
    }
  }
  loading.value = false;
};

// Create a new item with a unique id and the name from nameModel
const addItem = () => {
  // validate form
  v$.value.$validate();
  // check validation
  if (!v$.value.$invalid) {
    // send create request
    closePopup();
  }
};

// Update an existing item
const updateItem = () => {
  // send update request
  closePopup();
};

const saveItem = () => {
  if (isEditMode.value) {
    updateItem();
  } else if (!isEditMode.value) {
    addItem();
  }
};

const onDelete = (id: number) => {
  // send delete request
};

const onEdit = (item: Item) => {
  nameModel.value = item.name;
  isEditMode.value = true;
  editItemId.value = item.id;
  openPopup();
};

const openPopup = () => {
  dialogVisible.value = true;
  console.log("Create create");
};

const dragStart = (event: DragEvent, index: number) => {
  const dataTransfer = event.dataTransfer;
  if (dataTransfer) {
    dataTransfer.setData("text/plain", index.toString());
    dataTransfer.effectAllowed = "move";
  }
};

const dragOver = (event: DragEvent) => {
  event.preventDefault();
  event.dataTransfer!.dropEffect = "move";
};

const drop = (event: DragEvent, index: number) => {
  event.preventDefault();
  const draggedIndex = Number(event.dataTransfer!.getData("text/plain"));
  if (draggedIndex === index) return;

  const draggedItem = items.value[draggedIndex];
  items.value.splice(draggedIndex, 1);
  items.value.splice(index, 0, draggedItem);
};
// Called on component mount
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
  <!-------------------------------------- Open popup ------------------------------------->
  <PageLoad v-if="pageLoading" />
  <Unauthorized v-else-if="unAuthorized || !userPermissions.includes(13)" />
  <v-card v-else flat>
    <v-dialog v-model="dialogVisible" width="500">
      <Card
        :title="
          isEditMode
            ? `${$t('t-edit')} ${$t('t-toping-scenario')}`
            : `${$t('t-create')} ${$t('t-toping-scenario')}`
        "
        title-class="py-0"
      >
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="closePopup" />
        </template>
        <v-divider />
        <v-card-text>
          <h5 class="text-subtitle-2 pb-2">{{ $t("t-name") }}</h5>
          <TextField
            v-model="nameModel"
            placeholder="`${$t('t-name')}`"
            hide-details
            :class="{ 'is-invalid': v$.nameModel.$errors.length }"
          />
          <div v-if="v$.nameModel.$errors" class="invalid-feedback">
            <span v-for="error in v$.nameModel.$errors">
              {{ error.$message }}
            </span>
          </div>
        </v-card-text>
        <v-card-actions class="float-right justify-end pb-5 pt-4 pr-5">
          <v-btn color="danger" @click="closePopup"
            >{{ $t("t-cancel") }}
          </v-btn>
          <v-btn variant="elevated" color="primary" @click="saveItem">{{
            isEditMode ? "Update" : "Create"
          }}</v-btn>
        </v-card-actions>
      </Card>
    </v-dialog>

    <!-------------------------------------- Cards ------------------------------------->
    <Card :title="`${t('t-toping-scenario')} ${t('t-list')}`">
      <template #title-action>
        <v-row justify="end" align="center">
          <v-col v-if="userPermissions.includes(14)" cols="auto">
            <v-btn color="primary" varient="tonal" @click="openPopup">
              <i class="ph-plus-circle me-1" />
              Add new
            </v-btn>
          </v-col>
        </v-row>
      </template>
      <v-card-text class="mb-5">
        <!-- <v-row
        class="d-flex"
        style="justify-content: center"
        v-for="(item, index) in items"
        :key="'extraData-' + index"
        cols="12"
        lg="6"
      >
        <v-col cols="12" lg="6">
          <v-card elevation="10">
            <v-card-text>
              <v-row class="d-flex">
                <v-col
                  cols="2"
                  class="d-flex"
                  style="
                    background-color: #130f40;
                    justify-content: center;
                    border-radius: 5px;
                  "
                >
                  <div style="color: white; font-size: 15px">{{ item.id }}</div>
                </v-col>
                <v-col cols="7" class="d-flex" style="justify-content: center">
                  <div style="font-size: 15px">{{ item.name }}</div>
                </v-col>
                <v-col class="d-flex" style="justify-content: center">
                  <TableAction
                    style="justify-content: left"
                    @onEdit="onEdit(item)"
                    @onDelete="onDelete(item.id)"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row> -->
        <v-row justify="center">
          <v-col
            v-for="(item, index) in items"
            :key="'extraData-' + index"
            cols="12"
            md="3"
            draggable="true"
            @dragstart="(event) => dragStart(event, index)"
            @dragover="dragOver"
            @drop="(event) => drop(event, index)"
          >
            <v-card color="#C9D9FF" class="mx-auto">
              <v-card-item>
                <div>
                  <!-- <div class="text-overline mb-1">
              {{ variant }}
            </div> -->
                  <div class="text-h6 mb-1">
                    {{ item.id }}
                  </div>
                  <div class="text-caption">{{ item.name }}</div>
                </div>
              </v-card-item>

              <v-card-actions style="justify-content: flex-end">
                <TableAction
                  :editButton="userPermissions.includes(15)"
                  :deleteButton="userPermissions.includes(16)"
                  @onEdit="onEdit(item)"
                  @onDelete="onDelete(item.id)"
                />
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
        <NoResult v-if="!items.length" />
      </v-card-text>
    </Card>
  </v-card>
</template>
