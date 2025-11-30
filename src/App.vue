<template>
    <div class="mine">
        <div ref="container" class="game-container"></div>

        <Transition name="fade">
            <div v-if="isMenuVisible" class="xmb-container" :style="menuStyle" @click.stop>

                <div v-if="isEnter" class="bar">
                    <div class="xmb-primary-bar">
                        <div v-for="(category, key) in menuData" :key="key" class="primary-item"
                            :class="{ 'is-primary-selected': key === currentCategory }" @click="currentCategory = key">
                            {{ category.label }}
                        </div>
                    </div>

                    <div class="xmb-secondary-bar">
                        <div v-for="(item, index) in menuData[currentCategory].items" :key="index"
                            class="secondary-item" :class="{ 'is-selected': index === currentMenuItem }"
                            @click="currentMenuItem = index; handleMenuItemClick(item)">
                            {{ item.label }}
                        </div>
                    </div>
                </div>

                <button v-if="!isEnter" @click="isEnter = true" class="xmb-close-button">
                    <img src="/img/close-md-svgrepo-com.svg" alt="關閉選單" class="close-icon" />
                </button>

                <div v-if="!isEnter" class="app-page">
                    <component :is="currentComponent" />
                </div>
            </div>
        </Transition>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, provide } from "vue";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

import { useHomeSetting } from './stores/homeSetting';

import WarnPage from "./components/WarnPage.vue";

import MyIntroduce from "./components/information/MyIntroduce.vue";
import MyContact from "./components/information/MyContact.vue";

import AnimeRecord from "./components/portfolio/AnimeRecord.vue";

import BackGround from "./components/setting/BackGround.vue";

// ===============================================
// 1. THREE.JS 核心變數
// ===============================================
const container = ref(null); // 綁定 3D 畫布的 DOM 參考
let scene, camera, renderer;
let animationId;
let pspMesh = null;

// ===============================================
// 2. 互動與動畫狀態控制
// ===============================================
let isAnimating = ref(true);    // 是否持續旋轉 (初始狀態)
let isTurning = ref(false);     // 是否正在執行平滑的旋轉/縮放動畫
const targetRotation = 0;       // 模型轉正時的目標 Y 軸角度
const LERP_FACTOR = 0.05;       // 線性插值因子 (Lerp)，控制轉向速度
const MIN_SCALE = 1;            // 模型預設/最小縮放值
const MAX_SCALE = 1.5;          // 選單顯示時的放大目標縮放值
let targetScale = MIN_SCALE;    // 當前的目標縮放值

// ===============================================
// 3. XMB 選單數據與狀態
// ===============================================
const isEnter = ref(true);                        // 當前選單是否隱藏
const currentMenuItem = ref(0);         // 當前選中的垂直子項目索引
const currentCategory = ref('about');    // 當前選中的水平主項目鍵名 
const pageComponents = {
    WarnPage,
    MyIntroduce,
    MyContact,
    BackGround,
    AnimeRecord,
};
const currentComponent = computed(() => {
    // 獲取當前選中的項目
    const selectedItem = menuData[currentCategory.value].items[currentMenuItem.value];
    const pageName = selectedItem?.pageName;

    // 如果 pageName 存在，則返回對應的組件對象，否則返回 null (或一個預設組件)
    if (pageName && pageComponents[pageName]) {
        return pageComponents[pageName];
    }
    return null; // 或者您設定一個錯誤/空白頁面組件
});


const menuData = {
    'about': {
        label: '關於我',
        items: [
            { label: '自我介紹', pageName: 'MyIntroduce', action: 'show_about' },
            { label: '聯繫方式', pageName: 'MyContact', action: 'show_contact' }
        ]
    },
    'portfolio': {
        label: '作品集',
        items: [
            { label: '動漫搜尋', pageName: 'AnimeRecord', action: 'show_web' },
        ]
    },
    'game': {
        label: '遊戲',
        items: [
            { label: '建設中', pageName: 'WarnPage', action: 'start_game' },
        ]
    },
    'setting': {
        label: '設定',
        items: [
            { label: '背景', pageName: 'BackGround', action: 'show_background' },
        ]
    }
};

const primaryKeys = computed(() => Object.keys(menuData));

