<template>
    <div class="main row m-0 w-100 overflow-hidden bg-dark bg-gradient">
        <div class="left col-4 d-flex justify-content-center align-items-center">
            <img class="img-thumbnail left-img"
                :src="selectedAnime ? selectedAnime.coverImage.large : results[0]?.coverImage.large" />
        </div>

        <div v-if="!isDetailVisible" class="right col-8" ref="scrollerRef">
            <div v-for="anime in results" :key="anime.id" class="menu-item d-flex w-100"
                @click="selectItem(anime)">
                <div class="col-3">
                    <img class="img w-100 h-100" :src="anime.coverImage.medium" />
                </div>
                <div class="col-9 bg-secondary bg-gradient d-flex px-3 align-items-center">
                    <div class="w-100">
                        <p class="m-0 text-center h6 text-white text-truncate">
                            {{ anime.title.english || anime.title.romaji }}
                        </p>
                        <p class="m-0 text-end fst-italic text-light small">
                            Score: {{ anime.averageScore }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="detail-panel col-8 text-white p-4 h-100 overflow-auto">
            <button class="btn btn-outline-light btn-sm" @click="backToList">
                <i>返回選單</i> 
            </button>

            <button class="btn btn-outline-ligh"  @click="toggleFavorite" >
                <i :class="['bi', isFavorited ? 'bi-heart-fill text-danger' : 'bi-heart text-white']"
                    ></i>
            </button>

            <div class="content-fade-in">
                <h2 class="mb-3">{{ selectedAnime.title.native || selectedAnime.title.english }}</h2>
                <div class="mb-3">
                    <span class="badge bg-info me-2" v-for="genre in selectedAnime.genres" :key="genre">
                        {{ genre }}
                    </span>
                </div>
                <div class="row mb-3">
                    <div class="col-6"><strong>Year:</strong> {{ selectedAnime.seasonYear }}</div>
                    <div class="col-6"><strong>Score:</strong> {{ selectedAnime.averageScore }}</div>
                </div>
                <hr>
                <div class="description-box small" v-html="selectedAnime.description"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUpdated, ref, nextTick, watch } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { auth, db } from './composables/firebase'; 
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";

gsap.registerPlugin(ScrollTrigger)

const props = defineProps({
    results: { type: Array, default: () => [] }
});

const scrollerRef = ref(null);
const selectedAnime = ref(null);
const isDetailVisible = ref(false); // 控制顯示選單還是詳細資訊
const isFavorited = ref(false); // --- 2. 追蹤收藏狀態 ---

// --- 3. 檢查目前動漫是否已收藏的函式 ---
const checkFavoriteStatus = async () => {
    if (!auth.currentUser || !selectedAnime.value) {
        isFavorited.value = false;
        return;
    }
    try {
        const favRef = doc(db, "users", auth.currentUser.uid, "favorites", selectedAnime.value.id.toString());
        const docSnap = await getDoc(favRef);
        isFavorited.value = docSnap.exists(); // 如果文件存在，代表已收藏
    } catch (error) {
        console.error("檢查收藏狀態出錯:", error);
    }
};

// 點擊項目：紀錄資料並切換顯示
const selectItem = (anime) => {
    selectedAnime.value = anime;
    isDetailVisible.value = true;
    
    // 進入詳情時立刻檢查收藏狀態
    checkFavoriteStatus();

    nextTick(() => {
        gsap.from(".detail-panel", {
            opacity: 0,
            x: 50,
            duration: 0.4,
            ease: "power2.out"
        });
    });
};

const loadDetailFromExternal = (anime) => {
    // 先關閉目前的詳情，回到列表狀態 (或純粹為了觸發動畫重啟)
    isDetailVisible.value = false;
    
    // 確保 DOM 更新後再執行更新資料與動畫
    nextTick(() => {
        selectedAnime.value = anime;
        isDetailVisible.value = true; // 重新開啟
        
        // 觸發進場動畫
        gsap.from(".detail-panel", {
            opacity: 0,
            x: 50,
            duration: 0.4,
            ease: "power2.out"
        });
        
        // 檢查收藏狀態
        checkFavoriteStatus();
    });
};

// --- 4. 點擊愛心切換收藏狀態 ---
const toggleFavorite = async () => {
    if (!auth.currentUser) {
        alert("請先登入才能使用收藏功能！");
        return;
    }

    const anime = selectedAnime.value;
    const userUid = auth.currentUser.uid;
    // 定義 Firestore 中的路徑
    const favRef = doc(db, "users", userUid, "favorites", anime.id.toString());

    try {
        if (isFavorited.value) {
            // 如果已經是收藏狀態 -> 刪除
            await deleteDoc(favRef);
            isFavorited.value = false;
            console.log("已取消收藏");
        } else {
            // 如果不是收藏狀態 -> 寫入資料
            await setDoc(favRef, {
                id: anime.id,
                title: anime.title,
                coverImage: anime.coverImage,
                averageScore: anime.averageScore,
                genres: anime.genres,
                addedAt: new Date() // 紀錄收藏時間
            });
            isFavorited.value = true;
            console.log("已加入收藏");
        }
    } catch (error) {
        console.error("收藏操作失敗:", error);
        alert("操作失敗，請確認 Firebase 規則設定。");
    }
};

const backToList = () => {
    isDetailVisible.value = false;
    nextTick(() => {
        initGSAP();
    });
};

// GSAP 初始化邏輯 (保持不變)
const initGSAP = () => {
    ScrollTrigger.getAll().forEach(t => t.kill());
    const scroller = scrollerRef.value;
    if (!scroller) return;

    const items = gsap.utils.toArray('.menu-item');
    if (items.length > 0) {
        const containerHeight = scroller.offsetHeight;
        const itemHeight = items[0].offsetHeight;
        const paddingVal = (containerHeight - itemHeight) / 2;

        scroller.style.paddingTop = `${paddingVal}px`;
        scroller.style.paddingBottom = `${paddingVal}px`;

        items.forEach((item) => {
            gsap.timeline({
                scrollTrigger: {
                    trigger: item,
                    scroller: ".right",
                    start: "top 90%",
                    end: "bottom 10%",
                    scrub: 0.5,
                }
            }).fromTo(item,
                { scale: 0.8, opacity: 0.5 },
                { scale: 1, opacity: 1, duration: 0.1 }
            ).to(item,
                { scale: 0.8, opacity: 0.5, duration: 0.1 }
            );
        });
        ScrollTrigger.refresh();
    }
};

onMounted(initGSAP);
onUpdated(() => {
    if (!isDetailVisible.value) {
        nextTick(() => initGSAP());
    }
});
defineExpose({
    loadDetailFromExternal
});
</script>

<style scoped>
.main {
    height: 416.25px;
}

.left-img {
    max-height: 85%;
    transition: 0.5s;
}

.img {
    object-fit: cover;
}

.right {
    overflow-y: auto;
    height: 100%;
    scrollbar-width: none;
    scroll-snap-type: y mandatory;
}

.right::-webkit-scrollbar {
    display: none;
}

.menu-item {
    height: 80.25px;
    flex-shrink: 0;
    transform-origin: center right;
    scroll-snap-align: center;
    margin-top: 20px;
    margin-bottom: 20px;
    cursor: pointer;
}

.detail-panel {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
}

.description-box {
    max-height: 180px;
    overflow-y: auto;
    padding-right: 10px;
}

/* 讓內容捲動條好看一點 */
.description-box::-webkit-scrollbar {
    width: 5px;
}

.description-box::-webkit-scrollbar-thumb {
    background: #666;
    border-radius: 10px;
}
</style>