<script lang="ts" setup>
import Customer from "@/components/dashboard/customer/index.vue"
import { breadcrumb } from "@/components/dashboard/customer/utils";

</script>

<template>
    <Breadcrumb :items="breadcrumb" />
    <Customer/>
</template>