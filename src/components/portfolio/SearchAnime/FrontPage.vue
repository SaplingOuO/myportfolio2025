<template>
    <div v-if="!isLoggedIn" class="position-absolute top-50 start-50 translate-middle" style="z-index: 200;">
        <LoginModal />
    </div>

    <div class="bg bg-dark bg-gradient">
        <div v-if="isLoggedIn" class="position-absolute top-0 start-0 m-2 d-flex gap-2" style="z-index: 100;">
            <button @click="handleLogout" class="btn btn-sm btn-outline-danger">
                登出 ({{ currentUser?.email }})
            </button>
            <button @click="showFavList = !showFavList" class="btn btn-sm btn-info text-white">
                <i class="bi bi-star-fill"></i> 我的收藏
            </button>
        </div>

        <FavoriteList v-if="isLoggedIn && showFavList" @close="showFavList = false" @select-anime="onSelectFromFav" />

        <div class="search-container">
            <SearchBar ref="searchBarRef" class="m-2" @content-change="handleAnimation"
                @search-submit="handleSearchSubmit" />
            <div v-if="animeResults.length > 0" class="spinner-grow text-light mt-2" role="status"
                style="cursor: pointer;" @click="resetSearch">
            </div>
        </div>

        <div v-if="isLoading" class="spinner-border text-light position-absolute top-50 start-50 translate-middle"
            role="status"></div>

        <div>
            <AnimeDetail ref="animeDetailRef" v-if="animeResults.length > 0" :results="animeResults" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'; // 1. 引入 onMounted
import gsap from 'gsap';

// 2. 引入 Firebase 相關功能
import { auth } from './composables/firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";

import LoginModal from './LoginModal.vue';
import SearchBar from './SearchBar.vue';
import AnimeDetail from './AnimeDetail.vue';
import FavoriteList from './FavoriteList.vue';
import { fetchAnime } from './composables/aniList.js';

const searchBarRef = ref(null);
const isLoggedIn = ref(false);
const currentUser = ref(null);
const isActive = ref(false);
const animeResults = ref([]);
const isLoading = ref(false);
const showFavList = ref(false);
const animeDetailRef = ref(null);

// 3. 在掛載時監聽登入狀態
onMounted(() => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // 使用者已登入
            isLoggedIn.value = true;
            currentUser.value = user;
            console.log("登入者：", user.email);
        } else {
            // 使用者未登入
            isLoggedIn.value = false;
            currentUser.value = null;
            console.log("目前未登入");
        }
    });
});

// 登出功能 (可加在 UI 上)
const handleLogout = async () => {
    try {
        await signOut(auth);
        showFavList.value = false;
        resetSearch();

        // 這裡會去呼叫子組件裡面暴露出來的 clearInput
        if (searchBarRef.value) {
            searchBarRef.value.clearInput();
        }

        alert("您已安全登出");
    } catch (error) {
        console.error("登出發生錯誤", error);
    }
};

// 重置搜尋功能的函式
const resetSearch = () => {
    // 1. 清空資料（這會讓 AnimeDetail 消失）
    animeResults.value = [];
    isActive.value = false;

    // 2. 將搜尋框彈回中間
    gsap.to(".search-container", {
        top: "50%",
        duration: 0.8,
        ease: "power3.inOut"
    });
};

const handleAnimation = (text) => {
    // 這裡保留原本輸入框清空時的自動回彈邏輯
    if (text.length === 0 && isActive.value) {
        resetSearch();
    }
};

// 當從收藏清單點擊動漫時
const onSelectFromFav = (anime) => {
    // 1. 將該動漫放入搜尋結果（這樣 AnimeDetail 才會顯示它）
    // 為了符合 AnimeDetail 的 Props 格式，我們把它包成陣列
    animeResults.value = [anime];

    // 2. 讓搜尋框縮小到上方（觸發 GSAP 動畫）
    if (!isActive.value) {
        isActive.value = true;
        gsap.to(".search-container", { top: "-5.5%", duration: 0.8 });
    }
    // 3. 直接叫 AnimeDetail 執行切換詳情的動作
    if (animeDetailRef.value) {
        animeDetailRef.value.loadDetailFromExternal(anime);
    }

    // 4. 關閉收藏側邊欄
    showFavList.value = false;
};

const handleSearchSubmit = async (text) => {
    if (!text) return;

    if (text.length > 0 && !isActive.value) {
        isActive.value = true;
        gsap.to(".search-container", {
            top: "-5.5%",
            duration: 0.8,
            ease: "power3.inOut"
        });
    }
    isLoading.value = true;
    try {
        const results = await fetchAnime(text);

        if (results && results.length > 0) {
            animeResults.value = results;
        } else {
            // --- 關鍵修改處 ---
            animeResults.value = [];
            if (searchBarRef.value) {
                // 直接呼叫子組件的新方法：清空並改字
                searchBarRef.value.setNotFound();
            }
        }
    } catch (error) {
        console.error("搜尋錯誤", error);
                resetSearch();
    } finally {
        isLoading.value = false;
    }
};


</script>

<style scoped>
.bg {
    height: 416.25px;
}

.search-container {
    position: absolute;
    width: 100%;
    max-width: 250px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;
    text-align: center;
    /* 讓 spinner 在搜尋框下面置中 */
}
</style>