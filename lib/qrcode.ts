import QRCode from "qrcode";

/**
 * Generate a Data URL for a QR code linking to the verification page.
 */
export async function generateVerificationQR(transactionId: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/v/${transactionId}`;
  
  try {
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: "#0a4a1c", // hyde-dark
        light: "#ffffff",
      },
    });
    return qrDataUrl;
  } catch (err) {
    console.error("QR_GEN_ERROR:", err);
    throw new Error("Failed to generate QR code");
  }
}
