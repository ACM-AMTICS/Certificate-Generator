# ACM Event Certificate Generator - Frontend MVP

An interactive, responsive Single-Page Application (SPA) built for the **ACM Student Chapter** to manage event certificate issuing and participant self-service claims.

---

## 🚀 Tech Stack & Design Choices

- **Build Tool & Framework**: Vite + React 18 (Functional components & hooks only)
- **Routing**: `react-router-dom` v6
- **HTTP Client**: Modular `fetch` wrapper (`src/lib/api.js`) with normalized error handling
- **QR Code Library**: `qrcode.react` (`QRCodeSVG`)
  - *Justification*: `qrcode.react` was selected because it provides declarative, zero-dependency SVG and Canvas components natively designed for React. Unlike vanilla `qrcode` or canvas wrappers, it integrates cleanly into component state and supports custom logo overlay without manual DOM manipulation.
- **Certificate Rendering**: HTML5 Canvas (`src/lib/certificate.js`)
  - Fully client-side image processing overlaying text onto `certificate-bg.png` without sending binary files to the backend.
- **Styling**: Vanilla CSS (`src/index.css`) with custom CSS variables, glassmorphism design, dark/light theme accents, and responsive layout for mobile participant scanning.

---

## 🛠️ Environment Setup

Create or update `.env` in the `frontend/` root directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_DEFAULT_EVENT_ID=gsoc-2026
```

> **Note**: `VITE_DEFAULT_EVENT_ID` is used only as a dev convenience fallback for `/dashboard`. The claim page always extracts `eventId` directly from the route parameter `/claim/:eventId`.

---

## 🏁 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The application will start at `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```

---

## 🔌 Connection to FastAPI Backend

The frontend communicates with the Phase 1 FastAPI backend using three endpoints:

1. **`GET /api/events/{event_id}`**
   - Used by both Dashboard and Claim pages on mount to fetch event title, description, and active status.
   - Throws normalized 404 / 400 error states if event is inactive or not found.

2. **`POST /api/events/{event_id}/claim`**
   - Payload: `{ "name": "Participant Name", "device_token": "UUID..." }`
   - Returns certificate number on 201 success or 200 duplicate claim.
   - 409 Conflict errors are intercepted and surfaced as an informative duplicate notice allowing local certificate re-download.

3. **`GET /api/events/{event_id}/registrations`**
   - Used by the Admin Dashboard to fetch the list of issued certificates and display participant count.

---

## 🎨 Canvas Coordinate Customization

The canvas text overlay coordinates in `src/lib/certificate.js` can be adjusted via the exported `CERTIFICATE_LAYOUT` object:

```javascript
export const CERTIFICATE_LAYOUT = {
  CENTER_X: 512, // 1024x1024 image center
  SUBTITLE: { y: 450, ... },
  NAME: { y: 515, font: "bold 40px 'Georgia', serif", ... },
  FOR_EVENT_LABEL: { y: 575, ... },
  EVENT_NAME: { y: 615, ... },
  CERT_NUMBER: { y: 672, ... },
  DATE: { y: 695, ... },
};
```

---

## 📱 Device Token Duplicate Detection

On initial load of the claim page, `getDeviceToken()` in `src/lib/api.js` checks `localStorage.getItem('device_token')`. If absent, a unique token is generated using `crypto.randomUUID()` and saved. This token accompanies every claim request, enabling the backend to detect and handle duplicate claim attempts per browser seamlessly.
