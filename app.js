const SPREADSHEET_ID = "1lXoqvTh4Kp-g6e2YzZFWavgx7HPOkgRVOZthW98L0mY";
const API_KEY = "AIzaSyDHa1pl2WMMcLlssWIdnc6zUOhAjioO5q4";

// ログイン処理の実装例
async function login(username, password) {
    const sheetName = "Users"; // ユーザー情報が格納されたシート名
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!data.values || data.values.length < 2) {
            throw new Error("スプレッドシートに十分なデータがありません");
        }

        // 1行目をヘッダーとして取得
        const headers = data.values[0]; // 1行目がヘッダー
        const rows = data.values.slice(1); // 2行目以降がデータ

        // ユーザーの検証
        const user = rows.find(row => {
            const record = {};
            headers.forEach((header, index) => {
                record[header] = row[index]; // ヘッダーをキーにデータをマッピング
            });
            return record.Username === username && record.Password === password;
        });

        if (user) {
            console.log("ログイン成功");
            return true;
        } else {
            console.log("ログイン失敗");
            return false;
        }
    } catch (error) {
        console.error("エラーが発生しました:", error);
        return false;
    }
}
