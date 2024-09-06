<script lang="ts" setup>
import Query from "@/components/dashboard/queries/index.vue";
import { breadcrumb } from "@/components/dashboard/queries/utils";
</script>

<template>
  <Breadcrumb :items="breadcrumb" />
  <Query />
</template>
