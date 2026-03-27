//generateInvoiceBuffer.js
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoice = (order, user, address) => {
    return new Promise((resolve, reject) => {
        const invoicesDir = path.join(__dirname, "../public/invoices");

        if (!fs.existsSync(invoicesDir)) {
            fs.mkdirSync(invoicesDir, { recursive: true });
        }

        const invoicePath = path.join(invoicesDir, `invoice-${order._id}.pdf`);
        console.log("PDF généré :", invoicePath);
        const doc = new PDFDocument({ margin: 50 }); // <-- declare doc first
        // --- LOGO ---
        const logoPath = path.join(__dirname, "..", "public", "logo.jpg");
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 40, 40, { width: 100 });
        }


        const stream = fs.createWriteStream(invoicePath);

        stream.on("finish", () => resolve(invoicePath));
        stream.on("error", reject);

        doc.pipe(stream);

        doc.fontSize(20).text("FACTURE", { align: "center" }).moveDown();

        doc.fontSize(12)
            .text(`Commande : ${order._id}`)
            .text(`Date : ${order.createdAt.toLocaleDateString()}`)
            .moveDown();

        doc.fontSize(14).text("Client", { underline: true }).moveDown(0.5);
        doc.fontSize(12).text(`${user.prenom} ${user.nom}`);

        if (address) {
            doc.text(address.street)
                .text(`${address.postalCode} ${address.city}`)
                .text(address.country);
        } else {
            doc.text("Aucune adresse enregistrée");
        }

        doc.moveDown();

        doc.fontSize(14).text("Articles", { underline: true }).moveDown(0.5);

        order.items.forEach(item => {
            const total = parseFloat(item.options.prix) * item.quantite;
            doc.fontSize(12).text(
                `${item.nom} - ${item.options.size}${item.options.unit} x${item.quantite} : ${total.toFixed(2)} €`
            );
        });

        doc.moveDown();
        doc.fontSize(16).text(`Total : ${order.totalPrice} €`, { align: "right" });

        doc.end();
    });
};

module.exports = generateInvoice;

