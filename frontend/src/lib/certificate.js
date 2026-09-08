/**
 * Certificate Layout Constants
 * Target background dimension: 1024x1024 px
 * All coordinates are defined relative to the top-left (0,0).
 * Center X is 512.
 */
export const CERTIFICATE_LAYOUT = {
  // Center alignment axis
  CENTER_X: 512,

  // Text items
  SUBTITLE: {
    text: "THIS CERTIFICATE IS PROUDLY PRESENTED TO",
    y: 450,
    font: "bold 15px 'Outfit', 'Inter', sans-serif",
    fillStyle: "#85581A", // Dark Gold / Bronze
    textAlign: "center",
  },
  NAME: {
    y: 515,
    font: "bold 40px 'Georgia', 'Playfair Display', serif",
    fillStyle: "#0F172A", // Dark Slate / Charcoal
    textAlign: "center",
    maxWidth: 780,
  },
  FOR_EVENT_LABEL: {
    text: "for active participation and successful completion of",
    y: 575,
    font: "500 15px 'Outfit', 'Inter', sans-serif",
    fillStyle: "#475569", // Slate
    textAlign: "center",
  },
  EVENT_NAME: {
    y: 615,
    font: "bold 26px 'Outfit', 'Inter', sans-serif",
    fillStyle: "#1E3A8A", // Deep ACM Blue
    textAlign: "center",
    maxWidth: 780,
  },
  CERT_NUMBER: {
    y: 672,
    font: "600 13px 'Courier New', monospace",
    fillStyle: "#64748B", // Muted slate
    textAlign: "center",
    prefix: "CERTIFICATE NO: ",
  },
  DATE: {
    y: 695,
    font: "500 13px 'Outfit', 'Inter', sans-serif",
    fillStyle: "#64748B",
    textAlign: "center",
    prefix: "ISSUED ON: ",
  },
};

/**
 * Loads an image from a URL or relative path into an HTMLImageElement.
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error(`Failed to load certificate background image: ${src}`));
    img.src = src;
  });
}

/**
 * Renders participant and event details over the background template image on canvas.
 * 
 * @param {Object} options
 * @param {string} options.name Participant name
 * @param {string} options.eventName Name of the ACM event
 * @param {string} options.certificateNumber Unique certificate number
 * @param {string} [options.date] Issue date string (defaults to today's date formatted)
 * @param {string} [options.backgroundSrc] Background image path (default '/certificate-bg.png')
 * @returns {Promise<string>} Promise resolving to data URL (PNG)
 */
export async function generateCertificate({
  name,
  eventName,
  certificateNumber,
  date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  backgroundSrc = '/certificate-bg.png',
}) {
  const bgImg = await loadImage(backgroundSrc);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = bgImg.naturalWidth || 1024;
  canvas.height = bgImg.naturalHeight || 1024;

  // Draw background image
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  // Enable text anti-aliasing / high quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const layout = CERTIFICATE_LAYOUT;

  // 1. Subtitle header
  ctx.font = layout.SUBTITLE.font;
  ctx.fillStyle = layout.SUBTITLE.fillStyle;
  ctx.textAlign = layout.SUBTITLE.textAlign;
  ctx.fillText(layout.SUBTITLE.text, layout.CENTER_X, layout.SUBTITLE.y);

  // 2. Participant Name
  ctx.font = layout.NAME.font;
  ctx.fillStyle = layout.NAME.fillStyle;
  ctx.textAlign = layout.NAME.textAlign;
  ctx.fillText(name, layout.CENTER_X, layout.NAME.y, layout.NAME.maxWidth);

  // Decorative underline under participant name
  ctx.beginPath();
  ctx.moveTo(layout.CENTER_X - 160, layout.NAME.y + 15);
  ctx.lineTo(layout.CENTER_X + 160, layout.NAME.y + 15);
  ctx.strokeStyle = '#D97706'; // Gold line accent
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 3. "for active participation..."
  ctx.font = layout.FOR_EVENT_LABEL.font;
  ctx.fillStyle = layout.FOR_EVENT_LABEL.fillStyle;
  ctx.textAlign = layout.FOR_EVENT_LABEL.textAlign;
  ctx.fillText(layout.FOR_EVENT_LABEL.text, layout.CENTER_X, layout.FOR_EVENT_LABEL.y);

  // 4. Event Name
  ctx.font = layout.EVENT_NAME.font;
  ctx.fillStyle = layout.EVENT_NAME.fillStyle;
  ctx.textAlign = layout.EVENT_NAME.textAlign;
  ctx.fillText(eventName, layout.CENTER_X, layout.EVENT_NAME.y, layout.EVENT_NAME.maxWidth);

  // 5. Certificate Number
  ctx.font = layout.CERT_NUMBER.font;
  ctx.fillStyle = layout.CERT_NUMBER.fillStyle;
  ctx.textAlign = layout.CERT_NUMBER.textAlign;
  ctx.fillText(`${layout.CERT_NUMBER.prefix}${certificateNumber}`, layout.CENTER_X, layout.CERT_NUMBER.y);

  // 6. Issue Date
  ctx.font = layout.DATE.font;
  ctx.fillStyle = layout.DATE.fillStyle;
  ctx.textAlign = layout.DATE.textAlign;
  ctx.fillText(`${layout.DATE.prefix}${date}`, layout.CENTER_X, layout.DATE.y);

  // TODO: Optionally overlay a verification QR code on the canvas in a future release

  return canvas.toDataURL('image/png');
}

/**
 * Triggers browser download for a data URL or Blob.
 * 
 * @param {string|Blob} dataUrlOrBlob Data URL string or Blob object
 * @param {string} filename Output file name (e.g. 'ACM_Certificate.png')
 */
export function downloadCertificate(dataUrlOrBlob, filename = 'Certificate.png') {
  let url = dataUrlOrBlob;
  let isCreatedUrl = false;

  if (dataUrlOrBlob instanceof Blob) {
    url = URL.createObjectURL(dataUrlOrBlob);
    isCreatedUrl = true;
  }

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (isCreatedUrl) {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
