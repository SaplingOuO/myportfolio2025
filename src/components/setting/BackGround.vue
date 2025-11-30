<template>
    <div :style="homeSetting.backgroundGradientStyle">
        <div class="position-absolute top-50 start-50 translate-middle">
            <div style="width: 200px;">
                <div class="d-flex justify-content-between">
                    <button v-on:click="showCustomRange(0)" class="btn" style="height: 40px; width: 40px;" v-bind:style="{ 'background-color' : activeColor(0) }"></button>
                    <button v-on:click="showCustomRange(1)" class="btn" style="height: 40px; width: 40px;" v-bind:style="{ 'background-color' : activeColor(1) }"></button>
                    <button v-on:click="showCustomRange(2)" class="btn" style="height: 40px; width: 40px;" v-bind:style="{ 'background-color' : activeColor(2) }"></button>
                    <button v-on:click="showCustomRange(3)" class="btn" style="height: 40px; width: 40px;" v-bind:style="{ 'background-color' : activeColor(3) }"></button>
                </div>
                
                <div :class="{'d-none':customRange}">
                    <div class="R_customRange">
                        <label for="R_customRange" class="form-label m-0 p-2">Red</label>
                        <div class="btn btn-dark disabled float-end">{{ R_rangeValue }}</div>
                        <input v-model="R_rangeValue" type="range" class="form-range" min="0" max="255" id="R_customRange" @input="updateColorArray(currentIndex)">
                    </div>
                    <div class="G_customRange">
                        <label for="G_customRange" class="form-label m-0 p-2">Green</label>
                        <div class="btn btn-dark disabled float-end">{{ G_rangeValue }}</div>
                        <input v-model="G_rangeValue" type="range" class="form-range" min="0" max="255" id="G_customRange" @input="updateColorArray(currentIndex)">
                    </div>
                    <div class="B_customRange">
                        <label for="B_customRange" class="form-label m-0 p-2">Blue</label>
                        <div class="btn btn-dark disabled float-end">{{ B_rangeValue }}</div>
                        <input v-model="B_rangeValue" type="range" class="form-range" min="0" max="255" id="B_customRange" @input="updateColorArray(currentIndex)">
                    </div>
                    <div style="display: flex; justify-content: center;">
                        <button class="btn-close" @click="customRange = true"></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { useHomeSetting } from '../../stores/homeSetting';
// 修正：確保導入 ref (響應式變數的關鍵) 和 computed
import { ref, computed } from 'vue'; 

export default {
    // 這裡使用 Composition API (setup 函式)
    setup() {
        // 1. 取得 Pinia Store 實例
        const homeSetting = useHomeSetting();
        
        // 2. 內部響應式狀態
        const colorCustomArray = computed(() => homeSetting.colorArray);
        
        const R_rangeValue = ref(0);
        const G_rangeValue = ref(0);
        const B_rangeValue = ref(0);
        const currentIndex = ref(0);
        const customRange = ref(true);

        // 3. 函式定義
        
        function showCustomRange(index) {
            // 從 Store 中讀取顏色並初始化滑桿
            R_rangeValue.value = colorCustomArray.value[index][0];
            G_rangeValue.value = colorCustomArray.value[index][1];
            B_rangeValue.value = colorCustomArray.value[index][2];
            currentIndex.value = index;
            customRange.value = false;
        }

        function activeColor(index) {
            // 從 Store 的響應式數據中獲取顏色，用於按鈕背景
            const [R, G, B] = colorCustomArray.value[index];
            return `rgb(${R},${G},${B})`;
        }
        
        function updateColorArray() {
            // 由於您在模板中的 @input 事件上已經傳遞了 currentIndex，我們可以直接使用它
            const index = currentIndex.value; 
            
            // 複製 Pinia 狀態以進行修改（避免直接變動 State）
            const newArray = JSON.parse(JSON.stringify(colorCustomArray.value));
            
            // 更新選中的顏色
            newArray[index] = [
                parseInt(R_rangeValue.value),
                parseInt(G_rangeValue.value),
                parseInt(B_rangeValue.value)
            ];
            
            // 呼叫 Store 的 Action 更新狀態，並觸發 App.vue 的背景更新
            homeSetting.updateColorArray(newArray); 
        }
        
        // 4. 返回所有需要在模板中使用的變數和函式
        return {
            homeSetting, // 👈 必須回傳 homeSetting 才能在模板中使用 :style="homeSetting.backgroundGradientStyle"
            colorCustomArray, 
            R_rangeValue, G_rangeValue, B_rangeValue, 
            currentIndex, customRange, 
            showCustomRange, activeColor, updateColorArray
        }
    }
}
</script>

<style>
/* 保持樣式不變 */
@keyframes gradient {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}
</style>