const fileInput = document.getElementById("fileInput");
const fileName = document.getElementById("fileName");

const compressBtn = document.getElementById("compressBtn");
const resetBtn = document.getElementById("resetBtn");

const originalSize = document.getElementById("originalSize");
const compressedSize = document.getElementById("compressedSize");
const ratio = document.getElementById("ratio");
const saved = document.getElementById("saved");

const status = document.getElementById("status");
const downloadBtn = document.getElementById("downloadBtn");

let selectedFile = null;
let downloadURL = null;


// File selection
fileInput.addEventListener("change", function () {

    selectedFile = fileInput.files[0];

    if (!selectedFile) {
        fileName.textContent = "No file selected";
        return;
    }

    fileName.textContent = selectedFile.name;

    originalSize.textContent = formatBytes(selectedFile.size);

    compressedSize.textContent = "-";
    ratio.textContent = "-";
    saved.textContent = "-";

    status.textContent = "";

    downloadBtn.style.display = "none";
});


// Compress file
compressBtn.addEventListener("click", async function () {

    if (!selectedFile) {
        status.textContent = "Please select a file first.";
        return;
    }

    if (!("CompressionStream" in window)) {

        status.textContent =
            "Your browser does not support file compression.";

        return;
    }

    try {

        status.textContent = "Compressing file...";

        compressBtn.disabled = true;

        // Read the selected file
        const data = await selectedFile.arrayBuffer();

        // Create gzip compression stream
        const stream = new Blob([data]).stream();

        const compressedStream =
            stream.pipeThrough(new CompressionStream("gzip"));

        // Convert stream to Blob
        const compressedBlob =
            await new Response(compressedStream).blob();

        const original = selectedFile.size;

        const compressed = compressedBlob.size;

        // Calculate compression ratio
        const compressionRatio =
            (compressed / original) * 100;

        // Calculate saved percentage
        const savedPercentage =
            ((original - compressed) / original) * 100;

        originalSize.textContent =
            formatBytes(original);

        compressedSize.textContent =
            formatBytes(compressed);

        ratio.textContent =
            compressionRatio.toFixed(2) + "%";

        if (savedPercentage > 0) {

            saved.textContent =
                savedPercentage.toFixed(2) + "%";

            status.textContent =
                "File compressed successfully!";

        } else {

            saved.textContent = "0%";

            status.textContent =
                "The compressed file is larger than the original.";
        }


        // Remove previous URL
        if (downloadURL) {
            URL.revokeObjectURL(downloadURL);
        }

        // Create download URL
        downloadURL =
            URL.createObjectURL(compressedBlob);

        downloadBtn.href = downloadURL;

        downloadBtn.download =
            selectedFile.name + ".gz";

        downloadBtn.style.display =
            "inline-block";

    }

    catch (error) {

        console.error(error);

        status.textContent =
            "Error while compressing the file.";

    }

    finally {

        compressBtn.disabled = false;

    }

});


// Reset
resetBtn.addEventListener("click", function () {

    fileInput.value = "";

    selectedFile = null;

    fileName.textContent =
        "No file selected";

    originalSize.textContent = "-";
    compressedSize.textContent = "-";
    ratio.textContent = "-";
    saved.textContent = "-";

    status.textContent = "";

    downloadBtn.style.display = "none";

    if (downloadURL) {

        URL.revokeObjectURL(downloadURL);

        downloadURL = null;
    }

});


// Convert bytes to readable format
function formatBytes(bytes) {

    if (bytes === 0) {
        return "0 Bytes";
    }

    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];

    const index =
        Math.floor(
            Math.log(bytes) / Math.log(1024)
        );

    return (
        (bytes / Math.pow(1024, index))
            .toFixed(2)
        + " "
        + units[index]
    );
}