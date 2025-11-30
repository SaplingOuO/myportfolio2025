<template>
    <div class="container">
        <div class="text" ref="introText">
            <p ref="useCharacters" style="visibility: hidden;">嗨，我是 Sapling<span class="animated-emoji">👋</span>
            一名熱衷於前端技術實現的工程師。</p>
            <p ref="useWords" style="visibility: hidden;">我具備主動摸索與研究的精神，擅長透過自我學習快速掌握新工具。</p>
            <p ref="useLines" style="visibility: hidden;">我已掌握核心框架Vue、響應式設計工具Bootstrap5，並能結合GSAP實現高性能的網頁動態與流暢互動。</p>
        </div>
    </div>
</template>

<script>
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

export default {
    data() {
        return {
            // 只需要一個 SplitText 實例來處理所有文字的分割
            // 這裡使用陣列來儲存多個 SplitText 實例
            splits: [], 
            animation: null,
        };
    },

    mounted() {
        // 1. 初始化 SplitText 並儲存實例
        this.setupSplits();
        
        // 2. 執行一次性的進場動畫
        this.runEntranceAnimation();
        
        // 3. 啟動 Emoji 動畫
        this.emojiAnimete();
        
        // 移除 window.addEventListener("resize", this.setup);
        // 如果文字動畫只執行一次，通常不需要在 resize 時重跑 setup。
        // 但如果希望 SplitText 能適應螢幕變化，可以保留。
    },

    beforeUnmount() {
        // 清除所有 SplitText 實例的還原
        this.splits.forEach(s => s.revert());
        this.animation && this.animation.revert();
        gsap.killTweensOf(".animated-emoji");
        // 移除 window.removeEventListener("resize", this.setup);
    },

    methods: {
        // 【修正 1】將 setup 專門用於創建 SplitText 實例
        setupSplits() {
            // 清除舊的分割實例
            this.splits.forEach(s => s.revert());
            this.splits = [];

            // 針對三個段落分別創建 SplitText 實例
            this.splits.push(
                SplitText.create(this.$refs.useCharacters, { type: "chars,words" }),
                SplitText.create(this.$refs.useWords, { type: "words" }),
                SplitText.create(this.$refs.useLines, { type: "lines" })
            );
        },

        // 【新增】執行一次性的進場動畫
        runEntranceAnimation() {
            // 使用 Timeline 來編排多個段落的順序進場
            const tl = gsap.timeline({
                // 當動畫開始時，將父容器的 visibility 設為可見
                onStart: () => {
                    // 讓所有 <p> 元素可見
                    this.$refs.useCharacters.style.visibility = 'visible';
                    this.$refs.useWords.style.visibility = 'visible';
                    this.$refs.useLines.style.visibility = 'visible';
                }
            });

            // 獲取所有分割後的字元、單詞和行
            const charElements = this.splits[0].chars; // 第一段的字元
            const wordElements = this.splits[1].words; // 第二段的單詞
            const lineElements = this.splits[2].lines; // 第三段的行

            // 1. 第一段 (字元進場)
            tl.from(charElements, {
                x: 150,
                opacity: 0,
                duration: 0.7,
                ease: "power4.out",
                stagger: 0.02 // 字元間隔
            }, 0) // 從時間 0 開始

            // 2. 第二段 (單詞進場，接著第一段)
            .from(wordElements, {
                y: -50,
                opacity: 0,
                duration: 0.6,
                ease: "back.out(1.7)",
                stagger: 0.08
            }, ">-0.4") // 在上一個動畫結束前 0.4s 開始

            // 3. 第三段 (行進場，接著第二段)
            .from(lineElements, {
                rotationX: -90,
                transformOrigin: "50% 50% -50px",
                opacity: 0,
                duration: 0.9,
                ease: "power3.out",
                stagger: 0.2
            }, ">-0.3"); // 在上一個動畫結束前 0.3s 開始

            // 將這個主動畫實例儲存起來，以便在銷毀時還原
            this.animation = tl;
        },

        emojiAnimete() {
            gsap.to(".animated-emoji", {
                duration: 1,
                y: -10,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut",
                rotation: 30,
                scale: 1.2,
                transformOrigin: "70% 70%"
            });
        }
        
        // 移除 animateChars, animateWords, animateLines 方法
    }
};
</script>

<style>
/* ... CSS 樣式 ... */

.container {
    /* 這裡的 align-items: left; 並不是標準 CSS 屬性，
       如果你想讓容器內的 flex 項目靠左，應該使用 align-items: flex-start;
       但因為 .text 寬度是 100%，影響不大。 */
    position: relative;
    width: 90vw;
    display: flex;
    flex-direction: column;
    align-items: flex-start; /* 修正為標準屬性 */
    justify-content: space-evenly;
    border-radius: 9px;
    overflow: hidden;
}

.text {
    color: #dfdcff;
    /* 這裡的 clamp(2rem, 6rem, 2vw) 有邏輯問題，請參照之前的建議修正 */
    font-size: clamp(2rem, 3vw, 5rem); /* 建議改為此，確保 5vw 介於最小值和最大值之間 */
    line-height: 1.1; /* 增加行高，提升閱讀性 */
    box-sizing: border-box;
    width: 100%;
    text-align: left;
    perspective: 300px;
    padding: 20px 0; /* 增加上下間距 */
}

/* 確保 <p> 標籤能正確佈局 */
.text p {
    margin-bottom: 1em; /* 段落間距 */
}

.animated-emoji {
    font-size: 3rem;
    display: inline-block;
    cursor: pointer;
    /* 為了在 SpltiText 之後文字不閃爍，請確保初始文字是隱藏的，如 template 所示 */
}
</style>