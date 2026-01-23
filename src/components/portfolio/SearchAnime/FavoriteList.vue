<template>
  <div class="fav-container p-3 text-white bg-dark border-start border-secondary h-100 shadow">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="m-0"><i class="bi bi-heart-fill text-danger"></i> 我的收藏</h4>
      <button class="btn btn-sm btn-outline-light" @click="$emit('close')">關閉</button>
    </div>

    <div v-if="favAnimes.length === 0" class="text-center mt-5 text-secondary">
      目前沒有收藏喔！
    </div>

    <div class="fav-list overflow-auto" style="max-height: 80vh;">
      <div v-for="anime in favAnimes" :key="anime.id" 
           class="fav-item d-flex align-items-center p-2 mb-2 border border-secondary rounded"
           @click="handleSelect(anime)" style="cursor: pointer;">
        <img :src="anime.coverImage.medium || anime.coverImage" class="rounded me-3" style="width: 50px; height: 70px; object-fit: cover;">
        <div class="flex-grow-1 overflow-hidden">
          <div class="text-truncate small fw-bold">{{ anime.title.english || anime.title.romaji || anime.title }}</div>
          <div class="text-info small">Score: {{ anime.averageScore }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { db, auth } from './composables/firebase';
import { collection, getDocs, query, orderBy } from "firebase/firestore";

const favAnimes = ref([]);
const emit = defineEmits(['close', 'select-anime']);

// 抓取 Firestore 資料
const fetchFavorites = async () => {
  if (!auth.currentUser) return;
  
  try {
    const q = query(
      collection(db, "users", auth.currentUser.uid, "favorites"),
      orderBy("addedAt", "desc") // 按加入時間排序
    );
    
    const querySnapshot = await getDocs(q);
    const list = [];
    querySnapshot.forEach((doc) => {
      list.push(doc.data());
    });
    favAnimes.value = list;
  } catch (error) {
    console.error("抓取收藏失敗:", error);
  }
};

const handleSelect = (anime) => {
  emit('select-anime', anime); // 把選中的動漫傳回給首頁
};

onMounted(fetchFavorites);
</script>

<style scoped>
.fav-container {
  width: 300px;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1050;
    overflow-y: auto;
}
.fav-item:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>