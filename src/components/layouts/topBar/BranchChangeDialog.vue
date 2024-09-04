<script lang="ts" setup>
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import HttpService from "@/app/http/httpService";
import eventBus from "@/components/layouts/topBar/eventBus";
import { computed, defineEmits, defineProps, onMounted, ref, watch } from "vue";
import { ApiBranchListingType } from "@/components/dashboard/branches/types";
import Swal from "sweetalert2";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const http = new HttpService();
const emit = defineEmits(["update:modelValue", "onUpdateBranch"]);
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const branchId = ref<number>(Number(localStorage.getItem("selectedBranchID")));
const userId = localStorage.getItem("user_id");
const roleId = ref<number>();
const branchNames = ref<{ value: number; label: string }[]>([]);
const assignedBranches = ref<{ value: number; label: string }[]>([]);
const userBranches = ref<number[]>([]); // Define the type explicitly

const fetchData = async () => {
  try {
    const response = await Promise.all([
      http.get(`getuser/${userId}`),
      http.get("get-allbranch"),
    ]);
    userBranches.value = response[0].data.data.branches
      ? JSON.parse(response[0].data.data.branches)
      : [];
    roleId.value = response[0].data.data.role_id;
    const allBranches = response[1].data.data;
    // Extract branch names and ids
    branchNames.value = allBranches.map((branch: ApiBranchListingType) => ({
      value: branch.id,
      label: branch.name,
    }));

    // Filter branches if roleId is not super_admin
    if (roleId.value !== 1) {
      assignedBranches.value = branchNames.value.filter((branch) =>
        userBranches.value.includes(branch.value)
      );
    } else {
      assignedBranches.value = [...branchNames.value];
    }

    // Set the default branch based on the existing branchId
    const defaultBranch = assignedBranches.value.find(
      (branch) => branch.value === branchId.value
    );
    if (defaultBranch) {
      localStorage.setItem("selectedBranchID", String(defaultBranch.value));
      localStorage.setItem("selectedBranchLabel", defaultBranch.label);
      eventBus.emit("branchName");
    } else if (assignedBranches.value.length > 0) {
      // If the branchId doesn't match any assigned branch, set the first assigned branch as default
      const firstBranch = assignedBranches.value[0];
      branchId.value = firstBranch.value;
      localStorage.setItem("selectedBranchID", String(firstBranch.value));
      localStorage.setItem("selectedBranchLabel", firstBranch.label);
      eventBus.emit("branchName");
    }
  } catch (error) {
    console.log(error);
  }
};

watch(
  () => props.modelValue,
  () => {
    if (props.modelValue) {
      fetchData();
    }
  }
);

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const onSave = async () => {
  const selectedBranch = assignedBranches.value.find(
    (b) => b.value === branchId.value
  );
  if (!selectedBranch) {
    console.error("Selected branch not found");
    return;
  }
  const data = {
    value: selectedBranch.value,
    label: selectedBranch.label,
  };

  try {
    const response = await http.post("user/update/branch", {
      user_id: userId,
      branch_id: selectedBranch.value,
    });
    if (response.status === 200) {
      eventBus.emit("branchChanged", data);
      emit("onUpdateBranch", data);
      // show branch changed toast
      const icon = "success";
      const text = t("t-switched_to") + " " + selectedBranch.label;
      Swal.fire({
        icon,
        text,
        timer: 2000,
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener("mouseenter", Swal.stopTimer);
          toast.addEventListener("mouseleave", Swal.resumeTimer);
        },
      });
    } else {
      console.error("Failed to update branch");
    }
  } catch (error) {
    console.log(error);
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <v-dialog
    v-model="dialogValue"
    max-width="500"
    :scrollable="false"
    persistent
  >
    <Card
      :title="`${$t('t-select')} ${$t('t-branch')}`"
      title-class="py-0"
      style="overflow: hidden"
    >
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />
      <v-card-text data-simplebar style="max-height: calc(100vh - 500px)">
        <MenuSelect
          :clearable="false"
          v-model="branchId"
          :items="assignedBranches"
          itemTitle="label"
          itemValue="value"
          placeholder="`${$t('t-select-branch-to-switch')}`"
        />
      </v-card-text>

      <v-divider />
      <v-card-actions>
        <v-row justify="end">
          <v-col class="text-right">
            <v-btn color="danger" @click="dialogValue = false"> Close</v-btn>

            <v-btn color="primary" variant="elevated" @click="onSave">
              {{ $t("t-switch") }}</v-btn
            >
          </v-col>
        </v-row>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
