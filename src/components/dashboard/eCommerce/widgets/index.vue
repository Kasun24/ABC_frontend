<script lang="ts" setup>
import { OverviewList } from "@/components/dashboard/eCommerce/utils";
</script>
<template>
  <v-row >
    <v-col
      cols="12"
      sm="6"
      md="4"
      v-for="(overview, index) in OverviewList"
      :key="'overview-' + index"
      class="simple-border"
    >        
    <router-link :to="overview.link" class="text-decoration-none">                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
      <v-card class="pb-2 h-100 w-100">
        <v-card-text>
          <div class="d-flex justify-space-between text-center">
            <v-container class="pa-0">
            <v-row justify="center" class="text-center">
              <v-col cols="auto">
             
            <v-avatar :color="overview.avatarColor" variant="tonal" size="50">
              <i :class="overview.icon" class="mdi-18px"></i>
            </v-avatar>
            <ListMenu
              is-icon
              class="dashboard-menu"
              :listItems="['Today', 'Last Week', 'Last Month ', 'Current Year']"
            />
        </v-col>
              </v-row>
              </v-container>
          </div>
          <div class="text-uppercase text-muted pt-5 text-center" style="font-size: 15px;" >
            {{ overview.title }}
          </div>
          <div>
            <h3 class="py-3">
              <CountTo
                class="text-h6 font-weight-bold"
                :prefix="overview.prefix"
                :endVal="overview.countTo"
                :suffix="overview.suffix"
                :decimals="overview.decimals"
              />
            </h3>
          </div>
          <div class="d-flex">
            <span
              class="d-flex align-center px-1 font-weight-bold"
              :class="overview.isSuccess ? 'text-success' : 'text-danger'"
              ><i
                v-if="overview.isSuccess"
                class="ph ph-arrow-up-right pe-1"
              ></i>
              <i v-else class="ph ph-trend-down px-1"></i>
              {{ overview.progress }}
            </span>
            <span class="text-muted"> {{ $t('t-than-last-week') }} </span>
          </div>
        </v-card-text>
      </v-card>
    </router-link>
    </v-col>
  </v-row>
</template>

