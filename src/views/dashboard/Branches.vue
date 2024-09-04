<!-- New user view -->
<script lang="ts" setup>
import { breadcrumb } from "@/components/dashboard/branches/utils";
import Branches from "@/components/dashboard/branches/index.vue";
</script>
<template>
  <Breadcrumb :items="breadcrumb" />
  <Branches />
</template>
