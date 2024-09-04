<!-- New user view -->
<script lang="ts" setup>
import { breadcrumb } from "@/components/dashboard/product/utils";
import Product from "@/components/dashboard/product/index.vue";
</script>
<template>
  <Breadcrumb :items="breadcrumb" />
  <Product />
</template>
