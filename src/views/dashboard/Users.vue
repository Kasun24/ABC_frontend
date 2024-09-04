<!-- New user view -->
<script lang="ts" setup>
import { breadcrumb } from "@/components/dashboard/users/utils";
import Users from "@/components/dashboard/users/index.vue";
</script>
<template>
  <Breadcrumb :items="breadcrumb" />
  <Users />
</template>
