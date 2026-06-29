<template>
    <div class="main-layout bg-dark bg-gradient text-light">
        <LoginModal v-if="!isLoggedIn" class="overlay-center" />

        <header v-if="isLoggedIn" class="user-controls p-2 d-flex gap-2">
            <button @click="handleLogout" class="btn btn-sm btn-outline-danger">
                登出 ({{ currentUser?.email }})
            </button>
            <button @click="showFavList = !showFavList" class="btn btn-sm btn-info text-white">
                <i class="bi bi-star-fill"></i> 我的收藏
            </button>
        </header>

        <FavoriteList 
            v-if="isLoggedIn && showFavList" 
            @close="showFavList = false" 
            @select-anime="onSelectFromFav" 
        />

        <div class="search-section" :class="{ 'is-active': isActive }">
            <SearchBar 
                ref="searchBarRef" 
                @content-change="handleAnimation"
                @search-submit="handleSearchSubmit" 
            />
            <div v-if="animeResults.length > 0" 
                 class="spinner-grow spinner-grow text-light mt-2" 
                 @click="resetSearch">
            </div>
        </div>

        <main class="content-area">
            <div v-if="isLoading" class="spinner-border text-light overlay-center"></div>
            <AnimeDetail 
                ref="animeDetailRef" 
                v-if="animeResults.length > 0" 
                :results="animeResults" 
            />
        </main>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import gsap from 'gsap';
import { useAuth } from './composables/useAuth';
import { fetchAnime } from './composables/aniList.js';

// Components
import LoginModal from './LoginModal.vue';
import SearchBar from './SearchBar.vue';
import AnimeDetail from './AnimeDetail.vue';
import FavoriteList from './FavoriteList.vue';

// 狀態管理
const { isLoggedIn, currentUser, logout } = useAuth();
const searchBarRef = ref(null);
const animeDetailRef = ref(null);
const animeResults = ref([]);
const isLoading = ref(false);
const showFavList = ref(false);
const isActive = ref(false);

// 登出處理
const handleLogout = async () => {
    try {
        await logout();
        showFavList.value = false;
        resetSearch();
        searchBarRef.value?.clearInput();
        alert("您已安全登出");
    } catch (error) {
        console.error("登出發生錯誤", error);
    }
};

// 搜尋動畫邏輯
const moveSearchContainer = (toTop) => {
    isActive.value = toTop;
    gsap.to(".search-section", { 
        top: toTop ? "-5.5%" : "50%",
        duration: 0.8,
        ease: "power3.inOut"
    });
};

const resetSearch = () => {
    animeResults.value = [];
    moveSearchContainer(false);
};

const handleAnimation = (text) => {
    if (text.length === 0 && isActive.value) resetSearch();
};

const handleSearchSubmit = async (text) => {
    if (!text) return;
    if (!isActive.value) moveSearchContainer(true);

    isLoading.value = true;
    try {
        const results = await fetchAnime(text);
        if (results?.length > 0) {
            animeResults.value = results;
        } else {
            animeResults.value = [];
            searchBarRef.value?.setNotFound();
        }
    } finally {
        isLoading.value = false;
    }
};

const onSelectFromFav = (anime) => {
    animeResults.value = [anime];
    if (!isActive.value) moveSearchContainer(true);
    
    // 使用 nextTick 確保 AnimeDetail 已經渲染
    setTimeout(() => {
        animeDetailRef.value?.loadDetailFromExternal(anime);
    }, 0);
    
    showFavList.value = false;
};
</script>

<style scoped>
.main-layout {
    position: relative;
    height: 416px; /* 建議改為 min-height 或 vh 增加靈活性 */
    overflow: hidden;
}

.overlay-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 200;
}

.user-controls {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 100;
}

.search-section {
    position: absolute;
    width: 100%;
    max-width: 250px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;
    transition: none; /* 由 GSAP 控制 */
    text-align: center;
}

.content-area {
    height: 100%;
}
</style>