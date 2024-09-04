<!-- New user view -->
<script lang="ts" setup>
import { breadcrumb } from "@/components/dashboard/products/categories/utils";
import Categories from "@/components/dashboard/products/categories/index.vue";
</script>
<template>
  <Breadcrumb :items="breadcrumb" />
  <Categories />
</template>
