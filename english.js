// 日本語文とその模範解答のリスト
const sentences = [
  { japanese: "これはペンです。", english: "This is a pen." },
  { japanese: "私は毎日コーヒーを飲みます。", english: "I drink coffee every day." },
  { japanese: "彼は昨日図書館に行きました。", english: "He went to the library yesterday." },
];

// HTML要素の取得
const showButton = document.getElementById("show-japanese");
const checkButton = document.getElementById("check-answer");
const japaneseText = document.getElementById("japanese-text");
const englishInput = document.getElementById("english-input");
const correctAnswer = document.getElementById("correct-answer");
const resultText = document.getElementById("result-text");

// グローバル変数で現在の文を保持
let currentSentence = null;

// ランダムに日本語文を表示
showButton.addEventListener("click", () => {
  const randomIndex = Math.floor(Math.random() * sentences.length);
  currentSentence = sentences[randomIndex];
  japaneseText.textContent = currentSentence.japanese;
  englishInput.value = ""; // 入力欄をリセット
  correctAnswer.textContent = "";
  resultText.textContent = "";
});

// 解答チェック
checkButton.addEventListener("click", () => {
  if (!currentSentence) {
    alert("まず和文を表示してください。");
    return;
  }

  const userAnswer = englishInput.value.trim();
  const correct = currentSentence.english;

  // 解答を表示
  correctAnswer.textContent = `模範解答: ${correct}`;

  // 結果の判定
  if (userAnswer.toLowerCase() === correct.toLowerCase()) {
    resultText.textContent = "正解です！";
    resultText.style.color = "green";
  } else {
    resultText.textContent = `不正解です。あなたの解答: ${userAnswer}`;
    resultText.style.color = "red";
  }
});
