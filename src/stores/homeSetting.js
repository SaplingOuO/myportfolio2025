import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useHomeSetting = defineStore('theme', () => {
    // 儲存 BackGround.vue 中計算出來的四個 RGB 顏色數組
    const colorArray = ref([
        [238, 119, 82],
        [231, 60, 126],
        [5, 166, 213],
        [35, 213, 103]
    ]);

    // 計算屬性：將 RGB 數組轉換為 CSS 的 linear-gradient 樣式字串
    const backgroundGradientStyle = computed(() => {
        const rgbToCss = (arr) => `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`;
        
        return {
            background: `linear-gradient(270deg, ${rgbToCss(colorArray.value[3])}, ${rgbToCss(colorArray.value[2])}, ${rgbToCss(colorArray.value[1])}, ${rgbToCss(colorArray.value[0])})`,
            'background-size': '1000% 1000%',
            animation: 'gradient 15s ease infinite',
        };
    });

    // Action：用於更新顏色數組
    function updateColorArray(newArray) {
        colorArray.value = newArray;
        // 【持久化儲存】: 如果要儲存，這裡可以調用 localStorage
        localStorage.setItem('themeColors', JSON.stringify(newArray));
    }
    
    // 初始化：從 localStorage 載入儲存的顏色
    const storedColors = localStorage.getItem('themeColors');
    if (storedColors) {
        colorArray.value = JSON.parse(storedColors);
    }


    return { colorArray, backgroundGradientStyle, updateColorArray };
})