const SPREADSHEET_ID = "1lXoqvTh4Kp-g6e2YzZFWavgx7HPOkgRVOZthW98L0mY";
const API_KEY = "AIzaSyDHa1pl2WMMcLlssWIdnc6zUOhAjioO5q4";

// ログインフォーム処理
document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Users:append?valueInputOption=USER_ENTERED&key=${API_KEY}`;
  
  const data = {
    values: [[username, email]]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      localStorage.setItem('username', username); // ログイン状態を保存
      window.location.href = 'study.html'; // 学習ページに移動
    } else {
      document.getElementById('login-message').textContent = "ログインに失敗しました。";
    }
  } catch (error) {
    console.error(error);
  }
});
