<script setup>
import { onMounted, ref } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SVG = ref({
  cloud: "M50.9678 53.9428C50.9678 53.9428 61.0615 53.9538 62.4786 44.0777C63.1534 33.2782 52.7214 31.1497 52.7214 31.1497C52.7214 31.1497 53.9081 15.1625 39.2613 13.3394C26.7081 12.0576 22.8882 23.7239 22.8882 23.7239C22.8882 23.7239 19.1067 20.0887 13.9776 23.0583C9.38606 25.8926 10.1979 31.082 10.1979 31.082C10.1979 31.082 0 33.0642 0 43.4578C0.228571 53.8386 11.0757 53.9428 11.0757 53.9428",
  bird: "M30.5887 43.8119C38.4377 47.6018 48.8826 45.2357 52.4557 37.6112C54.9845 32.2152 47.0628 27.9165 43.0191 28.8955C39.9673 29.6344 38.1509 33.6679 36.1823 32.1704C34.6684 26.4968 31.9841 19.1216 21.6308 17.1792C18.2546 16.5459 13.365 17.7024 16.3738 21.7304C18.6394 24.7626 21.9777 26.2373 25.3508 27.8024C26.3668 28.2743 27.1649 29.4147 28.253 29.7152C28.5119 29.7866 29.0748 29.6011 29.0441 29.8674C28.9769 30.4381 18.2239 24.9563 17.3001 28.7197C16.6329 31.4375 24.3882 32.9933 26.0309 33.3083C26.1341 33.328 26.8314 33.3733 26.821 33.4602C26.7666 33.9271 20.6394 32.8586 19.6077 35.0602C18.2281 38.0031 23.3871 38.2559 24.9756 38.0885C26.3031 37.9482 27.6495 37.9115 28.9423 37.6701C28.985 37.6623 31.0645 37.4395 27.0769 38.2031C23.5457 38.8792 14.4765 40.601 14.2343 41.9979C13.9921 43.3949 15.2075 43.7891 15.8841 45.049C16.5607 46.3087 17.0433 46.5602 17.7503 47.2082C18.4572 47.856 22.8405 41.4624 27.5282 43.0264M51.7469 31.9959C55.7002 33.5563 56.4143 31.9047 52.7964 34.1296M46.7196 33.6011C46.685 33.5058 46.6501 33.4101 46.6153 33.3144",
  mountain: "M58.3732 46.8L43.0132 16.48C42.5563 15.5392 41.8438 14.7459 40.9572 14.1909C40.0707 13.6359 39.0458 13.3416 37.9999 13.3416C36.9539 13.3416 35.9291 13.6359 35.0425 14.1909C34.156 14.7459 33.4435 15.5392 32.9865 16.48L27.9999 26.2934L26.3199 22.64C25.9109 21.7025 25.2409 20.9024 24.3899 20.335C23.5388 19.7677 22.5426 19.457 21.5199 19.44C20.491 19.4445 19.4854 19.7464 18.6243 20.3095C17.7631 20.8725 17.0832 21.6726 16.6665 22.6134L5.57321 46.88C5.36688 47.3016 5.27549 47.7702 5.30827 48.2384C5.34104 48.7067 5.49683 49.158 5.75988 49.5467C6.01301 49.9025 6.34965 50.1907 6.74022 50.386C7.13079 50.5813 7.56334 50.6777 7.99988 50.6667H55.9999C56.4545 50.6653 56.9011 50.5478 57.2975 50.3252C57.6938 50.1026 58.0267 49.7824 58.2645 49.395C58.5023 49.0076 58.6371 48.5658 58.6561 48.1116C58.6752 47.6575 58.5778 47.206 58.3732 46.8Z",
  river: "M41.0816 34.0461C27.6306 28.1756 21.0264 25.9759 16.3807 20.349C11.6244 14.5903 21.5137 5.91801 27.3844 2.01001H17.7559C6.35187 6.16313 -9.30538 21.537 7.0855 33.3126C24.4497 45.7861 29.8317 52.6355 21.0264 61.99H63.3379C66.7625 50.6754 56.5385 40.7901 41.0816 34.0461Z",
  tree: "M55.643 46.344L35.641 2.34202C34.992 0.920023 33.57 -0.000976562 32 -0.000976562C30.429 -0.000976562 29.007 0.921023 28.358 2.34302L8.35804 46.344C7.79604 47.586 7.90104 49.024 8.63504 50.164C9.37404 51.312 10.64 52 11.999 52H27.999V60C27.999 62.211 29.788 64 32 64C34.211 64 36 62.211 36 60V52H52.002C53.361 52 54.627 51.312 55.361 50.164C56.096 49.023 56.205 47.586 55.643 46.344ZM18.21 44L32 13.671L45.789 44H18.21Z",
  treeColor: "M18.21 44L32 13.671L45.789 44H18.21Z",
})

