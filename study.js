const SPREADSHEET_ID = "1lXoqvTh4Kp-g6e2YzZFWavgx7HPOkgRVOZthW98L0mY";
const API_KEY = "AIzaSyDHa1pl2WMMcLlssWIdnc6zUOhAjioO5q4";
const questionsSheetName = "Questions"; // 質問データのシート
const progressSheetName = "Progress"; // ユーザー進捗を記録するシート

let headers = []; // 質問データのヘッダー
let questions = []; // 質問データ
let currentQuestion = null; // 現在の質問

// スプレッドシートからデータを取得
async function fetchSheetData(sheetName) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.values || data.values.length < 2) {
        throw new Error(`${sheetName} シートに十分なデータがありません`);
    }

    const headers = data.values[0];
    const rows = data.values.slice(1);
    return { headers, rows };
}

// 初期化：質問とユーザーのデータをロード
async function initialize() {
    try {
        // ユーザーがログインしているか確認
        if (!currentUser || !currentUser.UserID) {
            alert("ログインが必要です。");
            window.location.href = "index.html"; // ログインページへリダイレクト
            return;
        }

        // 質問データをロード
        const questionsData = await fetchSheetData(questionsSheetName);
        headers = questionsData.headers;
        questions = questionsData.rows.map(row => {
            const question = {};
            headers.forEach((header, index) => {
                question[header] = row[index] || "";
            });
            return question;
        });

        console.log("質問データがロードされました:", questions);

        displayQuestion();
    } catch (error) {
        console.error("初期化中にエラーが発生しました:", error);
    }
}

// ユーザーの正解状況を取得
async function fetchUserProgress() {
    const progressData = await fetchSheetData(progressSheetName);
    const headers = progressData.headers;
    const progressRows = progressData.rows;

    return progressRows
        .filter(row => row[headers.indexOf("UserID")] === currentUser.UserID)
        .reduce((progress, row) => {
            const questionID = row[headers.indexOf("QuestionID")];
            const correctCount = parseInt(row[headers.indexOf("CorrectCount")], 10) || 0;
            progress[questionID] = correctCount;
            return progress;
        }, {});
}

// ランダムな質問を取得（ユーザーの正解状況を考慮）
async function getRandomQuestion() {
    const userProgress = await fetchUserProgress();

    // CorrectCount が一定値を超えた質問を除外
    const eligibleQuestions = questions.filter(q => {
        const correctCount = userProgress[q.QuestionID] || 0;
        return correctCount < 3; // 正解数が3未満の質問を対象とする
    });

    if (eligibleQuestions.length === 0) {
        alert("回答可能な質問がありません。");
        return null;
    }

    return eligibleQuestions[Math.floor(Math.random() * eligibleQuestions.length)];
}

// 質問を表示
async function displayQuestion() {
    currentQuestion = await getRandomQuestion();
    if (currentQuestion) {
        document.getElementById("question").textContent = currentQuestion.Japanese;
        document.getElementById("answerInput").value = ""; // 入力欄をクリア
        document.getElementById("feedback").textContent = ""; // フィードバックをクリア
    }
}

// 回答を確認
function checkAnswer() {
    const userAnswer = document.getElementById("answerInput").value.trim();
    const correctAnswer = currentQuestion.English;

    // フィードバックを表示
    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        document.getElementById("feedback").textContent = "正解です！";
        saveResult("Correct");
    } else {
        document.getElementById("feedback").textContent = `不正解です。模範解答: ${correctAnswer}`;
        saveResult("Incorrect");
    }
}

// 結果をスプレッドシートに保存
async function saveResult(result) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${progressSheetName}:append?valueInputOption=USER_ENTERED&key=${apiKey}`;
    const timestamp = new Date().toISOString();

    const body = {
        values: [
            [
                currentUser.UserID,
                currentQuestion.QuestionID,
                result === "Correct" ? 1 : 0,
                result === "Incorrect" ? 1 : 0,
                timestamp
            ]
        ]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error("データ保存中にエラーが発生しました");
        }

        console.log("結果がProgressシートに保存されました");
    } catch (error) {
        console.error("結果保存中にエラーが発生しました:", error);
    }
}

// ページ読み込み時にデータを初期化
document.addEventListener("DOMContentLoaded", () => {
    initialize();

    // ボタンのイベントリスナーを設定
    document.getElementById("checkAnswerBtn").addEventListener("click", checkAnswer);
    document.getElementById("nextQuestionBtn").addEventListener("click", displayQuestion);
});
