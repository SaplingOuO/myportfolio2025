<template>
  <div class="animeCard">
    <div class="container-fluid">
      <div class="col-1"></div>
      <div class="col-10 mx-auto">
        <!-- 搜尋與篩選區域 -->
        <div
          class="d-flex justify-content-around flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <!-- 請確保路徑是正確的 -->
          <img class="h2 col-3" src="../../../public/animeImages/logo.png" alt="Logo" />
          <div class="row col-9">
            <input type="text" class="col-8 col-xl-8 rounded-pill p-2" placeholder="請輸入關鍵字" v-model="searchInput">
            <div id="years" class="col dropdown p-1">
              <select class="form-select" v-model="searchYear">
                <option value="" selected>所有年份</option>
                <option v-for="yearOption in yearOptions" :key="yearOption" :value="yearOption">
                  {{ yearOption }}
                </option>
              </select>
            </div>
            <div id="season" class="col col-xl btn-group p-1">
              <input type="radio" class="btn-check" name="btnradio" id="btnradio0" autocomplete="off"
                v-model="searchSeason" value="">
              <label class="btn btn-secondary" for="btnradio0">全</label>
              <input type="radio" class="btn-check" name="btnradio" id="btnradio1" autocomplete="off"
                v-model="searchSeason" value="冬季">
              <label class="btn btn-secondary" for="btnradio1" title="1~3月">1~3月</label>
              <input type="radio" class="btn-check" name="btnradio" id="btnradio2" autocomplete="off"
                v-model="searchSeason" value="春季">
              <label class="btn btn-secondary" for="btnradio2" title="4~6月">4~6月</label>
              <input type="radio" class="btn-check" name="btnradio" id="btnradio3" autocomplete="off"
                v-model="searchSeason" value="夏季">
              <label class="btn btn-secondary" for="btnradio3" title="7~9月">7~9月</label>
              <input type="radio" class="btn-check" name="btnradio" id="btnradio4" autocomplete="off"
                v-model="searchSeason" value="秋季">
              <label class="btn btn-secondary" for="btnradio4" title="10~12月">10~12月</label>
            </div>
          </div>
        </div>

        <!-- ***** 核心切換區域：卡片列表 <-> 詳細紀錄視圖 ***** -->
        <div id="cards" class="container">
          <!-- 狀態訊息提示 (取代 Alert/Confirm) -->
          <div v-if="statusMessage"
            :class="['alert', 'fixed-status', statusType === 'success' ? 'alert-success' : 'alert-danger']"
            role="alert">
            {{ statusMessage }}
          </div>

          <!-- 使用 transition 進行列表和詳細視圖的平滑切換 -->
          <transition name="list-fade" mode="out-in">
            <!-- 1. 卡片列表視圖 (List View) -->
            <div v-if="!isModalVisible" class="row row-cols-2 row-cols-md-3 row-cols-xl-4 g-0" key="listView">
              <div v-for="card in filteredCards" :key="card.id" class="col-6 col-md-4 col-xl-3 column">
                <div class="col position-relative card" :tag="card.tag">
                  <div class="img-fluid" style="height: 300px">
                    <img class="card-img-top mx-auto d-block" :src="card.imageSrc" :alt="card.title"
                      style="object-fit: cover; width: 100%; height: 100%" />
                  </div>
                  <div class="position-absolute bottom-0 start-0 w-100 badge bg-dark" style="--bs-bg-opacity: 0.7">
                    <h5 class="title text-truncate">{{ card.title }}</h5>
                  </div>
                  <!-- 點擊時切換到詳細視圖 -->
                  <button class="stretched-link" @click="openDetailView(card)"></button>
                </div>
              </div>
              <div v-if="filteredCards.length === 0" class="text-center text-danger my-4 w-100">
                找不到符合條件的動畫資料
              </div>
            </div>

            <!-- 2. 詳細紀錄視圖 (Detail View - 撐開的原位區域) -->
            <div v-else class="expanded-detail-view p-4 rounded shadow-lg" key="detailView">
              <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-4">
                <h4 class="mb-0">{{ currentModalCard.title }}</h4>
                <!-- 返回按鈕取代關閉按鈕 -->
                <button type="button" class="btn btn-sm btn-secondary" @click="closeModal" aria-label="Close">
                  <i class="bi bi-arrow-left"></i> 返回列表
                </button>
              </div>

              <!-- 動畫資訊與紀錄輸入區 -->
              <div class="row mb-4">
                <div class="col-12 col-md-4 text-center mb-3">
                  <img :src="currentModalCard.imageSrc" :alt="currentModalCard.title"
                    class="img-fluid rounded shadow-sm" style="max-height: 250px; object-fit: cover; max-width: 100%;">
                </div>
                <div class="col-12 col-md-8">
                  <p class="mt-2 mb-0"><strong>上映日期:</strong> {{ currentModalCard.releaseDate || 'N/A' }}</p>
                  <p><strong>季度:</strong> {{ currentModalCard.season || 'N/A' }}</p>

                  <!-- 新增觀看紀錄輸入介面 (整合在右側/下方) -->
                  <div class="border p-3 rounded-lg bg-light mt-4">
                    <h5 class="mb-3">新增觀看紀錄</h5>
                    <div class="row g-2 mb-3 align-items-center">
                      <div class="col-4"><label for="episodeInput" class="form-label mb-0">觀看集數:</label></div>
                      <div class="col-8">
                        <input id="episodeInput" v-model.number="episodeNumber" type="number" min="1"
                          class="form-control text-center" placeholder="集數">
                      </div>
                    </div>
                    <div class="row g-2">
                      <div class="col">
                        <input v-model="noteContent" class="form-control" type="text" placeholder="輸入筆記內容">
                      </div>
                      <div class="col-auto">
                        <button class="btn btn-primary" @click="saveNote">儲存筆記</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <hr>
              <!-- 觀看紀錄列表 -->
              <h5>我的觀看紀錄</h5>
              <div class="record-list-container">
                <ul class="list-group">
                  <li v-for="(note, index) in currentAnimeNotes" :key="index"
                    class="list-group-item d-flex justify-content-between align-items-center my-1 rounded shadow-sm">
                    <span class="text-break">
                      第 <strong>{{ note.episode }}</strong> 集： {{ note.content }}
                    </span>
                    <button class="btn btn-sm btn-danger ms-2 flex-shrink-0"
                      @click="deleteNote(note.episode)">刪除</button>
                  </li>
                </ul>
                <p v-if="currentAnimeNotes.length === 0" class="text-muted mt-2">目前沒有紀錄。</p>
              </div>
            </div>
          </transition>
        </div>
        <!-- ***** 核心切換區域結束 ***** -->

      </div>
      <div class="col-1"></div>
    </div>
  </div>
