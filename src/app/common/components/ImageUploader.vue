<script lang="ts" setup>
import { ImageUploaderType } from "@/app/common/types/imageUploader";
import { v4 as uuidv4 } from "uuid";
import { computed, ref, watch, onMounted } from "vue";
import { Avatar2 } from "@/assets/images/users/utils";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const emit = defineEmits(["update:modelValue"]);

const uploaderItem = ref<ImageUploaderType[]>([]);
const prop = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  text: {
    type: String,
    default: "Drop files here or click to upload.",
  },
  multiple: {
    type: Boolean,
    default: true,
  },
  templateType: {
    type: String,
    default: "default", // or "alternative"
  },
});
const selectedImage = ref<string>(Avatar2);
const showFileInput = ref(false);
const errorMsg = ref<string>("");
// Function to get the full image path
const getUserImagePath = (imageName: string) => {
  const apiUrl = import.meta.env.VITE_API_URL;
  return `${apiUrl}user/image/${imageName}`;
};

const files = computed({
  get() {
    const existingFiles: ImageUploaderType[] = prop.modelValue.map(
      (data: any, index) => {
        return {
          ...data,
          src: (data && data.src) || getUserImagePath(data),
          name: (data && data.name) || data,
          // size: (data && data.size) || 1024,
          id: (data && data.id) || uuidv4(),
        };
      }
    );
    uploaderItem.value = existingFiles;
    return existingFiles;
  },
  set(value: any) {
    const data = value.map(async (file: any) => {
      if (!file.id) {
        const base64 = await toBase64(file);
        return {
          src: base64,
          name: file.name,
          size: file.size,
          id: uuidv4(),
        };
      }
      return file;
    });

    Promise.all(data).then((result) => {
      if (prop.multiple) {
        uploaderItem.value = [...uploaderItem.value, ...result];
      } else {
        uploaderItem.value = result;
      }
      emit("update:modelValue", uploaderItem.value);
    });
  },
});

const toBase64 = (file: File): Promise<string> => {
  errorMsg.value = "";
  if (file.size > 2 * 1024 * 1024) {
    // 1MB
    errorMsg.value = t("t-file_too_large", { fileName: file.name });
    return Promise.reject();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject();
  });
};

// watch(files, (newFiles) => {
//   if (newFiles.length > 0) {
//     selectedImage.value = newFiles[0].src; // Update the selected image with the first uploaded image
//   }
// });

watch(files, (newFiles) => {
  if (newFiles.length > 0) {
    selectedImage.value = newFiles[0].src; // Update the selected image with the first uploaded image
  } else {
    selectedImage.value = Avatar2; // Reset to default image if no files are left
  }
});

onMounted(() => {
  if (uploaderItem.value.length > 0) {
    selectedImage.value = uploaderItem.value[0].src; // Set the selected image if there are existing files
  }
});

// const onRemove = (item: any) => {
//   uploaderItem.value = uploaderItem.value.filter(
//     (uploaded: any) => uploaded.id !== item.id
//   );
//   emit("update:modelValue", uploaderItem.value);
//   if (uploaderItem.value.length > 0) {
//     selectedImage.value = uploaderItem.value[0].src; // Update the selected image if there are remaining files
//   } else {
//     selectedImage.value = Avatar2; // Reset to default image if no files are left
//   }
// };

const removeSelectedImage = () => {
  const itemToRemove = uploaderItem.value.find(
    (file) => file.src === selectedImage.value
  );
  if (itemToRemove) {
    onRemove(itemToRemove);
  }
};

const onRemove = (item: ImageUploaderType) => {
  // Remove the image from the list
  uploaderItem.value = uploaderItem.value.filter(
    (uploaded: ImageUploaderType) => uploaded.id !== item.id
  );

  // Emit the updated list immediately
  emit("update:modelValue", uploaderItem.value);

  // Update the selected image or reset it if no images are left
  if (uploaderItem.value.length > 0) {
    selectedImage.value = uploaderItem.value[0].src;
  } else {
    selectedImage.value = Avatar2; // Reset to default image if no files are left
  }
};