// 計算屬性：控制選單的顯示/隱藏
const isMenuVisible = computed(() => {
    // 條件：轉向/縮放結束 AND 停止持續旋轉 AND 達到放大狀態
    return !isTurning.value && !isAnimating.value && targetScale === MAX_SCALE;
});

const HomeSetting = useHomeSetting(); // 👈 初始化 Store 實例
// 計算屬性：設定 XMB 容器的尺寸 (模擬 PSP 螢幕比例)
const menuStyle = computed(() => {
    const targetWidth = 740;
    const targetHeight = targetWidth / 16 * 9;

    return {
        width: `${targetWidth}px`,
        height: `${targetHeight}px`,
        ...HomeSetting.backgroundGradientStyle // 👈 應用 Store 中的背景樣式
    };
});


// ===============================================
// 4. 輔助與事件處理函式
// ===============================================

/**
 * 載入單個 GLTF/GLB 模型。
 * @param {string} path - 模型檔案的路徑。
 * @returns {Promise<THREE.Object3D>} - 模型場景物件。
 */
function loadSingleModel(path) {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
        loader.load(
            path,
            (gltf) => { resolve(gltf.scene); },
            undefined,
            (error) => {
                console.error(`載入模型失敗: ${path}`, error);
                reject(error);
            }
        );
    });
}

/**
 * 處理垂直子選單的點擊事件 (模擬選中後的動作)。
 * @param {object} item - 被選中的選單項目數據。
 */
function handleMenuItemClick(item) {
    if (item.pageName) {
        // 如果該項目定義了 pageName，則進入應用程式
        isEnter.value = false;
        console.log(`執行動作: ${item.label} (${item.action})`);
    } else {
        // 執行其他沒有跳頁的動作 (例如 'exit' 或 'show_options')
        console.log(`執行動作: ${item.label} (${item.action})`);
    }
}
/**
 * 處理 3D 容器的點擊事件：切換模型的旋轉/選單狀態。
 */
function handleClick() {
    if (!pspMesh) return;

    if (isAnimating.value) {
        // 狀態 1: 從持續旋轉 -> 轉正、放大、顯示選單
        isAnimating.value = false;
        isTurning.value = true;
        targetScale = MAX_SCALE;
        // 將當前旋轉角度規範化到 0 ~ 2π 之間
        pspMesh.rotation.y = pspMesh.rotation.y % (Math.PI * 2);

    } else if (!isTurning.value) {
        // 狀態 2: 從選單顯示狀態 -> 恢復旋轉
        targetScale = MIN_SCALE;
        isTurning.value = true; // 啟動縮小/轉向邏輯
    }
}

/**
 * 處理鍵盤事件：控制 XMB 選單的水平和垂直導航。
 * @param {KeyboardEvent} event 
 */
function handleKeyDown(event) {
    if (!isMenuVisible.value) return;

    const currentItems = menuData[currentCategory.value].items;
    const currentPrimaryIndex = primaryKeys.value.indexOf(currentCategory.value);

    // 垂直導航 (上/下) - 操控子選單
    if (event.key === 'ArrowUp') {
        currentMenuItem.value = (currentMenuItem.value - 1 + currentItems.length) % currentItems.length;
    } else if (event.key === 'ArrowDown') {
        currentMenuItem.value = (currentMenuItem.value + 1) % currentItems.length;

        // 水平導航 (左/右) - 操控主選單
    } else if (event.key === 'ArrowLeft') {
        const newIndex = (currentPrimaryIndex - 1 + primaryKeys.value.length) % primaryKeys.value.length;
        currentCategory.value = primaryKeys.value[newIndex];
        currentMenuItem.value = 0; // 切換主項目後，子項目重設為第一個
    } else if (event.key === 'ArrowRight') {
        const newIndex = (currentPrimaryIndex + 1) % primaryKeys.value.length;
        currentCategory.value = primaryKeys.value[newIndex];
        currentMenuItem.value = 0; // 切換主項目後，子項目重設為第一個

        // 確認 (Enter) - 執行選中項目的動作
    } else if (event.key === 'Enter') {
        const currentItems = menuData[currentCategory.value].items;
        const selectedItem = currentItems[currentMenuItem.value];

        // **核心邏輯：直接套用選中的 pageName**
        if (selectedItem.pageName) {
            isEnter.value = false; // 進入應用程式頁面
        } else {
            // 執行沒有跳頁的動作 (例如：Exit, Settings 留在 XMB 內)
            handleMenuItemClick(selectedItem);
        }
    }
}

