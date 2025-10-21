// pdfGenerator.js
import PDFDocument from "pdfkit";

export function generateSoldPdf() {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    doc
      .font("Helvetica-Bold") // Arial Black alternatywa
      .fontSize(14)
      .text("Sold", { align: "center", valign: "center" });

    doc.end();
  });
}
