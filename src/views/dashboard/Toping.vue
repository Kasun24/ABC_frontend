<script lang="ts" setup>
import Toping from "@/components/dashboard/toping/index.vue";
import { breadcrumb } from "@/components/dashboard/toping/utils";

</script>

<template>
    <Breadcrumb :items="breadcrumb" />
    <Toping />
</template>