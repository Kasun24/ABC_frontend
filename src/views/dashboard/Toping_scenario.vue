<script lang="ts" setup>
import TopingScenario from "@/components/dashboard/toping-scenario/index.vue";
import { breadcrumb } from "@/components/dashboard/toping-scenario/utils";
</script>

<template>
    <Breadcrumb :items="breadcrumb" />
    <TopingScenario/>
</template>