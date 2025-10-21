// licenseGenerator.js
import PDFDocument from "pdfkit";

export function generateLicensePdf({ trackTitle, clientEmail }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Dzisiejsza data
    const today = new Date().toLocaleDateString("en-GB"); // format: DD/MM/YYYY

    // Nagłówek na środku
    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .text("Wavetrace Music License Agreement", { align: "center" })
      .moveDown(2);

    // Track Title, Licensee, Date
    doc
      .font("Helvetica")
      .fontSize(12)
      .text(`Track Title: ${trackTitle}`)
      .text(`Licensee: ${clientEmail}`)
      .text(`Date of Issue: ${today}`)
      .moveDown(1);

    // Sekcje licencji
    doc.font("Helvetica-Bold").text("1. Grant of License").moveDown(0.2);
    doc
      .font("Helvetica")
      .text(
        `Wavetrace (“Licensor”) hereby grants the Licensee a non-exclusive, worldwide, perpetual license to use the musical composition titled ${trackTitle} (the “Track”) for commercial and non-commercial purposes, including but not limited to:`
      )
      .moveDown(0.2);

    // Wypunktowanie
    const uses = [
      "Films, television, and web series",
      "Video games",
      "Theater performances and live shows",
      "Social media content, including Instagram reels, TikTok videos, and YouTube content",
      "Podcasts and audio productions",
      "Advertising campaigns, commercials, and promotional materials",
      "Trailers and marketing content",
    ];
    uses.forEach((item) => doc.text(`- ${item}`));
    doc
      .moveDown(0.2)
      .text(
        "The Licensee may use, reproduce, modify, adapt, and distribute the Track in these contexts."
      )
      .moveDown(1);

    // Restriction
    doc.font("Helvetica-Bold").text("2. Restrictions").moveDown(0.2);
    const restrictions = [
      "The Licensee may not resell or redistribute the Track as a standalone audio file.",
      "The Licensee may not claim authorship of the Track.",
      "The Licensee may not use the Track in content that promotes illegal activities, hate speech, or content otherwise deemed inappropriate by law.",
    ];
    restrictions.forEach((item) => doc.text(`- ${item}`));
    doc.moveDown(1);

    // Ownership
    doc.font("Helvetica-Bold").text("3. Ownership").moveDown(0.2);
    doc
      .font("Helvetica")
      .text(
        "All rights, title, and interest in the Track remain the exclusive property of Wavetrace. This license does not transfer ownership of the Track to the Licensee."
      )
      .moveDown(1);

    // Warranty
    doc
      .font("Helvetica-Bold")
      .text("4. Warranty Disclaimer & Limitation of Liability")
      .moveDown(0.2);
    doc
      .font("Helvetica")
      .text(
        "The Track is provided “as-is.” Wavetrace makes no warranties regarding the Track’s fitness for a particular purpose. Wavetrace shall not be liable for any direct, indirect, incidental, or consequential damages arising from the Licensee’s use of the Track."
      )
      .moveDown(1);

    // Term
    doc.font("Helvetica-Bold").text("5. Term").moveDown(0.2);
    doc
      .font("Helvetica")
      .text("This license is perpetual and does not expire.")
      .moveDown(1);

    // Governing Law
    doc.font("Helvetica-Bold").text("6. Governing Law").moveDown(0.2);
    doc
      .font("Helvetica")
      .text(
        "This Agreement shall be governed by and construed in accordance with the laws of Poland. Any disputes arising under this license shall be subject to the exclusive jurisdiction of the courts in Poland."
      )
      .moveDown(1);

    // Miscellaneous
    doc.font("Helvetica-Bold").text("7. Miscellaneous").moveDown(0.2);
    const misc = [
      "This license represents the entire agreement between Wavetrace and the Licensee regarding the Track.",
      "Any amendments to this license must be in writing and signed by both parties.",
      "By using the Track, the Licensee agrees to the terms outlined in this license.",
    ];
    misc.forEach((item) => doc.text(`- ${item}`));
    doc.moveDown(2);

    // Licensor info
    doc
      .font("Helvetica-Bold")
      .text("Licensor: Wavetrace")
      .text("www.wavetrace.net", { link: "https://www.wavetrace.net" });

    doc.end();
  });
}
