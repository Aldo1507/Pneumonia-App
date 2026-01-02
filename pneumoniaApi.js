import { Client } from "https://cdn.jsdelivr.net/npm/@gradio/client/dist/index.min.js";

const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const uploadText = document.getElementById("uploadText");
const button = document.getElementById("predictBtn");
const result = document.getElementById("result");

let selectedFile = null;

// Show image preview
input.addEventListener("change", function () {
  const file = input.files[0];
  selectedFile = file;

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.style.display = "block";
      uploadText.style.display = "none";
    };
    reader.readAsDataURL(file);
  } else {
    preview.style.display = "none";
    uploadText.style.display = "inline";
    selectedFile = null;
  }
});

// Handle Analyze Image button
button.addEventListener("click", async function () {
  if (!selectedFile) {
    alert("Please upload an image");
    return;
  }

  button.disabled = true;
  button.textContent = "Analyzing...";
  result.style.display = "none";

  try {
    // Try connecting with the direct HF Space URL
    let app;
    try {
      app = await Client.connect("aldodauti15/Pneumonia_App");
    } catch (e) {
      console.log("Trying alternative connection method...");
      // Try with the direct .hf.space URL
      app = await Client.connect("https://aldodauti15-pneumonia-app.hf.space");
    }

    // Call the prediction endpoint with the file
    const prediction = await app.predict("/predict_wrapper", [selectedFile]);

    console.log("Prediction result:", prediction);

    // Extract prediction and probability
    const predictionLabel = prediction.data[0];
    const probability = prediction.data[1];

    // Display result
    result.style.display = "block";
    result.className =
      "result " + (predictionLabel === "NORMAL" ? "good" : "bad");
    result.innerHTML =
      "<strong>" +
      predictionLabel +
      "</strong>Probability: " +
      probability.toFixed(2) +
      "%";
  } catch (err) {
    console.error("Full error:", err);
    result.style.display = "block";
    result.className = "result bad";
    result.innerHTML =
      "Error: " +
      err.message +
      "<br><small>Make sure your Space is running and public</small>";
  }

  button.disabled = false;
  button.textContent = "Analyze Image";
});
