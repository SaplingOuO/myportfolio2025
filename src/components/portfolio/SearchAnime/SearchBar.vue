<template>
  <div class="search-box">
    <input 
      v-model="searchText" 
      @input="onInput"
      @keyup.enter="onSearch" 
      type="text" 
      class="form-control" 
      placeholder="輸入動漫名稱並按 Enter"
    />
    
    <div v-if="isNotFound" class="text-light mt-2 no-data-text">
       沒有相關資料
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 接收父組件傳來的狀態
defineProps({
  isNotFound: {
    type: Boolean,
    default: false
  }
});

const searchText = ref('');
const emit = defineEmits(['content-change', 'search-submit']);

const onInput = () => {
  emit('content-change', searchText.value);
};

const onSearch = () => {
  emit('search-submit', searchText.value);
};

const clearInput = () => {
  searchText.value = '';
};

const setNotFound = () => {
  searchText.value = '';
  displayPlaceholder.value = '⚠️沒有相關資料';
};

defineExpose({ clearInput, setNotFound });
</script>

<style scoped>
.form-control {
  text-align: center; 
}
.no-data-text {
  text-align: center;
  font-size: 0.9rem;
  /* 這裡可以依據你的背景調整顏色 */
}
</style>