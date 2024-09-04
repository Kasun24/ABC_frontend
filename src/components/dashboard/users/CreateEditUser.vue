<script lang="ts" setup>
import ImageUploader from "@/app/common/components/ImageUploader.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import HttpService from "@/app/http/httpService";
import { UserListingType } from "@/components/dashboard/users/types";
import { statusOptions } from "@/components/dashboard/users/utils";
import { useVuelidate } from "@vuelidate/core";
import { ApiBranchListingType } from "@/components/dashboard/branches/types";
import {
  email as EmailAddress,
  maxLength,
  minLength,
  required,
  sameAs,
} from "@vuelidate/validators";
import {
  PropType,
  computed,
  defineEmits,
  defineProps,
  onMounted,
  ref,
  watch,
} from "vue";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";

const http = new HttpService();
const emit = defineEmits(["update:modelValue", "onCreateUpdate"]);
const userRoles = ref();
const branchNames = ref<{ value: number; label: string }[]>([]);
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<UserListingType>,
    required: true,
  },
});

const isCreate = computed(() => props.data.id === -1);
const formData = ref<UserListingType>(props.data);
const name = ref(formData.value.name || "");
const role_id = ref<any>(formData.value.role_id);
const isSuperAdmin = ref<boolean>(formData.value.id === 1 || false);
let parsedBranches: Array<number> = [];
try {
  parsedBranches = formData.value.branches
    ? JSON.parse(formData.value.branches)
    : [];
} catch (error) {
  console.error("Failed to parse branches:", error);
}
const branches = ref(parsedBranches);

const email = ref(formData.value.email || "");
const password = ref(formData.value.password || "");
const password_confirmation = ref(formData.value.password_confirmation || "");
const status = ref(formData.value.status ?? 1);
const image = ref(formData.value.image ? [formData.value.image] : []);
const userId = localStorage.getItem("user_id");
const router = useRouter();

const getRoles = async () => {
  try {
    const response = await http.get("role/list");
    const allRoles = response.data.data.data;

    // Filter roles where status is 1 and extract role names
    userRoles.value = allRoles
      .filter((role: any) => role.status === 1)
      .map((role: any) => ({ value: role.id, label: role.role }));
  } catch (error) {
    console.log(error);
  }
};

const getBranches = async () => {
  try {
    const response = await http.get("get-allbranch");
    const allBranches = response.data.data;

    // Extract branch names and ids
    branchNames.value = allBranches.map((branch: ApiBranchListingType) => ({
      value: branch.id,
      label: branch.name,
    }));
  } catch (error) {
    console.log(error);
  }
};

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const rules = computed(() => {
  const passwordRules = isCreate.value
    ? { required, minLength: minLength(6) }
    : {};
  const passwordConfirmationRules = isCreate.value
    ? password.value
      ? { sameAs: sameAs(password) }
      : { required }
    : {};

  const roleRules = isSuperAdmin.value ? {} : { required };
  const branchesRules = isSuperAdmin.value ? {} : { required };

  return {
    name: { required, maxLength: maxLength(50) },
    role_id: roleRules,
    branches: branchesRules,
    email: { required, EmailAddress, maxLength: maxLength(100) },
    password: passwordRules,
    password_confirmation: passwordConfirmationRules,
    status: { required },
  };
});

// Define validation rules and apply them to the form data using Vuelidate
const v$ = useVuelidate(rules, {
  name,
  role_id,
  branches,
  email,
  password,
  password_confirmation,
  status,
});

/**
 * @description Function to handle form submission.
 */
const onSave = async () => {
  // Validate form
  v$.value.$validate();
  // Check validation
  if (!v$.value.$invalid) {
    // Save data
    const data = {
      ...props.data,
      name: name.value,
      role_id: role_id.value,
      branches: branches.value,
      email: email.value,
      password: password.value,
      password_confirmation: password_confirmation.value,
      status: status.value,
      remove_image: !image.value.length,
      image: image.value[0]?.src,
    };

    try {
      // Perform the update operation
      await emit("onCreateUpdate", data);

      // Check if status is changing to "inactive" and user is editing their own profile
      if (status.value === 0 && props.data.id.toString() === userId) {
        // Show warning message if needed
        const spanMessage = document.getElementById("statusChangeMessage");
        if (spanMessage) {
          spanMessage.textContent =
            "System did not access to login, when you inactive the user.";
        }
      }
    } catch (error) {
      console.error("Failed to update user profile:", error);
    }
  }
};

const Logout = (): void => {
  console.log("Logout function called");
  localStorage.removeItem("user_name");
  localStorage.removeItem("access_token");
  localStorage.removeItem("selectedBranchLabel");
  localStorage.removeItem("selectedBranchID");
  localStorage.removeItem("user_id");
  router
    .push("/login")
    .then(() => {
      console.log("Redirected to login page");
    })
    .catch((error) => {
      console.error("Failed to redirect:", error);
    });
};

