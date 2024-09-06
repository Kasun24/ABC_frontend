<script setup>
import { logHeaders, logs } from "@/components/dashboard/logs/client/utils";

import { ref, watch, computed, onMounted } from "vue";

import Swal from "sweetalert2";
import HttpService from "@/app/http/httpService";
import { useI18n } from "vue-i18n";
import eventBus from "@/components/layouts/topBar/eventBus";
import { getPermissions } from "@/app/http/services/permissionService";
import Unauthorized from "@/app/common/components/common/Unauthorized.vue";
import PageLoad from "@/app/common/components/common/PageLoad.vue";

const expanded = ref([]);
const { t } = useI18n();
const http = new HttpService();
const loading = ref(false);
const mappedData = ref([]);
const pageLoading = ref(false);
const userPermissions = ref([]);
const unAuthorized = ref(false);

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await http.get(`activity-logs`);
    response.data.data.forEach(async (element) => {
      // console.log("DATA : ",await formatDate(element?.updated_at));
      element.created_at = await formatDate(element?.created_at);
    });
    mappedData.value = response.data.data;
  } catch (error) {
    if (error.response.status === 403) {
      unAuthorized.value = true;
    }
  }
  loading.value = false;
};

const formatDate = async (dateString) => {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch (error) {
    console.log(error);
  }
};

// Called on component mount
onMounted(async () => {
  pageLoading.value = true;
  try {
    // Fetch permissions
    userPermissions.value = await getPermissions();
    // Fetch other necessary data
    await fetchData();
    eventBus.on("branchChanged", () => {
      fetchData();
    });
  } catch (error) {
    console.error("Failed to fetch permissions:", error);
  }
  pageLoading.value = false;
});
</script>

<style>
.blue-header th {
  background-color: rgb(238, 240, 247);
}
</style>

<template>
  <PageLoad v-if="pageLoading" />
  <Unauthorized v-else-if="unAuthorized || !userPermissions.includes(43)" />
  <v-data-table
    v-else
    v-model:expanded="expanded"
    :headers="logHeaders"
    :items="mappedData"
    item-value="id"
    show-expand
    :loading="loading"
    class="blue-header"
  >
    <template v-slot:expanded-row="{ item }">
      <tr>
        <td colspan="5" class="px-0">
          <v-card class="mx-0" color="light">
            <v-card-text>
              <v-row>
                <!-- <v-col cols="3">
                  <v-card class="h-100">
                    <v-img
                      :src="item.properties[0].docFile"
                      alt="Card image cap"
                      class="w-100"
                    />
                  </v-card>
                </v-col> -->
                <v-col cols="12">
                  <v-card class="h-100 px-4">
                    <v-card-text>
                      <div v-if="item.properties">
                        <v-row>
                          <v-col class="px-0">
                            <div class="font-weight-bold table-cell">
                              Table Column Name
                            </div>
                          </v-col>
                          <v-col class="px-0">
                            <div class="font-weight-bold table-cell">
                              Old Value
                            </div>
                          </v-col>
                          <v-col class="px-0">
                            <div
                              v-if="
                                item.properties['attributes'] &&
                                item.description !== 'deleted'
                              "
                              class="font-weight-bold table-cell"
                            >
                              New Value
                            </div>
                            <div
                              v-if="
                                item.properties['attributes'] &&
                                item.description === 'deleted'
                              "
                              class="font-weight-bold table-cell"
                            >
                              Delete Value
                            </div>
                          </v-col>
                        </v-row>
                        <v-row
                          v-for="(value, key) in item.properties.attributes"
                          :key="key"
                        >
                          <v-col class="px-0" cols="4">
                            <div class="font-weight-bold table-cell">
                              {{ key }}
                            </div>
                          </v-col>
                          <v-col class="px-0" cols="4">
                            <div
                              v-if="
                                item.properties.old &&
                                item.properties.old !== undefined
                              "
                              class="table-cell"
                            >
                              <span v-if="item.properties.old[key] == value">
                                {{ item.properties.old[key] }}
                              </span>
                              <span v-else>
                                <div
                                  style="
                                    color: red;
                                    text-decoration: line-through;
                                  "
                                >
                                  {{
                                    item.properties.old[key] == null
                                      ? "null"
                                      : item.properties.old[key]
                                  }}
                                </div>
                              </span>
                            </div>
                            <div v-else class="table-cell"></div>
                          </v-col>
                          <v-col class="px-0" cols="4">
                            <div
                              v-if="
                                item.properties.old &&
                                item.properties.old !== undefined
                              "
                              class="table-cell"
                            >
                              <span v-if="item.properties.old[key] == value">
                                {{ value }}
                              </span>
                              <span v-else>
                                <div style="color: green">
                                  {{ value }}
                                </div>
                              </span>
                            </div>
                            <div v-else class="table-cell">
                              <span
                                v-if="
                                  item.properties['attributes'] &&
                                  item.description === 'deleted'
                                "
                              >
                                <div
                                  style="
                                    color: red;
                                    text-decoration: line-through;
                                  "
                                >
                                  {{ value }}
                                </div>
                              </span>
                              <span
                                v-else-if="
                                  item.properties['attributes'] &&
                                  item.description === 'created'
                                "
                              >
                                <div style="color: green">
                                  {{ value }}
                                </div>
                              </span>
                              <span v-else>
                                {{ value }}
                              </span>
                            </div>
                          </v-col>
                        </v-row>
                      </div>
                      <v-row v-else>
                        <v-col> No Data </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </td>
      </tr>
    </template>
  </v-data-table>
</template>
<style>
.table-cell {
  height: 40px;
  border-bottom: 1px solid #ddd;
  overflow: hidden;
  padding: 10px 0;
}
</style>