</template>

<script>
// 假設這個路徑是正確的，用於模擬資料
import ACGList from "../../assets/gamerAcg-List.json";

export default {
  data() {
    return {
      // 資料與狀態
      searchData: [],

      // 搜尋條件
      searchInput: '',
      searchSeason: '',
      searchYear: '',
      yearOptions: [],

      // 詳細視圖與筆記控制
      isModalVisible: false, // 控制是否顯示詳細視圖 (Expanded Detail View)
      allAnimeNotes: {},
      currentModalCard: {},
      episodeNumber: '',
      noteContent: '',

      // 狀態訊息 (取代 alert/confirm)
      statusMessage: '',
      statusType: 'success', // 'success' or 'danger'
      statusTimer: null,
    };
  },

  computed: {
    // 核心篩選邏輯
    filteredCards() {
      const input = this.searchInput.trim().toLowerCase();
      const season = this.searchSeason.trim();
      const year = this.searchYear.trim().toLowerCase();

      return this.searchData.filter((card) => {
        const cardTag = card.tag.toLowerCase();

        // 1. 關鍵字篩選
        if (input && cardTag.indexOf(input) === -1) {
          return false;
        }

        // 2. 季度篩選 (精確匹配)
        if (season && card.season !== season) {
          return false;
        }

        // 3. 年份篩選
        if (year) {
          if (year === '未上映') {
            if (card.releaseDate.slice(0, 4) > '1900' && card.releaseDate !== '未上映') {
              return false;
            }
          } else if (card.releaseDate.indexOf(year) === -1) {
            return false;
          }
        }

        return true;
      });
    },

    // 獲取當前動畫的所有筆記
    currentAnimeNotes() {
      const notes = this.allAnimeNotes[this.currentModalCard.title] || [];
      return notes.sort((a, b) => a.episode - b.episode);
    }
  },

  mounted() {
    this.cardData();
    // 這裡使用 localStorage 存取紀錄
    this.localStorageData();
    this.gatAllYears();
    this.setInitialFilter();

    // 監聽 ESC 鍵關閉 詳細視圖
    window.addEventListener('keydown', this.handleEscKey);
  },

  beforeUnmount() {
    // 組件銷毀時移除監聽器
    window.removeEventListener('keydown', this.handleEscKey);
  },

  methods: {
    // 顯示狀態訊息 (取代 alert/confirm)
    showStatus(message, type = 'success') {
      if (this.statusTimer) {
        clearTimeout(this.statusTimer);
      }
      this.statusMessage = message;
      this.statusType = type;
      this.statusTimer = setTimeout(() => {
        this.statusMessage = '';
      }, 3000); // 3秒後自動消失
    },

    // 載入並處理所有原始卡片資料
    cardData() {
      // 1. 【新增】使用 Set 追蹤已見過的動畫 ID (num)
      const seenNums = new Set();

      const uniqueList = ACGList.filter(item => {
        // 使用 num 作為唯一識別碼
        if (seenNums.has(item.num)) {
          return false; // 發現重複，過濾掉
        }
        seenNums.add(item.num);
        return true; // 保留
      });

      // 2. 針對去重複後的清單進行 mapping
      this.searchData = uniqueList.map((item, index) => {
        const title = item.cn;
        const releaseDate = item.releaseDate;
        const season = item.season;
        const imageSrc = "animeImages/" + item.image;

        const tag = [title, item.en, item.jp, releaseDate, season].join(',');

        return {
          id: index, // 這裡的 index 仍然是唯一的
          imageSrc,
          title,
          tag,
          releaseDate,
          season,
        };
      });
    },

    // 設定最新的年份和季度為預設值
    setInitialFilter() {
      const latestCard = this.searchData.find(card =>
        card.releaseDate !== '未上映' && card.releaseDate.length >= 4
      );

      if (latestCard) {
        const latestYear = latestCard.releaseDate.slice(0, 4);

        this.searchYear = latestYear;
        this.searchSeason = latestCard.season;
      } else if (this.yearOptions.length > 0) {
        this.searchYear = this.yearOptions[0];
        this.searchSeason = '';
      }
    },

    // 取得所有唯一的年份
    gatAllYears() {
      const years = new Set();
      this.searchData.forEach(card => {
        const yearstr = card.releaseDate.slice(0, 4);
        if (card.releaseDate === '未上映' || yearstr < '1900') {
          years.add('未上映');
        } else {
          years.add(yearstr);
        }
      });

      this.yearOptions = Array.from(years).sort((a, b) => {
        if (a === '未上映') return 1;
        if (b === '未上映') return -1;
        return parseInt(b) - parseInt(a);
      });
    },

    // 監聽 ESC 鍵
    handleEscKey(event) {
      if (this.isModalVisible && event.key === 'Escape') {
        this.closeModal();
      }
    },

    // 展開詳細視圖 (In-place Detail View)
    openDetailView(card) {
      this.currentModalCard = card;
      this.episodeNumber = '';
      this.noteContent = '';
      this.statusMessage = ''; // 清除舊的狀態訊息
      this.isModalVisible = true;
      // 確保切換後滾動到視圖頂部
      this.$nextTick(() => {
        document.getElementById('cards').scrollIntoView({ behavior: 'smooth' });
      });
    },

    // 關閉詳細視圖 (返回列表)
    closeModal() {
      this.isModalVisible = false;
    },

    // 讀取 localStorage 資料
    localStorageData() {
      let animeNotes = JSON.parse(localStorage.getItem('animeNotes')) || [];
      const notesMap = {};

      animeNotes.forEach(note => {
        const title = note.title;
        if (!notesMap[title]) {
          notesMap[title] = [];
        }
        notesMap[title].push({
          episode: note.episode,
          content: note.note,
        });
      });
      this.allAnimeNotes = notesMap;
    },

    // 儲存筆記
    saveNote() {
      const episode = parseInt(this.episodeNumber);
      const content = this.noteContent.trim();
      const title = this.currentModalCard.title;

      if (!episode || !content || episode <= 0) {
        this.showStatus('請輸入有效集數和筆記內容。', 'danger');
        return;
      }

      let animeNotes = JSON.parse(localStorage.getItem('animeNotes')) || [];

      const existingNoteIndex = animeNotes.findIndex(note =>
        note.title === title && note.episode === episode
      );

      const newNote = {
        title: title,
        episode: episode,
        note: content
      };

      if (existingNoteIndex >= 0) {
        animeNotes[existingNoteIndex] = newNote;
        this.showStatus(`第 ${episode} 集的筆記已更新！`);
      } else {
        animeNotes.push(newNote);
        this.showStatus('新筆記已儲存！');
      }

      localStorage.setItem('animeNotes', JSON.stringify(animeNotes));

      this.localStorageData(); // 重新載入數據以更新列表

      this.episodeNumber = '';
      this.noteContent = '';
    },

    // 刪除筆記
    deleteNote(episodeToDelete) {
      let animeNotes = JSON.parse(localStorage.getItem('animeNotes')) || [];
      const title = this.currentModalCard.title;

      const updatedNotes = animeNotes.filter(note =>
        !(note.title === title && note.episode === episodeToDelete)
      );

      localStorage.setItem('animeNotes', JSON.stringify(updatedNotes));

      this.localStorageData(); // 重新載入數據以更新列表
      this.showStatus(`第 ${episodeToDelete} 集筆記已刪除。`);
    }
  },
};
</script>

