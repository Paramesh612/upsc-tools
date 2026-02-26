async function scalePDFs() {
    const input = document.getElementById('pdfInput');
    const scaleValue = document.getElementById('scaleInput').value.trim();
    const status = document.getElementById('status');

    if (!input.files.length) {
        alert("Please select at least one PDF.");
        return;
    }

    let scale = parseFloat(scaleValue);

    if (scale > 1) {
        scale = scale / 100;
    }

    if (isNaN(scale) || scale <= 0) {
        alert("Invalid scale value.");
        return;
    }

    status.innerText = "Processing...";

    for (let file of input.files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        const newPdf = await PDFLib.PDFDocument.create();

        const pages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());

        for (let page of pages) {
            const { width, height } = page.getSize();

            const verticalShift = height - (height * scale);

            const embeddedPage = await newPdf.embedPage(page);

            const newPage = newPdf.addPage([width, height]);

            newPage.drawPage(embeddedPage, {
                x: 0,
                y: verticalShift,
                xScale: scale,
                yScale: scale,
            });
        }

        const pdfBytes = await newPdf.save();

        const baseName = file.name.replace(".pdf", "");
        const outputName = `${baseName} - Scaled to ${Math.round(scale * 100)} percent.pdf`;

        downloadFile(pdfBytes, outputName);
    }

    status.innerText = "Done!";
}

function downloadFile(bytes, filename) {
    const blob = new Blob([bytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}