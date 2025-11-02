// --- Globals and Setup ---

// This is the URL your actual backend API would live at
const API_URL = "${API_URL}";
let selectedFile = null;
let isSending = false;

// --- DOM Elements Cache ---
const imagePreview = document.getElementById("image-preview");
const placeholderText = document.getElementById("placeholder-text");
const sendBtn = document.getElementById("send-btn");
const messageText = document.getElementById("message-text");
const inputArea = document.getElementById("input-area");
const retryBtn = document.getElementById("retry-btn");
const fileInput = document.getElementById("file-input");
const uploadBtn = document.getElementById("upload-btn");
const cameraBtn = document.getElementById("camera-btn");

// Utility function for delay (used in mock API)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Core Functions ---

/**
 * Handles file selection from upload or camera.
 * @param {Event} event - The change event from the file input.
 */
function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
        selectedFile = files[0];

        // Create and display image preview
        const fileURL = URL.createObjectURL(selectedFile);
        imagePreview.src = fileURL;
        imagePreview.classList.remove("hidden");
        placeholderText.classList.add("hidden");

        // Update UI state
        messageText.textContent = `File selected: ${selectedFile.name}`;
        messageText.className = "text-lg font-medium text-gray-700";
        sendBtn.disabled = false;
        sendBtn.textContent = "Send for Verification";
    } else {
        // Clear state if the user cancels file selection
        resetAppState(false);
    }
}

/**
 * Simulates sending the image data to an external API.
 * You must replace the body of this function with your actual fetch logic.
 * @param {File} file - The file to be sent.
 * @returns {Promise<Object>} The mocked API response object.
 */
async function SendToAPI(file) {
    console.log(
        `Sending file to API. File size: ${(file.size / 1024).toFixed(2)} KB`
    );

    // 1. Convert file to FormData
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
    });

    return response;
}

/**
 * Initiates the image sending process.
 */
async function sendImage() {
    if (!selectedFile || isSending) return;

    isSending = true;

    // UI Update: Disable buttons and show loading
    sendBtn.disabled = true;
    uploadBtn.disabled = true;
    cameraBtn.disabled = true;
    sendBtn.textContent = "Verifying...";
    messageText.className =
        "text-lg font-medium text-primary-blue animate-pulse";
    messageText.textContent = "Processing photo, please wait...";

    try {
        const response = await SendToAPI(selectedFile);
        const result = await response.json();
        if (result.success && result.data) {
            displayResult(
                result.data.is_me,
                result.data.score,
                result.data.threshold
            );
        } else {
            if (response.status === 422) {
                displayError(
                    "No se ha podido detectar un rostro en la imagen. Por favor, prueba con otra imagen."
                );
                return;
            }
            displayError(
                "La verificación ha fallado. El servidor devolvió un estado no exitoso."
            );
        }
    } catch (error) {
        console.error("API Error:", error);
        displayError("Se produjo un error al conectar con el servidor.");
    } finally {
        isSending = false;
        // Re-enable input buttons are handled in displayResult/displayError,
        // which show the retry button instead.
    }
}

/**
 * Displays the final verification result to the user.
 * @param {boolean} isMe - The 'is_me' value from the API response.
 * @param {number} score - The confidence score.
 * @param {number} threshold - The verification threshold.
 */
function displayResult(isMe, score, threshold) {
    inputArea.classList.add("hidden");
    retryBtn.classList.remove("hidden");

    // Define the score display string without leading space/parentheses
    const scoreText = `Score: ${score.toFixed(2)} / Threshold: ${threshold}`;

    // Use flex-col and inner spans to stack the result and score, and apply vertical spacing (mt-1)
    messageText.className =
        "text-lg font-extrabold flex flex-col items-center justify-center";

    if (isMe) {
        messageText.innerHTML = `
            <span class="text-success-green">✅ Éxito! Eres tú.</span>
            <span class="text-sm font-medium text-gray-600 mt-1">(${scoreText})</span>
        `;
        imagePreview.parentElement.classList.remove("border-gray-300");
        imagePreview.parentElement.classList.add(
            "border-success-green",
            "border-4"
        );
    } else {
        messageText.innerHTML = `
            <span class="text-failure-red">❌ Fallo. Este no eres tú :(</span>
            <span class="text-sm font-medium text-gray-600 mt-1">(${scoreText})</span>
        `;
        imagePreview.parentElement.classList.remove("border-gray-300");
        imagePreview.parentElement.classList.add(
            "border-failure-red",
            "border-4"
        );
    }
}

/**
 * Displays an error message.
 * @param {string} msg - The error message.
 */
function displayError(msg) {
    messageText.textContent = "🚨 " + msg;
    messageText.className = "text-lg font-medium text-failure-red";

    inputArea.classList.add("hidden");
    retryBtn.classList.remove("hidden");
    sendBtn.disabled = true;
    uploadBtn.disabled = true;
    cameraBtn.disabled = true;
}

/**
 * Resets the application state for a new verification attempt.
 */
function resetApp() {
    resetAppState(true);
}

/**
 * Resets the application state to the initial condition.
 * @param {boolean} clearFile - Whether to clear the selected file.
 */
function resetAppState(clearFile) {
    if (clearFile) {
        selectedFile = null;
        // Clear preview
        if (imagePreview.src) URL.revokeObjectURL(imagePreview.src);
        imagePreview.src = "";
        imagePreview.classList.add("hidden");
        placeholderText.classList.remove("hidden");
    }

    // Reset UI elements
    messageText.textContent = "Please upload a new image or take a photo.";
    messageText.className = "text-lg font-medium text-gray-700";
    sendBtn.textContent = "Send for Verification";
    sendBtn.disabled = true;
    fileInput.value = ""; // Reset file input

    // Reset layout and buttons
    inputArea.classList.remove("hidden");
    retryBtn.classList.add("hidden");
    uploadBtn.disabled = false;
    cameraBtn.disabled = false;

    // Reset border
    const parent = imagePreview.parentElement;
    parent.classList.remove(
        "border-success-green",
        "border-failure-red",
        "border-4"
    );
    parent.classList.add("border-gray-300");
}

// Initial call to set the correct state on load
window.onload = () => {
    resetAppState(true);
};