// 雲
function createClouds(count) {
  return Array.from({ length: count }, () => ({
    x: -Math.random() * 50 - 10,
    y: Math.random() * 90,
    duration: 30 + Math.random() * 50,
    scale: Math.random() * 2 + 0.75,
    z: Math.floor(Math.random() * (4 - 2 + 1)) + 2,
  }))
}
const clouds = ref(createClouds(Math.floor(Math.random() * 20 + 50)))

// 鳥
function createBirds(count) {
  return Array.from({ length: count }, () => ({
    x: -Math.random() * 50 - 10,
    y: Math.random() * 90,
    duration: Math.random() * 10 + 10,
    scale: Math.random() * 0.75 + 0.25,
    z: Math.floor(Math.random() * (4 - 2 + 1)) + 2,
  }))
}
const birds = ref(createBirds(Math.floor(Math.random() * 20 + 10)))

// 山
function createMountains() {
  const mountainWidth = 400
  const screenWidth = window.innerWidth
  const count = Math.ceil(screenWidth / mountainWidth) + 2

  return Array.from({ length: count }, (_, i) => ({
    left: i * mountainWidth,
    scale: Math.random() * (15 - 10 + 1) + 10,
    z: Math.floor(Math.random() * (4 - 2 + 1)) + 2,
  }))
}
const mountains = ref(createMountains())

// 河
function createHighlights(count) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 100,       // 百分比 (相對於河流寬度)
    y: Math.random() * 100,       // 百分比 (相對於河流高度)
    size: Math.random() * 3 + 2,  // 2~5 px
    opacity: Math.random() * 0.5 + 0.3 // 0.3~0.8
  }))
}
const highlights = ref(createHighlights(20))

// 樹
function createTrees(count, minDist) {
  const trees = []
  const maxAttemptsPerTree = 100 // 每棵樹最多嘗試 100 次

  for (let i = 0; i < count; i++) {
    let placed = false

    for (let i = 0; i < maxAttemptsPerTree; i++) {
      const scale = Math.random() * 1 + 0.5
      const x = Math.random() * 120
      const y = Math.random() * 70 + 115

      // 過濾禁止區域（河流）
      if (x < 35) continue

      // 跟已經放好的樹比較
      const tooClose = trees.some(tree => {
        const dx = tree.x - x
        const dy = tree.y - y
        const dist = Math.sqrt(dx * dx + dy * dy)
        return dist < minDist
      })

      if (!tooClose) {
        trees.push({
          x,
          y,
          duration: Math.random() * 10 + 10,
          scale,
          z: Math.floor(y / 20),
        })
        placed = true
        break // 成功放置就跳出嘗試迴圈
      }
    }

    if (!placed) {
      console.warn(`第 ${i + 1} 棵樹放不下，跳過了`)
    }
  }

  return trees
}
const trees = ref(createTrees(120, 4))


onMounted(() => {
  // 背景主題色
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".scroll-container",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
    }
  });
  tl.to("body", { backgroundColor: "#228B22", duration: 1 }) // Sky → Forest
    .to("body", { backgroundColor: "#FFD580", duration: 1 }) // Forest → Beach
    .to("body", { backgroundColor: "#052973", duration: 1 }); // Beach → Underwater

  // 雲
  clouds.value.forEach((cloud, i) => {
    gsap.to(`.cloud-${i}`, {
      x: "160vw",
      duration: cloud.duration,
      repeat: -1,
      ease: "linear"
    })
  })

  // 鳥
  birds.value.forEach((bird, i) => {
    gsap.to(`.bird-${i}`, {
      x: "160vw",
      duration: bird.duration,
      repeat: -1,
      ease: "linear"
    })
  })

  // 河(閃光)
  highlights.value.forEach((_, i) => {
    gsap.to(`.highlight-${i}`, {
      opacity: 0,
      y: "+=50",        // 往下漂流
      duration: 3 + Math.random() * 3, // 每顆閃爍時間不同
      repeat: -1,
      yoyo: true,       // 來回閃爍
      ease: "sine.inOut",
      delay: Math.random() * 2
    })
  })

  // 樹
  trees.value.forEach((_tree, i) => {
    gsap.fromTo(
      `.tree-${i}`,
      { opacity: 0, y: -100 }, // 初始：透明 + 往下
      {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: ".forest",
          start: "top 80%",  // 當 forest 區域進入視窗 80% 高度時開始
          toggleActions: "play none none reverse", // 下滑時出現，上滑時消失
        }
      }
    )
  })
})
</script>

