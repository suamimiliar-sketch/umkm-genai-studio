const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const midtransClient = require("midtrans-client");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ===========================
//  KONFIGURASI MIDTRANS SNAP
// ===========================

// MIDTRANS_ENV bisa: "sandbox" atau "production"
const isProduction = process.env.MIDTRANS_ENV === "production";

// Pilih serverKey berdasarkan mode
const serverKey = isProduction
  ? process.env.MIDTRANS_SERVER_KEY_PRODUCTION
  : process.env.MIDTRANS_SERVER_KEY_SANDBOX;

if (!serverKey) {
  console.warn(
    "[Midtrans] WARNING: Server key belum di-set. Cek env MIDTRANS_SERVER_KEY_SANDBOX / MIDTRANS_SERVER_KEY_PRODUCTION"
  );
}

const snap = new midtransClient.Snap({
  isProduction,
  serverKey,
});

console.log(`[Midtrans] Mode: ${isProduction ? "PRODUCTION" : "SANDBOX"}`);

// ============================================
//  ENDPOINT: BUAT TRANSAKSI & KIRIM SNAP TOKEN
// ============================================

app.post("/create-transaction", async (req, res) => {
  try {
    const { productName, amount } = req.body;

    const safeName = productName || "UMKM GenAI Poster License";
    const safeAmount = Number(amount) || 7500;

    const parameter = {
      transaction_details: {
        order_id: "ORDER-" + Date.now(),
        gross_amount: safeAmount,
      },
      item_details: [
        {
          id: "poster-license",
          price: safeAmount,
          quantity: 1,
          name: safeName,
        },
      ],
    };

    const transaction = await snap.createTransaction(parameter);

    res.json({ token: transaction.token });
  } catch (err) {
    console.error("Midtrans error:", err);
    res.status(500).json({ error: "Failed to create transaction" });
  }
});

// ===========================
//  START SERVER
// ===========================

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