<style>
/* ---------------------------------- */
/* 背景與動畫 */
/* ---------------------------------- */
.animeCard {
  /* 夢幻漸層背景 */
  background: linear-gradient(270deg, rgb(238, 119, 82), rgb(231, 60, 126), rgb(5, 166, 213), rgb(35, 213, 103));
  background-size: 1000% 1000%;
  animation: gradient 15s ease infinite;
  min-height: 100vh;
  position: relative;
}

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

/* ---------------------------------- */
/* 卡片樣式 */
/* ---------------------------------- */
.card {
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  margin: 5px;
  padding: 1px;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.stretched-link {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  opacity: 0;
}

.badge {
  padding: 10px;
}

/* ---------------------------------- */
/* ***** 詳細視圖與切換動畫 ***** */
/* ---------------------------------- */

/* 1. In-place 擴展視圖樣式 */
.expanded-detail-view {
  background-color: white;
  min-height: 80vh;
  width: 100%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}

/* 2. 紀錄列表容器: 限制高度並允許滾動 */
.record-list-container {
  max-height: 40vh;
  overflow-y: auto;
  padding-right: 15px;
}

/* 3. 狀態訊息定位: 粘性定位在列表容器頂部 */
.fixed-status {
  position: sticky;
  top: 0;
  z-index: 999;
  border-radius: 0;
  margin-bottom: 0;
}

/* 4. 列表淡入淡出過渡 (List View Transition) */
/* 列表和詳細視圖同時在 transition mode="out-in" 中切換 */
.list-fade-enter-active,
.list-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

/* 列表離開時，稍微向下移動並淡出 */
.list-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* 詳細視圖進入時，從上方淡入 */
.list-fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
</style>