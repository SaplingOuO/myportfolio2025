<template>
  <div class="login-box p-4 shadow-lg bg-dark text-white rounded shadow border border-secondary">
    <h3 class="mb-3 text-center">{{ isLoginMode ? '會員登入' : '註冊帳號' }}</h3>
    
    <div class="mb-3">
      <label class="form-label">Email</label>
      <input v-model="email" type="email" class="form-control" placeholder="請輸入電子信箱">
    </div>
    
    <div class="mb-3">
      <label class="form-label">密碼</label>
      <input v-model="password" type="password" class="form-control" placeholder="請輸入密碼">
    </div>

    <div class="d-grid gap-2">
      <button v-if="isLoginMode" @click="handleLogin" class="btn btn-primary">登入</button>
      <button v-else @click="handleRegister" class="btn btn-success">確認註冊</button>
      
      <button @click="isLoginMode = !isLoginMode" class="btn btn-link text-info btn-sm">
        {{ isLoginMode ? '還沒有帳號？點此註冊' : '已有帳號？返回登入' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { auth } from './composables/firebase'; 
// 注意：這幾行要從 firebase/auth 引入
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

const email = ref('');
const password = ref('');
const isLoginMode = ref(true); // 控制顯示登入還是註冊

const handleRegister = async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    alert("註冊成功！歡迎：" + userCredential.user.email);
  } catch (error) {
    alert("錯誤: " + error.message);
  }
};

const handleLogin = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    alert("登入成功！");
  } catch (error) {
    alert("登入失敗: " + error.message);
  }
};
</script>

<style scoped>
.login-box {
  width: 320px;
}
</style>