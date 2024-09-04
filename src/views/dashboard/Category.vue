<!-- New user view -->
<script lang="ts" setup>
import { breadcrumb } from "@/components/dashboard/category/utils";
import Category from "@/components/dashboard/category/index.vue";
</script>
<template>
  <Breadcrumb :items="breadcrumb" />
  <Category />
</template>
