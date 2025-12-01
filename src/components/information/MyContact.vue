<template>
    <div>
        <div class="card-group">
            <div class="col-2"></div>
            <div class="card col-3">
                <img src="../../../public/img/github-svgrepo-com.svg" @click="gotoGithub">
            </div>
            <div class="col-1"></div>
            <div class="card col-3">
                <img src="../../../public/img/gmail-old-svgrepo-com.svg" @click="showGmailAccount">
            </div>
            <div class="col-2"></div>
        </div>

        <div class="position-fixed bottom-0 end-0 p-3" style="z-index: 11">
            <div id="liveToast" ref="liveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header">
                    <strong class="me-auto">通知</strong>
                    <small>剛剛</small>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    {{ toastMessage }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// 假設您已在環境中正確引入 Bootstrap JS (如果沒有，請使用 window.bootstrap.Toast)
// ⚠️ 如果您使用 Vue CLI 或 Vite 專案，且已安裝 Bootstrap，請確保這行能正常工作
import { Toast } from 'bootstrap'; 

export default{
    data(){
        return{
            myGamil: 'SaplingWork@gmail.com',
            myGithub: 'https://github.com/SaplingOuO',
            // 用於顯示 Toast 內容的變數
            toastMessage: '' 
        }
    },
    methods: {
        // 私有方法，專門用於顯示 Toast
        showToast(message) {
            this.toastMessage = message;
            
            // 1. 取得 Toast DOM 元素
            const toastEl = this.$refs.liveToast;

            // 2. 確保 Toast 已經初始化，或重新初始化
            // 由於 Toast 可能會被重複使用，我們建議每次都重新初始化
            // 避免舊的 Toast 實例影響
            
            let toast;
            // 嘗試使用引入的 Toast 模組
            if (Toast) {
                toast = new Toast(toastEl);
            } 
            // 如果環境不允許 import，則退回使用 window 上的變數 (如果有的話)
            else if (window.bootstrap && window.bootstrap.Toast) {
                toast = new window.bootstrap.Toast(toastEl);
            } else {
                // 如果無法找到 Bootstrap Toast 實例，則無法顯示 Toast
                console.error('無法找到 Bootstrap Toast 實例。請確認已正確引入 Bootstrap JS。');
                return; 
            }
            
            // 3. 顯示 Toast
            toast.show();
        },
        
        /**
         * 複製 Gmail 帳號並顯示 Bootstrap Toast 訊息
         */
        async showGmailAccount(){
            const email = this.myGamil;
            
            if (navigator.clipboard) {
                try {
                    // 1. 複製文本到剪貼簿
                    await navigator.clipboard.writeText(email);

                    // 2. 複製成功，顯示 [已複製] 訊息
                    this.showToast('✅ [已複製]');

                } catch (err) {
                    console.error('複製失敗:', err);
                    // 3. 複製失敗，顯示失敗訊息
                    this.showToast('❌ 複製失敗。請手動複製。');
                }
            } else {
                // 4. 瀏覽器不支援 Clipboard API，顯示提示
                this.showToast('您的瀏覽器不支援自動複製。請手動複製。');
            }
        },
        
        /**
         * 開啟新分頁到 Github 連結
         */
        gotoGithub(){
            const url = this.myGithub;
            // '_blank' 會在新分頁打開連結
            window.open(url, '_blank');
        }
    }
}
</script>

<style>
/* ... 您的樣式保持不變 ... */
.card{
    top: 50px;
    margin: 2rem;
    background-color: transparent !important;
    border: none !important;
}
/* 讓圖片可點擊 */
.card img {
    cursor: pointer;
}
</style>