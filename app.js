const SPREADSHEET_ID = "1lXoqvTh4Kp-g6e2YzZFWavgx7HPOkgRVOZthW98L0mY";
const API_KEY = "AIzaSyDHa1pl2WMMcLlssWIdnc6zUOhAjioO5q4";
// Google Sheets API URL
const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values`;

// ログイン処理
async function login(userId, password) {
    const url = `${BASE_URL}/Users?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.values || data.values.length < 2) {
        throw new Error("Usersシートにデータがありません");
    }

    const headers = data.values[0];
    const rows = data.values.slice(1);

    // ヘッダーのインデックスを取得
    const userIdIndex = headers.indexOf("UserID");
    const passwordIndex = headers.indexOf("Password");
    const nameIndex = headers.indexOf("Name");

    // ユーザーを検索
    const user = rows.find(row => row[userIdIndex] === userId && row[passwordIndex] === password);
    if (!user) {
        throw new Error("ユーザーIDまたはパスワードが無効です");
    }

    // ユーザー情報を返す
    return {
        userId: user[userIdIndex],
        name: user[nameIndex],
    };
}

// ユーザー登録処理
async function register(userId, password, name) {
    const url = `${BASE_URL}/Users?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.values || data.values.length < 2) {
        throw new Error("Usersシートにデータがありません");
    }

    const headers = data.values[0];
    const rows = data.values.slice(1);

    // ヘッダーのインデックスを取得
    const userIdIndex = headers.indexOf("UserID");

    // ユーザーIDの重複確認
    const existingUser = rows.find(row => row[userIdIndex] === userId);
    if (existingUser) {
        throw new Error("このユーザーIDは既に登録されています");
    }

    // 新しいユーザーを登録
    const newRow = [userId, password, name];
    const appendUrl = `${BASE_URL}/Users:append?valueInputOption=USER_ENTERED&key=${API_KEY}`;
    const appendResponse = await fetch(appendUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            values: [newRow],
        }),
    });

    if (!appendResponse.ok) {
        throw new Error("ユーザー登録に失敗しました");
    }

    return { userId, name };
}

// ログインボタンのクリックイベント
document.getElementById("loginButton").addEventListener("click", async () => {
    const userId = document.getElementById("userIdInput").value;
    const password = document.getElementById("passwordInput").value;

    try {
        const user = await login(userId, password);
        alert(`ようこそ、${user.name}さん！`);
        sessionStorage.setItem("userId", user.userId);
        window.location.href = "study.html"; // 学習ページへ移動
    } catch (error) {
        alert(error.message);
    }
});

// ユーザー登録ボタンのクリックイベント
document.getElementById("registerButton").addEventListener("click", async () => {
    // 各入力フィールドの値を取得
    const userId = document.getElementById("userIdInputRegister").value.trim();
    const password = document.getElementById("passwordInputRegister").value.trim();
    const name = document.getElementById("nameInput").value.trim();

    // 入力値が空でないかを確認
    if (!userId || !password || !name) {
        alert("全てのフィールドを入力してください");
        return;
    }

    try {
        const user = await register(userId, password, name);
        alert(`ユーザー登録が完了しました！ ようこそ、${user.name}さん！`);
        sessionStorage.setItem("userId", user.userId);
        window.location.href = "study.html"; // 学習ページへ移動
    } catch (error) {
        alert(error.message);
    }
});
