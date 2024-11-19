const SPREADSHEET_ID = "1lXoqvTh4Kp-g6e2YzZFWavgx7HPOkgRVOZthW98L0mY";
const API_KEY = "AIzaSyDHa1pl2WMMcLlssWIdnc6zUOhAjioO5q4";

// Google Sheets API URL
const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values`;

async function fetchSheetData(sheetName) {
    const url = `${BASE_URL}/${sheetName}?key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.values || data.values.length < 2) {
        throw new Error(`${sheetName} シートにデータがありません`);
    }

    const headers = data.values[0];
    const rows = data.values.slice(1);
    return { headers, rows };
}

async function getNextQuestion(userId) {
    const questions = await fetchSheetData("Questions");
    const progress = await fetchSheetData("Progress");

    const questionIdIndex = questions.headers.indexOf("QuestionID");
    const japaneseIndex = questions.headers.indexOf("Japanese");

    const userIdIndex = progress.headers.indexOf("UserID");
    const questionIdProgressIndex = progress.headers.indexOf("QuestionID");
    const correctCountIndex = progress.headers.indexOf("CorrectCount");

    const answeredQuestions = progress.rows
        .filter(row => row[userIdIndex] === userId)
        .filter(row => parseInt(row[correctCountIndex]) >= 3)
        .map(row => row[questionIdProgressIndex]);

    const unansweredQuestions = questions.rows.filter(
        row => !answeredQuestions.includes(row[questionIdIndex])
    );

    if (unansweredQuestions.length === 0) {
        throw new Error("すべての問題に回答済みです！");
    }

    // ランダムに次の質問を選択
    const nextQuestion = unansweredQuestions[Math.floor(Math.random() * unansweredQuestions.length)];
    return {
        questionId: nextQuestion[questionIdIndex],
        japanese: nextQuestion[japaneseIndex],
    };
}

async function submitAnswer(userId, questionId, userAnswer) {
    const questions = await fetchSheetData("Questions");
    const progress = await fetchSheetData("Progress");

    const questionIdIndex = questions.headers.indexOf("QuestionID");
    const englishIndex = questions.headers.indexOf("English");

    const correctAnswer = questions.rows.find(row => row[questionIdIndex] === questionId)[englishIndex];

    const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

    const userProgressIndex = progress.rows.findIndex(
        row => row[progress.headers.indexOf("UserID")] === userId &&
               row[progress.headers.indexOf("QuestionID")] === questionId
    );

    const newRow = [
        userId,
        questionId,
        isCorrect ? 1 : 0,
        isCorrect ? 0 : 1,
        new Date().toISOString(),
    ];

    // スプレッドシートに結果を保存（Google Apps ScriptまたはGoogle APIを利用）
    if (userProgressIndex === -1) {
        await appendRowToSheet("Progress", newRow);
    } else {
        await updateProgressRow(progress, userProgressIndex, isCorrect);
    }

    return { isCorrect, correctAnswer };
}

async function appendRowToSheet(sheetName, rowData) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}:append?valueInputOption=USER_ENTERED&key=${API_KEY}`;
    await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            values: [rowData],
        }),
    });
}

async function updateProgressRow(progress, rowIndex, isCorrect) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${progress.sheetName}!A${rowIndex + 2}:E${rowIndex + 2}?valueInputOption=USER_ENTERED&key=${API_KEY}`;
    const row = progress.rows[rowIndex];
    row[2] = parseInt(row[2]) + (isCorrect ? 1 : 0); // CorrectCount
    row[3] = parseInt(row[3]) + (isCorrect ? 0 : 1); // IncorrectCount
    row[4] = new Date().toISOString(); // Timestamp

    await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            values: [row],
        }),
    });
}

// 初期化
document.getElementById("startButton").addEventListener("click", async () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
        alert("ログインしてください");
        return;
    }

    try {
        const question = await getNextQuestion(userId);
        document.getElementById("questionText").textContent = question.japanese;
        document.getElementById("submitAnswerButton").onclick = async () => {
            const userAnswer = document.getElementById("answerInput").value;
            const result = await submitAnswer(userId, question.questionId, userAnswer);

            alert(result.isCorrect ? "正解！" : `不正解。正解: ${result.correctAnswer}`);
            location.reload(); // 次の質問へ
        };
    } catch (error) {
        alert(error.message);
    }
});