watch(status, (newStatus) => {
  const spanMessage = document.getElementById("statusChangeMessage");
  if (newStatus === 0 && props.data.id.toString() === userId) {
    // Show window alert message
    if (spanMessage) {
      spanMessage.textContent =
        "System did not access to login, when you inactive the user.";
    }
  } else {
    // Clear the message when status is not "inactive"
    if (spanMessage) {
      spanMessage.textContent = "";
    }
  }
});

onMounted(() => {
  getBranches();
  getRoles();
});
</script>

<style scoped>
.my-custom-popup-class {
  z-index: 10000 !important; /* Important to override default styles */
}
</style>

<template>
  <v-dialog
    v-model="dialogValue"
    max-width="500"
    :scrollable="false"
    persistent
  >
    <Card
      :title="
        isCreate
          ? `${$t('t-add')} ${$t('t-user')}`
          : `${$t('t-edit')} ${$t('t-user')}`
      "
      title-class="py-0"
      style="overflow: hidden"
    >
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />
      <v-card-text data-simplebar style="max-height: calc(100vh - 500px)">
        <div class="font-weight-bold mb-1">{{ $t("t-user-profile") }}</div>
        <ImageUploader
          :text="`${$t('t-drop-file-here-or-click-to-upload')}`"
          v-model="image"
          :multiple="false"
        />
        <div class="font-weight-bold mb-1 mt-3">
          {{ $t("t-user-name") }} <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <v-text-field
          v-model="name"
          hide-details
          variant="solo"
          density="compact"
          class="text-field-component"
          placeholder="`${$t('t-enter-user-name')}`"
          :class="{
            'is-invalid': v$.name.$errors.length,
          }"
        />
        <div v-if="v$.name.$errors" class="invalid-feedback">
          <span v-for="error in v$.name.$errors">
            {{ error.$message }}
          </span>
        </div>

        <div v-show="!isSuperAdmin">
          <div class="font-weight-bold mb-1 mt-3">
            {{ $t("t-role") }} <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <MenuSelect
            v-model="role_id"
            :items="userRoles"
            :class="{
              'is-invalid': v$.role_id.$errors.length,
            }"
          />
          <div v-if="v$.role_id.$errors" class="invalid-feedback">
            <span v-for="error in v$.role_id.$errors">
              {{ error.$message }}
            </span>
          </div>
          <div class="font-weight-bold mb-1 mt-3">
            {{ $t("t-branches") }} <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <MenuSelect
            v-model="branches"
            :items="branchNames"
            multiple
            :class="{
              'is-invalid': v$.branches.$errors.length,
            }"
          />
          <div v-if="v$.branches.$errors" class="invalid-feedback">
            <span v-for="error in v$.branches.$errors">
              {{ error.$message }}
            </span>
          </div>
        </div>
        <div class="font-weight-bold mb-1 mt-3">
          {{ $t("t-email") }} <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <v-text-field
          v-model="email"
          hide-details
          variant="solo"
          density="compact"
          class="text-field-component"
          placeholder="`${$t('t-enter-email')}`"
          :class="{
            'is-invalid': v$.email.$errors.length,
          }"
        />
        <div v-if="v$.email.$errors" class="invalid-feedback">
          <span v-for="error in v$.email.$errors">
            {{ error.$message }}
          </span>
        </div>
        <template v-if="isCreate">
          <div class="font-weight-bold mb-1 mt-3">
            {{ $t("t-password") }} <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <TextField
            v-model="password"
            hide-details
            isPassword
            variant="solo"
            density="compact"
            class="text-field-component"
            placeholder="`${$t('t-enter-password')}`"
            :class="{
              'is-invalid': v$.password.$errors.length,
            }"
          />
          <div v-if="v$.password.$errors" class="invalid-feedback">
            <span v-for="error in v$.password.$errors">
              {{ error.$message }}
            </span>
          </div>
          <div class="font-weight-bold mb-1 mt-3">
            {{ $t("t-confirm-password") }}
            <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <TextField
            v-model="password_confirmation"
            hide-details
            isPassword
            variant="solo"
            density="compact"
            class="text-field-component"
            placeholder="`${$t('t-enter-password-again')}`"
            :class="{
              'is-invalid': v$.password_confirmation.$errors.length,
            }"
          />
          <div v-if="v$.password_confirmation.$errors" class="invalid-feedback">
            <span v-for="error in v$.password_confirmation.$errors">
              {{ error.$message }}
            </span>
          </div>
        </template>
        <div class="font-weight-bold mb-1 mt-3">
          {{ $t("t-status") }} <i class="ph-asterisk ph-xs text-danger" />
          <span id="statusChangeMessage" class="text-danger"></span>
        </div>
        <MenuSelect
          :disabled="isSuperAdmin"
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
