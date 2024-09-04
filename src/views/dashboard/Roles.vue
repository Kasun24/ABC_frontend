<!-- New user view -->
<script lang="ts" setup>
import { breadcrumb } from "@/components/dashboard/roles/utils";
import Roles from "@/components/dashboard/roles/index.vue";
</script>
<template>
  <Breadcrumb :items="breadcrumb" />
  <Roles />
</template>
