<script lang="ts" setup>
import { useI18n } from "vue-i18n";
const { t } = useI18n();
</script>
<template>
  <div class="text-center my-10">
    <v-avatar size="80" color="primary" variant="tonal" class="mb-3">
      <i class="ph-lock-key" style="font-size: 30px" color="primary" />
    </v-avatar>
    <div class="font-weight-bold text-subtitle-1 mb-1">
      Access Denied
    </div>
    <div class="text-muted">
     You do not have permission to access this page.
    </div>
  </div>
</template>
