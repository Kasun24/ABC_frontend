<!-- New user view -->
<script lang="ts" setup>
import { breadcrumb } from "@/components/dashboard/tableManagement/utils";
import Roles from "@/components/dashboard/tableManagement/index.vue";
</script>
<template>
  <Breadcrumb :items="breadcrumb" />
  <Roles />
</template>
@/components/dashboard/tables/utils
