// Backend/utils/generateReturnLabel.js
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const bwipjs = require("bwip-js");
const { returnLabelTexts } = require("../translations/emailTexts");


exports.generateReturnLabel = async ({ returnId, user, orderId, productId }) => {
    try {

        const lang = user.lang || "fr";
        const t = returnLabelTexts[lang] || returnLabelTexts.fr;

        const dir = path.join(__dirname, "..", "public", "etiquettes");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const filePath = path.join(dir, `${returnId}_${productId}.pdf`);
        const doc = new PDFDocument({ size: "A4", margin: 40 });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        const logoPath = path.join(__dirname, "..", "public", "logo.jpg");
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 40, 40, { width: 100 });
        }

        // TITRE
        doc.fontSize(24).text(t.title, 0, 50, { align: "center" });

        // INFOS CLIENT
        let y = 150;

        doc.fontSize(14).text(`${t.client} : ${user.prenom} ${user.nom}`, 40, y);

        const address = user.addresses?.[0];

        if (address) {
            doc.text(`${t.address} : ${address.street}`, 40, y + 20)
                .text(`${address.postalCode} ${address.city}`)
                .text(address.country);
        } else {
            doc.text(t.noAddress, 40, y + 20);
        }

        doc.text(`${t.email} : ${user.email}`, 40, y + 80);
        doc.text(`${t.order} : ${orderId}`, 40, y + 100);
        doc.text(`${t.product} : ${productId}`, 40, y + 120);
        doc.text(`${t.returnId} : ${returnId}`, 40, y + 140);

        // ADRESSE RETOUR
        y = 350;

        doc.fontSize(16).text(`${t.returnAddress} :`, 40, y, { underline: true });

        doc.fontSize(14).text("Algarve Parfume", 40, y + 30);
        doc.text("Av. Francisco Sá Carneiro", 40, y + 50);
        doc.text("8125-507 Quarteira", 40, y + 70);
        doc.text("Portugal", 40, y + 90);


        const qrData = `https://parfumealgarve.com/returns/${returnId}`;

        const qrImage = await QRCode.toDataURL(qrData);
        const qrBuffer = Buffer.from(qrImage.split(",")[1], "base64");

        doc.image(qrBuffer, 350, 350, { width: 180 });

        doc.fontSize(12).text(t.qrText, 350, 540);


        const barcodePng = await bwipjs.toBuffer({
            bcid: "code128",
            text: returnId.toString(),
            scale: 3,
            height: 12,
            includetext: true,
            textxalign: "center",
        });

        doc.image(barcodePng, 40, 600, { width: 350 });

        doc.end();

        await new Promise((resolve) => stream.on("finish", resolve));

        return `http://localhost:5001/etiquettes/${returnId}_${productId}.pdf`;

    } catch (error) {
        console.error("❌ Generate Return Label Error:", error);
        throw error;
    }
};












/*
exports.generateReturnLabel = async ({ returnId, user, orderId, productId }) => {
    try {

        const dir = path.join(__dirname, "..", "public", "etiquettes");
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const filePath = path.join(dir, `${returnId}_${productId}.pdf`);
        const doc = new PDFDocument({ size: "A4", margin: 40 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);
   
        const logoPath = path.join(__dirname, "..", "public", "logo.jpg");
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 40, 40, { width: 100 });
        }

        doc.fontSize(24).text("Étiquette de retour", 0, 50, { align: "center" });
    
        let y = 150;
        doc.fontSize(14).text(`Client : ${user.prenom} ${user.nom}`, 40, y);

        const address = user.addresses?.[0]; 
        if (address) {
            doc.text(`Adresse : ${address.street}`, 40, y + 20)
                .text(`${address.postalCode} ${address.city}`)
                .text(address.country);
        } else {
            doc.text("Aucune adresse enregistrée", 40, y + 20);
        }

        doc.text(`Email : ${user.email}`, 40, y + 80);
        doc.text(`Commande : ${orderId}`, 40, y + 100);
        doc.text(`Produit : ${productId}`, 40, y + 120);
        doc.text(`Retour : ${returnId}`, 40, y + 140);


        y = 350;
        doc.fontSize(16).text("Adresse de retour :", 40, y, { underline: true });
        doc.fontSize(14).text("Algarve Parfume", 40, y + 30);
        doc.text("Av. Francisco Sá Carneiro", 40, y + 50);
        doc.text("8125-507 Quarteira", 40, y + 70);
        doc.text("Portugal", 40, y + 90);

  
        const qrData = `https://parfumealgarve.com/returns/${returnId}`;
        const qrImage = await QRCode.toDataURL(qrData);
        const qrBuffer = Buffer.from(qrImage.split(",")[1], "base64");
        doc.image(qrBuffer, 350, 350, { width: 180 });
        doc.fontSize(12).text("Scanner pour suivre le retour", 350, 540);

   
        const barcodePng = await bwipjs.toBuffer({
            bcid: "code128",
            text: returnId.toString(),
            scale: 3,
            height: 12,
            includetext: true,
            textxalign: "center",
        });
        doc.image(barcodePng, 40, 600, { width: 350 });
        doc.end();
        await new Promise((resolve) => stream.on("finish", resolve));

        return `http://localhost:5001/etiquettes/${returnId}_${productId}.pdf`;

    } catch (error) {
        console.error("❌ Generate Return Label Error:", error);
        throw error;
    }
};
*/



