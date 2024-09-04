<script lang="ts" setup>
import { ref } from "vue";
import { email } from "@/assets/images/auth/utils";
import { useRouter } from "vue-router";
import { useVuelidate } from "@vuelidate/core";
import { required, email as emailAddress } from "@vuelidate/validators";
import HttpService from "@/app/http/httpService";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const http = new HttpService();
const router = useRouter();

const successMsg = ref("");
const errorMsg = ref("");
const loading = ref(false);
const isSubmitted = ref(false);
const useremail = ref("");

const rules = {
  useremail: { required, emailAddress },
};
// Define validation rules and apply them to the form data using Vuelidate
const v$ = useVuelidate(rules, { useremail });

const onReset = async () => {
  v$.value.$validate();
  if (!v$.value.$invalid) {
    try {
      const payload = {
        email: useremail.value,
      };
      const response = await http.post("forgot/password", payload);
      if (response.status === 200) {
        successMsg.value = t("t-email_sent_successfully");
        isSubmitted.value = true;
        router.push({ path: "/reset/password" });
      } else {
        errorMsg.value = response.data.message;
      }
    } catch (error: any) {
      errorMsg.value = error.response.data.msg[0];
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
        <h5 class="text-h6 font-weight-bold">{{ $t("t-forgot-password") }}?</h5>
        <div class="text-muted mt-1 font-weight-regular">
          {{ $t("t-reset-password") }}
        </div>
      </v-card-title>
      <v-card-text class="mt-5">
        <v-row justify="center" class="align-center">
          <v-col cols="12" lg="8">
            <v-img :src="email" alt="" height="80" />
            <v-alert
              v-if="successMsg"
              class="my-3"
              color="success"
              variant="tonal"
              density="compact"
            >
              {{ successMsg }}
            </v-alert>
            <v-alert
              v-if="errorMsg"
              class="mb-3"
              color="danger"
              variant="tonal"
              density="compact"
            >
              {{ errorMsg }}
            </v-alert>
            <v-alert color="warning" variant="tonal" class="my-4 ps-8">
              {{ $t("t-enter-email-instructions") }}
            </v-alert>
            <div class="font-weight-medium mb-1">
              {{ $t("t-email") }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField
              v-model="useremail"
              placeholder="`${$t('t-enter-email')}`"
              hide-details
              :class="{
                'is-invalid': v$.useremail.$errors.length,
              }"
            />
            <div v-if="v$.useremail.$errors" class="invalid-feedback">
              <span v-for="error in v$.useremail.$errors">
                {{ error.$message }}
              </span>
            </div>
            <v-btn color="primary" block class="mt-4" @click="onReset">
              {{ $t("t-send-reset-link") }}
            </v-btn>

            <div class="text-center mt-5 d-flex align-center justify-center">
              {{ $t("t-remember-password") }}
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
