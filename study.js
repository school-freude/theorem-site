const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
const API_KEY = "YOUR_API_KEY";
let questions = [];
let progressData = [];
let currentQuestion = null; // 現在の問題
const userId = localStorage.getItem('userId'); // ログイン時に保存されたユーザーID

// スプレッドシートから問題データを取得
async function fetchQuestions() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Questions?key=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  questions = data.values.map(row => ({ id: row[0], japanese: row[1], english: row[2] }));
}

// スプレッドシートから進捗データを取得
async function fetchProgress() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Progress?key=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  progressData = data.values
    .filter(row => row[0] === userId) // ログインユーザーのデータに限定
    .map(row => ({
      questionId: row[1],
      correctCount: parseInt(row[2]),
      wrongCount: parseInt(row[3]),
      lastResult: row[4],
    }));
}

// 次の問題を取得するロジック
function getNextQuestion() {
  // ユーザーが連続正解していない問題を選択
  const eligibleQuestions = questions.filter(question => {
    const progress = progressData.find(p => p.questionId === question.id);
    return !progress || progress.correctCount < 3;
  });

  if (eligibleQuestions.length === 0) {
    alert("出題可能な問題がありません！");
    return null;
  }

  // ランダムに問題を選択
  return eligibleQuestions[Math.floor(Math.random() * eligibleQuestions.length)];
}

// 回答を送信し、正解・不正解を判定
async function submitAnswer() {
  const userAnswer = document.getElementById("user-answer").value.trim();
  if (!userAnswer) {
    alert("回答を入力してください！");
    return;
  }

  const isCorrect = userAnswer.toLowerCase() === currentQuestion.english.toLowerCase();
  alert(isCorrect ? "正解です！" : `不正解です。\n正解: ${currentQuestion.english}`);

  // 結果をスプレッドシートに保存
  await saveResult(currentQuestion.id, isCorrect);

  // 次の問題を取得
  const question = getNextQuestion();
  if (question) {
    document.getElementById("japanese-text").textContent = question.japanese;
    document.getElementById("user-answer").value = "";
    currentQuestion = question;
  } else {
    document.getElementById("japanese-text").textContent = "全ての問題に正解しました！";
    document.getElementById("user-answer").disabled = true;
    document.getElementById("submit-button").disabled = true;
  }
}

// 結果をスプレッドシートに保存
async function saveResult(questionId, isCorrect) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Progress:append?valueInputOption=USER_ENTERED&key=${API_KEY}`;
  const method = "POST";
  const headers = { "Content-Type": "application/json" };
  const body = JSON.stringify({
    values: [
      [
        userId,               // UserID
        questionId,           // QuestionID
        isCorrect ? 1 : 0,    // Increment CorrectCount or WrongCount
        isCorrect ? 0 : 1,    // Increment WrongCount
        isCorrect ? "◯" : "×", // LastResult
        new Date().toISOString().split("T")[0], // LastUpdated
      ],
    ],
  });

  await fetch(url, { method, headers, body });
}

// 初期化処理
async function initializeStudy() {
  await fetchQuestions();
  await fetchProgress();

  // 最初の問題を表示
  const question = getNextQuestion();
  if (question) {
    document.getElementById('japanese-text').textContent = question.japanese;
    currentQuestion = question; // 現在の問題を保存
  }
}

// ページ読み込み時に初期化
document.getElementById("submit-button").addEventListener("click", submitAnswer);
initializeStudy();