const toggleFileInput = () => {
  showFileInput.value = true;
};
</script>
<style>
.avatar-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.file-uploader {
  margin-top: 10px; /* Adjust margin as needed */
}
</style>
<template>
  <div>
    <template v-if="prop.templateType === 'default'">
      <div class="position-relative">
        <div class="avatar-container d-flex justify-center align-center mb-5">
          <v-avatar size="200" class="border pa-1" style="position: relative">
            <v-img :src="selectedImage" class="rounded-circle" />
          </v-avatar>
          <i
            class="ph-trash me-1"
            style="
              background-color: white;
              position: absolute;
              left: 68%;
              top: 125px;
              padding: 4px;
              color: red;
              border-radius: 50%;
              cursor: pointer;
              box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);
            "
            @click="removeSelectedImage"
          ></i>
          <i
            class="ph-pencil me-1"
            style="
              position: absolute;
              top: 150px;
              left: 65%;
              background-color: white;
              border-radius: 50%;
              padding: 4px;
              cursor: pointer;
              box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);
            "
            @click="toggleFileInput"
          ></i>
        </div>
        <v-alert
          v-if="errorMsg"
          color="danger"
          variant="tonal"
          density="compact"
        >
          {{ errorMsg }}
        </v-alert>
        <v-file-input
          v-if="showFileInput"
          v-model="files"
          :multiple="multiple"
          variant="plain"
          :clearable="false"
          prepend-icon=""
          class="file-uploader mt-5"
          :accept="'.png, .jpeg'"
        />
        <div
          class="file-uploader-content mt-5"
          style="top: 30%"
          v-if="showFileInput"
        >
          <div class="text-center">
            <i class="ph-cloud-arrow-down ph-4x" />
          </div>
          <div class="text-subtitle-1 font-weight-bold text-center">
            {{ text }}
          </div>
        </div>
      </div>
      <div>
        <v-card
          v-for="(file, index) in uploaderItem"
          :key="'temp-img-' + index"
          class="imgUploader border mb-3"
          elevation="0"
        >
          <v-card-text class="d-flex align-center justify-space-between">
            <div class="d-flex">
              <v-avatar
                rounded="lg"
                size="large"
                class="pa-2 mx-2"
                color="light"
              >
                <v-img
                  :src="file.src || ''"
                  @click="selectedImage = file.src || Avatar2"
                />
              </v-avatar>
              <div class="d-flex flex-column">
                <span class="font-weight-bold my-auto">
                  {{ file.name }}
                </span>
                <span v-if="file.size"
                  >{{ Math.ceil(Number(file.size) / 1024) }} kb
                </span>
              </div>
            </div>
            <v-btn size="x-small" color="danger" @click="onRemove(file)">
              Delete
            </v-btn>
          </v-card-text>
        </v-card>
      </div>
    </template>
    <template v-else>
      <div class="position-relative">
        <v-file-input
          v-model="files"
          :multiple="multiple"
          variant="plain"
          :clearable="false"
          prepend-icon=""
          class="file-uploader"
          :accept="'.png, .jpeg'"
        />
        <div class="file-uploader-content">
          <div class="text-center">
            <i class="ph-cloud-arrow-down ph-4x" />
          </div>
          <div class="text-subtitle-1 font-weight-bold text-center">
            {{ text }}
          </div>
        </div>
      </div>
      <div>
        <v-card
          v-for="(file, index) in uploaderItem"
          :key="'temp-img-' + index"
          class="border mb-3"
          elevation="0"
        >
          <v-card-text class="d-flex align-center justify-space-between">
            <div class="d-flex">
              <v-avatar
                rounded="lg"
                size="large"
                class="pa-2 mx-2"
                color="light"
              >
                <v-img :src="file.src" />
              </v-avatar>
              <div class="d-flex flex-column">
                <span class="font-weight-bold my-auto">
                  {{ file.name }}
                </span>
                <span v-if="file.size"
                  >{{ Math.ceil(Number(file.size) / 1024) }} kb
                </span>
              </div>
            </div>
            <v-btn size="x-small" color="danger" @click="onRemove(file)">
              Delete
            </v-btn>
          </v-card-text>
        </v-card>
      </div>
    </template>
  </div>
</template>
