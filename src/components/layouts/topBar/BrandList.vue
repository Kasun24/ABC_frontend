<script lang="ts" setup>
import { brandsList } from "@/components/layouts/utils";
</script>
<template>
  <v-menu location="bottom right">
    <template #activator="{ props }">
      <v-btn
        variant="text"
        v-bind="props"
        icon="ph ph-squares-four ph-2x"
        class="btn-ghost-dark"
      />
    </template>
    <v-card>
      <v-card-title class="d-flex justify-space-between">
        <h6 class="m-0 fw-semibold fs-base">{{ $t('t-browse-by-module') }}</h6>
        <v-btn size="small" class="" href="#!" variant="tonal" color="info">
          {{ $t('t-view-all-modules') }}
          <i class="ri-arrow-right-s-line align-middle"></i>
        </v-btn>
      </v-card-title>
      <v-divider class="p-3 border-opacity-50 border-dashed" />
      <v-card-text class="px-2 pb-2">
        <v-row no-gutters>
          <v-col md="4" v-for="(item, index) in brandsList" :key="index">
            <router-link :to="item.link" class="dropdown-icon-item">
              <img :src="item.src" :alt="item.title" />
              <span>{{ item.title }}</span>
            </router-link>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-menu>
</template>