<template>
  <div class="scroll-container">
    <section class="panel sky">
      <h1>Sky</h1>
      <!-- 雲 -->
      <svg v-for="(cloud, index) in clouds" :key="index" class="cloud" :class="`cloud-${index}`" viewBox="0 0 64 64"
        :style="{
          top: cloud.y + 'vh',
          left: cloud.x + 'vw',
          transform: `scale(${cloud.scale})`,
          zIndex: cloud.z,
        }">
        <path :d="SVG.cloud" fill="white" opacity="0.8" />
      </svg>

      <!-- 鳥 -->
      <svg v-for="(bird, index) in birds" :key="index" class="bird" :class="`bird-${index}`" viewBox="0 0 64 64" :style="{
        top: bird.y + 'vh',
        left: bird.x + 'vw',
        transform: `scale(${bird.scale})`,
        zIndex: bird.z,
      }">
        <path :d="SVG.bird" fill="white" />
      </svg>
    </section>

    <section class="panel forest">
      <h1>Forest</h1>
      <!-- 山 -->
      <svg v-for="(mountain, index) in mountains" :key="index" class="mountain" :class="`mountain-${index}`"
        viewBox="0 0 64 64" :style="{
          left: mountain.left + 'px',
          transform: `scale(${mountain.scale})`,
          transformOrigin: 'bottom center',
          zIndex: mountain.z,
        }">
        <path :d="SVG.mountain" fill="#17630b" />
      </svg>
      <!-- 河 -->
      <svg class="river" width="64" height="64" viewBox="0 0 64 64">
        <defs>
          <linearGradient id="riverGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#87CEFA" />
            <stop offset="80%" stop-color="#052973" />
          </linearGradient>
        </defs>
        <path :d="SVG.river" fill="url(#riverGradient)" />
        <!-- 白色亮點 -->
        <circle
          v-for="(h, i) in highlights"
          :key="i"
          :class="`highlight-${i}`"
          :cx="h.x"
          :cy="h.y"
          :r="h.size"
          fill="white"
          :opacity="h.opacity"
        />
      </svg>
      <!-- 樹 -->
      <svg
        v-for="(tree, index) in trees" 
        :key="index" 
        class="tree" 
        :class="`tree-${index}`" 
        viewBox="0 0 64 64"
        :style="{
          top: tree.y + 'vh',
          left: tree.x + 'vw',
          transform: `scale(${tree.scale})`,
          zIndex: tree.z,
        }">
        <g clip-path="url(#clip0_31_2)">
          <path
            :d="SVG.tree"
            fill="#394240" />
          <path :d="SVG.treeColor" fill="#89C896" />
        </g>
        <defs>
          <clipPath id="clip0_31_2">
            <rect width="64" height="64" fill="white" />
          </clipPath>
        </defs>
      </svg>

      

    </section>

    <section class="panel beach">
      <h1>Beach</h1>
    </section>
    <section class="panel underwater">
      <h1>Underwater</h1>
    </section>
  </div>
</template>

<style>
body {
  background-color: #87CEEB;
  margin: 0;
}

.scroll-container {
  width: 100vw;
  font-family: Arial, sans-serif;
}

.panel {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  color: white;
  font-weight: bold;
  text-transform: uppercase;
}

/* sky */
.sky {
  position: relative;
  overflow: hidden;
}

.cloud,
.bird,
.mountain,
.river,
.tree {
  position: absolute;
  width: 64px;
  height: auto;
}

.mountain {
  bottom: -30vh;
}
.river {
  bottom: -110vh;
  transform: scaleY(38) scaleX(20);
  z-index: 0;
}
</style>