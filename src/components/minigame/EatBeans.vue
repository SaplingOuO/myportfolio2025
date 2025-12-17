<template>
  <div class="game-screen-container">
    
    <div class="game-wrapper">
      <div class="game-info-panel">
        <div class="info-row">時間: {{ time }}</div>
        <div class="info-row">分數: {{ score }}</div>
        <div class="info-row">平均每秒得分: {{ average }}</div>
        <div class="info-row">操作: WASD</div>
      </div>

      <div class="canvas-container" ref="canvasContainer"></div>
    </div>

  </div>
</template>

<script>
import * as THREE from 'three';

export default {
  data() {
    return {
      startTime: null,
      currentTime: null,
      time: '00:00:00.000',
      score: 0,
      average: 0,
    }
  },
  created() {
    this.startTime = new Date();
    this.updateTime();
    setInterval(this.updateTime, 1);
  },
  mounted() {
    this.init();
  },
  methods: {
    updateTime() {
      this.currentTime = new Date();

      let diff = Math.floor(this.currentTime - this.startTime);
      let diffAverage = Math.floor(diff / 1000);
      let hours = Math.floor(diff / 3600000);
      diff = diff % 3600000;
      let minutes = Math.floor(diff / 60000);
      diff = diff % 60000;
      let seconds = Math.floor(diff / 1000);
      let milliseconds = diff % 1000;

      this.time = this.pad(hours) + ':' + this.pad(minutes) + ':' + this.pad(seconds) + '.' + this.padMS(milliseconds);

      if (diffAverage > 0) {
        this.average = (this.score / diffAverage).toFixed(2);
      } else {
        this.average = 0;
      }
    },
    pad(num) {
      return num.toString().padStart(2, '0');
    },
    padMS(num) {
      return num.toString().padStart(3, '0');
    },
    init() {
      // 創建場景、相機和渲染器
      this.scene = new THREE.Scene();
      this.camera = new THREE.OrthographicCamera(0, 10, 10, 0, -1, 1000);
      this.renderer = new THREE.WebGLRenderer();
      this.renderer.setSize(300, 300);
      this.$refs.canvasContainer.appendChild(this.renderer.domElement);

      // 創建球體（玩家）
      const playerGeometry = new THREE.SphereGeometry(0.5, 32, 32);
      const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      this.player = new THREE.Mesh(playerGeometry, playerMaterial);
      this.player.position.set(5, 5, 1); // 將障礙物放置在指定位置
      this.scene.add(this.player);

      // 創建障礙物球體
      const obstacleGeometry = new THREE.SphereGeometry(0.5, 32, 32);
      const obstacleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      this.obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
      this.obstacle.position.set(2, 2, 1); // 將障礙物放置在指定位置
      this.scene.add(this.obstacle);

      // 設置相機位置
      this.camera.position.z = 5;

      // 初始化遊戲邏輯
      this.initGameLogic();

      // 定義渲染循環
      this.animate();
    },
    initGameLogic() {
      // 設置玩家球體的初始位置
      this.player.position.x = 5;
      this.player.position.y = 5;

      // 初始化鍵盤狀態
      this.keyState = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false
      };

      // 設置鍵盤事件監聽器
      document.addEventListener('keydown', this.onKeyDown);
      document.addEventListener('keyup', this.onKeyUp);
    },
    onKeyDown(event) {
      this.keyState[event.key] = true;
    },
    onKeyUp(event) {
      this.keyState[event.key] = false;
    },
    movePlayer() {
      const speed = 0.1; // 移動速度
      if (this.keyState.w) {
        this.player.position.y += speed;
      }
      if (this.keyState.s) {
        this.player.position.y -= speed;
      }
      if (this.keyState.a) {
        this.player.position.x -= speed;
      }
      if (this.keyState.d) {
        this.player.position.x += speed;
      }
      this.player.position.x = THREE.MathUtils.clamp(this.player.position.x, 0, 10);
      this.player.position.y = THREE.MathUtils.clamp(this.player.position.y, 0, 10);

    },
    animate() {
      // 檢查玩家球體是否與障礙物球體相撞
      if (this.player.position.distanceTo(this.obstacle.position) < 1) {
        this.obstacle.position.set(THREE.MathUtils.randFloat(0, 10), THREE.MathUtils.randFloat(0, 10), this.obstacle.position.z);
        this.score += 1;
      }

      // 移動玩家球體
      this.movePlayer();

      requestAnimationFrame(this.animate);
      this.renderer.render(this.scene, this.camera);
    }
  },
  beforeUnmount() {
    // 在組件銷毀前移除事件監聽器
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
  }
};
</script>

<style scoped>
.game-screen-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 416.25px;
}

/* 🌟 修改為水平排列 */
.game-wrapper {
  display: flex;       /* 讓內部元件橫向並排 */
  align-items: flex-start; /* 讓文字對齊頂部 */
  gap: 20px;           /* 文字與畫布之間的間距 */
}

/* 🌟 資訊面板樣式（原本的 game-overlay） */
.game-info-panel {
  /* 移除 position: absolute，讓它回歸一般排版流 */
  min-width: 200px;    /* 根據文字長度調整寬度 */
  color: #fff;
  font-family: Arial, sans-serif;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05); /* 選配：加一點淡淡的底色區隔 */
  border-radius: 8px;
}

.info-row {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 15px; /* 增加行距，放在旁邊時閱讀較舒服 */
  white-space: nowrap; /* 防止文字換行 */
}

.canvas-container {
  width: 304px;
  height: 304px;
  border: 2px solid #444; /* 給遊戲框一個邊框 */
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
}
</style>