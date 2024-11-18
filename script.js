// 定理リスト
const theorems = [
  {
    title: "三角形の内角の二等分線と比",
    description: "次の図をみて、定理を復元しなさい",
    image: "images/theorem1.png"
  },
  {
    title: "三角形の内角の二等分線と比の定理の証明",
    description: "次の定理を証明しなさい。",
    image: "images/theorem1-proof.png"
  },
  
];

// ボタンと定理表示エリア
const button = document.getElementById("show-theorem");
const title = document.getElementById("theorem-title");
const description = document.getElementById("theorem-description");
const image = document.getElementById("theorem-image");
const container = document.getElementById("theorem-container");

// ランダムに定理を表示
button.addEventListener("click", () => {
  const randomIndex = Math.floor(Math.random() * theorems.length);
  const theorem = theorems[randomIndex];

  title.textContent = theorem.title;
  description.textContent = theorem.description;
  image.src = theorem.image;

  container.style.display = "block";
});