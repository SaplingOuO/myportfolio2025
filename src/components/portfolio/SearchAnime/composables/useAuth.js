 /* 
    功能:判斷使用者是否登入
    使用:firebase.js
    使用於:FrontPage.vue(首頁)
 */

import { ref, onMounted } from 'vue';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";

export function useAuth() {
    const isLoggedIn = ref(false);
    const currentUser = ref(null);

    onMounted(() => {
        onAuthStateChanged(auth, (user) => {
            isLoggedIn.value = !!user;
            currentUser.value = user;
        });
    });

    const logout = async () => {
        await signOut(auth);
    };

    return { isLoggedIn, currentUser, logout };
}