<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useVuelidate } from "@vuelidate/core";
import { required, minLength, sameAs } from "@vuelidate/validators";
import HttpService from "@/app/http/httpService";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const http = new HttpService();
const router = useRouter();

const isRemember = ref(true);
const loading = ref(false);
const errorMsg = ref("");
const successMsg = ref("");
const isSubmitted = ref(false);

const password = ref("");
const confirm_password = ref("");
const remember_token = ref("");

const rules = {
  password: { required, minLength: minLength(6) },
  confirm_password: {
    required,
    minLength: minLength(6),
    sameAs: sameAs(password),
  },
  remember_token: { required },
};
// Define validation rules and apply them to the form data using Vuelidate
const v$ = useVuelidate(rules, { password, confirm_password, remember_token });

const onReset = async () => {
  v$.value.$validate();
  if (!v$.value.$invalid) {
    try {
      loading.value = true;
      errorMsg.value = "";
      successMsg.value = "";
      isSubmitted.value = true;

      const payload = {
        code: remember_token.value,
        password: password.value,
        confirm_password: confirm_password.value,
      };
      const response = await http.post("reset/password", payload);
      if (response.status === 200) {
        successMsg.value = response.data.msg;
        isSubmitted.value = false;

        setTimeout(() => {
          router.push({ path: "/login" });
        }, 2000);
      } else {
        errorMsg.value = response.data.message;
      }
    } catch (error: any) {
      // errorMsg.value = error.response.data.message;
      errorMsg.value = t("t-invalid_code");
    } finally {
      loading.value = false;
    }
  }
};
</script>
<template>
  <div class="h-100 d-flex align-center justify-center">
    <div class="w-100">
      <v-card-title class="text-center">
        <h5 class="text-h6 font-weight-bold">
          {{ $t("t-create-new-password") }}
        </h5>
        <div class="text-muted mt-1 font-weight-regular">
          {{ $t("t-new-password-different") }}
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

            <v-alert
              v-if="successMsg"
              class="mb-3"
              color="success"
              variant="tonal"
              density="compact"
            >
              {{ successMsg }}
            </v-alert>
            <div class="font-weight-medium mb-1 mb-1 mt-5">
              {{ $t("t-security-code") }}
              <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField
              v-model="remember_token"
              :showError="isSubmitted"
              :isSubmitted="isSubmitted"
              placeholder="`${$t('t-enter-security-code')}`"
              hide-details
              :class="{
                'is-invalid': v$.remember_token.$errors.length,
              }"
            />
            <div v-if="v$.remember_token.$errors" class="invalid-feedback">
              <span v-for="error in v$.remember_token.$errors">
                {{ error.$message }}
              </span>
            </div>
            <div class="d-flex justify-space-between align-center mt-5">
              <div class="font-weight-medium mb-1">
                {{ $t("t-password") }}
                <i class="ph-asterisk ph-xs text-danger" />
              </div>
            </div>
            <TextField
              v-model="password"
              hide-details
              :showError="isSubmitted"
              :isSubmitted="isSubmitted"
              isPassword
              :class="{
                'is-invalid': v$.password.$errors.length,
              }"
            />
            <div v-if="v$.password.$errors" class="invalid-feedback">
              <span v-for="error in v$.password.$errors">
                {{ error.$message }}
              </span>
            </div>
            <div class="text-muted mb-4 text-caption">
              {{ $t("t-password-length") }}
            </div>

            <div class="d-flex justify-space-between align-center mt-5">
              <div class="font-weight-medium mb-1">
                {{ $t("t-confirm-password") }}
                <i class="ph-asterisk ph-xs text-danger" />
              </div>
            </div>
            <TextField
              v-model="confirm_password"
              :showError="isSubmitted"
              :isSubmitted="isSubmitted"
              hide-details
              isPassword
              :class="{
                'is-invalid': v$.confirm_password.$errors.length,
              }"
            />
            <div v-if="v$.confirm_password.$errors" class="invalid-feedback">
              <span v-for="error in v$.confirm_password.$errors">
                {{ error.$message }}
              </span>
            </div>
            <v-checkbox v-model="isRemember" hide-details color="primary">
              <template #label>
                <span class="text-caption">{{ $t("t-remember-me") }}</span>
              </template>
            </v-checkbox>
            <v-btn color="primary" block class="mt-4" @click="onReset">
              {{ $t("t-reset-password") }}
            </v-btn>

            <div class="text-center mt-5 d-flex align-center justify-center">
              {{ $t("t-wait-remember-password") }}
              <v-btn
                to="/login"
                variant="text"
                color="primary"
                class="font-weight-bold text-decoration-underline pa-0"
              >
                {{ $t("t-click-here") }}
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </div>
  </div>
</template>
