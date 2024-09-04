<!-- New user view -->
<script lang="ts" setup>
import { breadcrumb } from "@/components/dashboard/logs/client/utils";
import ClientLogs from "@/components/dashboard/logs/client/index.vue";
</script>
<template>
  <Breadcrumb :items="breadcrumb" />
  <ClientLogs />
</template>
