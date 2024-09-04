<!-- New user view -->
<script lang="ts" setup>
import Order from "@/components/dashboard/order/index.vue";
import { breadcrumb } from "@/components/dashboard/order/utils";

</script>
<template>
  <Breadcrumb :items="breadcrumb" />
  <Order />
</template>
