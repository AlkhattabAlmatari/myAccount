// Firebase (CDN - module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// 1) حط إعدادات مشروعك من Firebase هنا
const firebaseConfig = {
  apiKey: "PUT_YOUR_API_KEY_HERE",
  authDomain: "PUT_YOUR_AUTH_DOMAIN_HERE",
  projectId: "PUT_YOUR_PROJECT_ID_HERE",
  storageBucket: "PUT_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PUT_YOUR_SENDER_ID_HERE",
  appId: "PUT_YOUR_APP_ID_HERE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const input = document.getElementById("visitorName");
const enterBtn = document.getElementById("enterBtn");
const message = document.getElementById("welcomeMessage");
const list = document.getElementById("visitorsList");

// Firestore refs
const visitorsRef = collection(db, "visitors");
const q = query(visitorsRef, orderBy("createdAt", "asc"));

// عرض الزوار (real-time)
onSnapshot(
  q,
  (snapshot) => {
    list.innerHTML = "";
    let i = 1;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const li = document.createElement("li");
      li.textContent = `${i}) ${data.name ?? ""}`;
      list.appendChild(li);
      i++;
    });
  },
  (err) => {
    console.error("خطأ في قراءة البيانات:", err);
    message.textContent = "في مشكلة بالقراءة—افتح Console (F12)";
  }
);

// إضافة اسم
async function addVisitorName() {
  const name = input.value.trim();

  if (!name) {
    message.textContent = "اكتب اسمك أولاً 🙂";
    return;
  }

  message.textContent = `تشرفنا بزيارتك يا ${name} 🌟`;
  localStorage.setItem("visitorName", name);

  try {
    console.log("بحاول أحفظ في Firestore...");
    const docRef = await addDoc(visitorsRef, {
      name,
      createdAt: serverTimestamp()
    });
    console.log("تم الحفظ ✅ Doc ID:", docRef.id);
    input.value = "";
  } catch (err) {
    console.error("فشل الحفظ ❌", err);
    message.textContent = "صار خطأ بالحفظ—افتح Console (F12) وارسله لي";
  }
}

enterBtn.addEventListener("click", addVisitorName);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addVisitorName();
});

// ترحيب عند الرجعة
const savedName = localStorage.getItem("visitorName");
if (savedName) {
  message.textContent = `أهلاً بعودتك يا ${savedName} 👋`;
}
