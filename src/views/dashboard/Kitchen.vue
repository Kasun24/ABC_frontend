<script lang="ts" setup>
import Kitchen from "@/components/dashboard/kitchen/index.vue"
import { breadcrumb } from "@/components/dashboard/kitchen/utils";

</script>

<template>
    <Breadcrumb :items="breadcrumb" />
    <Kitchen/>
</template>