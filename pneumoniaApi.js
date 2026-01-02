const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const uploadText = document.getElementById("uploadText");
const button = document.getElementById("predictBtn");
const result = document.getElementById("result");

input.addEventListener("change", () => {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.style.display = "block";
      uploadText.style.display = "none";
    };
    reader.readAsDataURL(file);
  } else {
    preview.style.display = "none";
    uploadText.style.display = "inline";
  }
});

button.onclick = async () => {
  const file = input.files[0];
  if (!file) {
    alert("Please upload an image");
    return;
  }

  button.disabled = true;
  button.textContent = "Analyzing...";
  result.style.display = "none";

  try {
    const data = await predictPneumonia(file);

    result.style.display = "block";
    result.className =
      "result " + (data.prediction === "NORMAL" ? "good" : "bad");

    result.innerHTML = `
            <strong>${data.prediction}</strong><br/>
            Probability: ${(data.probability * 100).toFixed(2)}%
          `;
  } catch (err) {
    result.style.display = "block";
    result.className = "result bad";
    result.textContent = err.message;
  }

  button.disabled = false;
  button.textContent = "Analyze Image";
};

export async function predictPneumonia(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://127.0.0.1:7860/predict", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Server error: ${text}`);
  }

  return response.json();
}