// ===============================================
// 5. THREE.JS 場景生命週期
// ===============================================

/**
 * 初始化 Three.js 場景、相機、渲染器、環境與模型。
 */
async function initScene() {
    // 1. 場景、相機、渲染器初始化
    scene = new THREE.Scene();
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    camera.position.set(0, 0, 20);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (container.value) {
        container.value.appendChild(renderer.domElement);
    } else {
        console.error("Renderer 容器未找到！");
        return;
    }

    // 2. 環境、霧與背景設置
    const fogColor = 0xd1cfd0;
    scene.fog = new THREE.Fog(fogColor, 10, 200);
    scene.background = new THREE.Color(fogColor);

    // 3. 環境貼圖載入與光源設置
    try {
        await new Promise((resolve, reject) => {
            new EXRLoader().setPath('./textures/').load('puresky.exr', function (texture) {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                scene.environment = texture;

                // 主要光源
                const mainLight = new THREE.DirectionalLight(0xeeeeff, 0.2);
                mainLight.position.set(20, 30, 20);
                scene.add(mainLight);

                // 半球環境光
                const hemisphereLight = new THREE.HemisphereLight(0x1a1a5a, 0xaa5500, 0.5);
                scene.add(hemisphereLight);
                resolve();
            }, undefined, (error) => {
                // 貼圖載入失敗處理 (防止程式中斷，並使用基礎光源替代)
                console.error("載入 EXR 貼圖失敗，使用基礎光源替代。", error);
                scene.add(new THREE.AmbientLight(0x404040, 3));
                scene.add(new THREE.DirectionalLight(0xffffff, 1).position.set(0, 5, 5));
                reject(error); // 拒絕 Promise 以繼續執行後續代碼
            });
        });
    } catch (e) {
        // 捕捉 Promise 拒絕，不阻礙模型載入
    }

    // 4. 載入 3D 模型
    const modelPaths = { psp: './models/psp.glb' };

    try {
        const [pspScene] = await Promise.all([loadSingleModel(modelPaths.psp)]);

        pspMesh = pspScene;
        pspMesh.position.y = -0.33;
        pspMesh.scale.set(MIN_SCALE, MIN_SCALE, MIN_SCALE);
        scene.add(pspMesh);
        console.log("PSP 模型載入完成！");

    } catch (error) {
        console.error("模型載入失敗，請檢查路徑和檔案。", error);
    }

    window.addEventListener("resize", onResize);
}

/**
 * 動畫循環：處理旋轉、轉向與縮放的平滑過渡。
 */
function animate() {
    animationId = requestAnimationFrame(animate);

    if (pspMesh) {
        if (isAnimating.value && !isTurning.value) {
            // 狀態 1: 模型持續緩慢旋轉
            pspMesh.rotation.y += 0.005;
        } else if (isTurning.value) {
            // 狀態 2: 執行平滑轉向 (Lerp) 和縮放

            // 旋轉插值
            pspMesh.rotation.y = THREE.MathUtils.lerp(pspMesh.rotation.y, targetRotation, LERP_FACTOR);
            // 縮放插值
            pspMesh.scale.x = THREE.MathUtils.lerp(pspMesh.scale.x, targetScale, LERP_FACTOR);
            pspMesh.scale.y = THREE.MathUtils.lerp(pspMesh.scale.y, targetScale, LERP_FACTOR);
            pspMesh.scale.z = THREE.MathUtils.lerp(pspMesh.scale.z, targetScale, LERP_FACTOR);

            // 檢查是否接近目標值 (結束過渡動畫)
            const rotationReached = Math.abs(pspMesh.rotation.y - targetRotation) < 0.005;
            const scaleReached = Math.abs(pspMesh.scale.x - targetScale) < 0.005;

            if (rotationReached && scaleReached) {
                // 鎖定精確值並結束轉向狀態
                pspMesh.rotation.y = targetRotation;
                pspMesh.scale.set(targetScale, targetScale, targetScale);
                isTurning.value = false;

                // 如果是縮小完成，則恢復持續旋轉
                if (targetScale === MIN_SCALE) {
                    isAnimating.value = true;
                }
            }
        }
    }
    renderer.render(scene, camera);
}

