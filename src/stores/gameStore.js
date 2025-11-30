import { defineStore } from "pinia";
import { reactive } from "vue";

export const useGameStore = defineStore("game", () => {
  const state = reactive({
    gameStarted: false,
    isGameOver: false,
    score: 0,

    ship: {
      hp: 3,
      size: 1,
      speed: 0.2,
      color: 0x696768,
      position: { x: 0, y: 0, z: 0.5 }
    },

    enemy: {
      hp: 1,
      size: 0.08,
      speed: 0.002,
      spawnInterval: 1500,
      color: 0x1f64d7
    },
    
    bullet: {
      size: 0.02,
      length: 0.05,
      speed: 0.01,
      cooldown: 500,
      color: 0x353334
    },
  });

  function startGame() {
    state.gameStarted = true;
    state.isGameOver = false;
    state.score = 0;
    state.ship.hp = 3;
  }

  function endGame() {
    state.gameStarted = false;
    state.isGameOver = true;
  }

  return {
    state,
    startGame,
    endGame
  };
});