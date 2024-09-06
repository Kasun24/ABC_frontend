<script lang="ts" setup>
import appConfigs from "@/app/appConfigurations";
import HttpService from "@/app/http/httpService";
import { useVuelidate } from "@vuelidate/core";
import { email, minLength, required } from "@vuelidate/validators";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const http = new HttpService();

const router = useRouter();

const loading = ref(false);
const isSubmitted = ref(false);
const isRemember = ref(false);

const errorMsg = ref("");
const useremail = ref("");
const userpassword = ref("");

const rules = {
  useremail: { required, email },
  userpassword: { required, minLength: minLength(6) },
};
// Define validation rules and apply them to the form data using Vuelidate
const v$ = useVuelidate(rules, { useremail, userpassword });

onMounted(() => {
  let rememberDetails = localStorage.getItem("loginDetails");
  if (rememberDetails) {
    let loginDetails = JSON.parse(rememberDetails);
    useremail.value = loginDetails.email;
    userpassword.value = loginDetails.password;
    isRemember.value = true;
  }
});

const onLogIn = async () => {
  await v$.value.$validate();
  if (!v$.value.$invalid) {
    try {
      loading.value = true;
      errorMsg.value = "";
      isSubmitted.value = true;

      const payload = {
        email: useremail.value,
        password: userpassword.value,
      };

      const response = await http.post("login", payload);

      if (response.status === 200) {
        const token = response.data.token;
        const user = response.data.user.name;
        const userId = response.data.user.id;
        const status = response.data.user.status;
        const roleId = response.data.user.role_id;
        const branch_id = response.data.user.branch_id;
        // Save the token in local storage or a cookie
        localStorage.setItem("role_id", roleId);
        localStorage.setItem("access_token", token);
        localStorage.setItem("user_name", user);
        localStorage.setItem("user_id", userId);
        localStorage.setItem("selectedBranchID", branch_id);

        if (isRemember.value) {
          localStorage.setItem("loginDetails", JSON.stringify(payload));
        } else {
          localStorage.setItem("loginDetails", "");
        }

        if (status === 1) {
          const roleResponse = await http.get(`role/${roleId}`);
          if (roleResponse.data.data.status === 1) {
            router.push({ path: "/" });
          } else {
            errorMsg.value = t("t-role_inactive");
          }
        } else {
          errorMsg.value = t("t-account_inactive");
        }
      } else {
        errorMsg.value = response.data.message;
      }
    } catch (error: any) {
      errorMsg.value = error.response.data.message;
    } finally {
      loading.value = false;
    }
  }
};
</script>
<template>
  <div class="h-100 d-flex align-center justify-center position-relative">
    <div class="position-absolute" style="top: 0; right: 0">
      <LanguageDropDown />
    </div>
    <div class="w-100">
      <v-card-title class="text-center">
        <h5 class="text-h6 font-weight-bold mt-10">
          {{ $t("t-welcome_back") }}
        </h5>
        <div class="text-muted font-weight-regular">
          {{ $t("t-sign_in_continue_to") }} {{ appConfigs.appName }}.
        </div>
      </v-card-title>
      <v-card-text class="mt-5">
        <v-row justify="center" class="align-center">
          <v-col cols="12" lg="8">
            <v-alert
              v-if="errorMsg"
              class="mb-3"
              color="danger"
              variant="tonal"
              density="compact"
            >
              {{ errorMsg }}
            </v-alert>
            <div class="font-weight-medium mb-1">
              {{ $t("t-email") }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField
              v-model="useremail"
              hideDetails
              :showError="isSubmitted"
              :isSubmitted="isSubmitted"
              :class="{
                'is-invalid': v$.useremail.$errors.length,
              }"
            />
            <div v-if="v$.useremail.$errors" class="invalid-feedback">
              <span v-for="error in v$.useremail.$errors">
                {{ $t("t-email") }} {{ error.$message }}
              </span>
            </div>
            <div class="d-flex justify-space-between align-center mt-4">
              <div class="font-weight-medium">
                {{ $t("t-password") }}
                <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <v-btn
                variant="plain"
                class="px-0 font-weight-regular"
                to="/forgot/password"
              >
                {{ $t("t-forgot_password") }}?
              </v-btn>
            </div>
            <TextField
              v-model="userpassword"
              hide-details
              :showError="isSubmitted"
              :isSubmitted="isSubmitted"
              isPassword
              :class="{
                'is-invalid': v$.userpassword.$errors.length,
              }"
            />
            <div v-if="v$.userpassword.$errors" class="invalid-feedback">
              <span v-for="error in v$.userpassword.$errors">
                {{ $t("t-password") }} {{ error.$message }}
              </span>
            </div>
            <v-checkbox
              v-model="isRemember"
              hide-details
              color="primary"
              class="my-1"
            >
              <template #label>
                <span>{{ $t("t-remember_me") }}</span>
              </template>
            </v-checkbox>
            <v-btn
              color="primary"
              block
              class="mt-2"
              :loading="loading"
              @click="onLogIn"
            >
              {{ $t("t-sign_in") }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </div>
  </div>
</template>
