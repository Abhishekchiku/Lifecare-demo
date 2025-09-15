
  const pdfFileInput = document.getElementById("pdfFile");
  const processBtn = document.getElementById("processBtn");
  const dropZone = document.getElementById("dropZone");

  // Enable button when file selected
  pdfFileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      processBtn.disabled = false;
    }
  });

  // Click drop zone to trigger file input
  dropZone.addEventListener("click", () => pdfFileInput.click());

  // Drag over
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  // Drag leave 
  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  // Drop file
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    if (e.dataTransfer.files.length > 0) {
      pdfFileInput.files = e.dataTransfer.files;
      processBtn.disabled = false;
    }
  });

  processBtn.addEventListener("click", async () => {
    const file = pdfFileInput.files[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

    async function loadImage(url) {
      const bytes = await fetch(url).then(res => res.arrayBuffer());
      try {
        return await pdfDoc.embedPng(bytes);
      } catch (e) {
        return await pdfDoc.embedJpg(bytes);
      }
    }

    const headerImg = await loadImage("assets/img/header.png");
    const footerImg = await loadImage("assets/img/footer.png");

    const pages = pdfDoc.getPages();

    for (const page of pages) {
      const { width, height } = page.getSize();

      page.drawImage(headerImg, {
        x: 0,
        y: height - 100,
        width: width,
        height: 100
      });

      page.drawImage(footerImg, {
        x: 0,
        y: 0,
        width: width,
        height: 100
      });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    saveAs(blob, "modified_" + file.name);
  });