/**
 * 處理視窗大小改變：更新相機和渲染器尺寸。
 */
function onResize() {
    const aspect = window.innerWidth / window.innerHeight;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// ===============================================
// 6. VUE 生命週期鉤子
// ===============================================

onMounted(() => {
    initScene();
    animate();

    // 設置事件監聽器
    window.addEventListener("resize", onResize);
    if (container.value) {
        container.value.addEventListener("click", handleClick);
    }
    window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
    // 清理資源和事件監聽器，防止記憶體洩漏
    cancelAnimationFrame(animationId);
    if (renderer) {
        renderer.dispose();
    }
    window.removeEventListener("resize", onResize);
    if (container.value) {
        container.value.removeEventListener("click", handleClick);
    }
    window.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped>
/* =============================================== */
/* 1. 基礎佈局 */
/* =============================================== */
.mine {
    position: relative;
    width: 100vw;
    height: 100vh;
}

.game-container {
    position: absolute;
    width: 100%;
    height: 100%;
}

/* =============================================== */
/* 2. XMB 主容器樣式 (Cross Media Bar) */
/* =============================================== */
.xmb-container {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    overflow: auto;
    font-family: 'Roboto', 'Arial', sans-serif;
    border-radius: 5px;
    pointer-events: auto;
}

/* =============================================== */
/* 3. A. 水平主選單 (PRIMARY BAR) */
/* =============================================== */
.xmb-primary-bar {
    position: absolute; 
    top: 0;             
    height: 15%;
    /* 佔據容器上部空間 */
    width: 100%;
    display: flex;
    justify-content: center;
    /* 主項目水平置中 */
    align-items: flex-end;
    /* 主項目垂直靠下對齊 */
    padding-bottom: 5px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.primary-item {
    font-size: 1.2em;
    font-weight: 300;
    padding: 0 15px;
    cursor: pointer;
    opacity: 0.5;
    /* 未選中時半透明 */
    transition: all 0.3s ease-out;
}

.is-primary-selected {
    color: #ffffff;
    font-weight: 700;
    opacity: 1;
    /* 選中動畫：輕微放大和發光 */
    transform: scale(1.15);
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
}

/* =============================================== */
/* 4. B. 垂直子選單 (SECONDARY BAR) */
/* =============================================== */
.xmb-secondary-bar {
    position: absolute; 
    top: 15%;           
    height: 75%;  /* 佔據容器下部空間 */
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 20px 40px;
}

.secondary-item {
    font-size: 1.8em;
    font-weight: 300;
    padding: 8px 0;
    width: 100%;
    text-align: left;
    line-height: 1.2;
    cursor: default;
    transition: all 0.2s ease-out;
    opacity: 0.6;
    /* 未選中時半透明 */
}

.is-selected {
    color: #ffffff;
    font-weight: 700;
    opacity: 1;
    /* 標誌性選中效果：右移 (XMB 風格) 並放大發光 */
    transform: translateX(10px) scale(1.05);
    text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
}

.xmb-close-button {
    position: absolute; /* 🚀 絕對定位 */
    top: 10px;          /* 距離頂部 */
    right: 10px;        /* 距離右側 */
    z-index: 20;        /* 確保它在最上層 */
    
    /* 基本樣式 */
    background: none;
    border: none;
    cursor: pointer;
    padding: 10px;
    opacity: 0.7;
    transition: opacity 0.2s;
}

.xmb-close-button:hover {
    opacity: 1;
    transform: scale(1.1);
}

.close-icon {
    display: block;
    width: 30px; 
    height: 30px;
    filter: invert(100%),drop-shadow(1px 1px 1px black);
}

/* =============================================== */
/* 5. Vue 過渡動畫 (淡入/直接退出) */
/* =============================================== */
.fade-enter-active {
    transition: opacity 0.5s ease;
    /* 進入時：0.5 秒平滑淡入 */
}

.fade-leave-active {
    transition: opacity 0.01s ease;
    /* 離開時：瞬間退出 (0.01s) */
    /* 🚀 修正: 在選單退出時，禁用點擊事件，允許點擊穿透到 3D 容器 */
    pointer-events: none;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    /* 起始/結束狀態為完全透明 */
}
</style>