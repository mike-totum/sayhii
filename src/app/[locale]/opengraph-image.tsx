import { ImageResponse } from "next/og";

export const alt =
  "sayhii: real-time employee insight in 3 seconds a day. Deeper data. Happier employees. Less turnover.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Fetching css2 without a browser UA makes Google Fonts return TTF, which
// satori can consume directly. Falls back to satori's default font if the
// network is unavailable at build time.
async function loadGoogleFont(family: string, text: string) {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const match = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
    if (!match) return null;
    return await (await fetch(match[1])).arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image() {
  const sansText =
    "sayhii. Deeper data. Happier Less turnover. 3 seconds a day 90%+ daily adoption sayhii.io";
  const serifText = "hii. employees. 3 90%+";
  const [geist, serif] = await Promise.all([
    loadGoogleFont("Geist:wght@600", sansText),
    loadGoogleFont("Instrument+Serif:ital@1", serifText),
  ]);

  const fonts = [
    geist && { name: "Geist", data: geist, style: "normal" as const, weight: 600 as const },
    serif && { name: "Instrument Serif", data: serif, style: "italic" as const, weight: 400 as const },
  ].filter((f) => f !== null);

  const serifFamily = serif ? "Instrument Serif" : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#fbf7f2",
          backgroundImage:
            "radial-gradient(circle at 88% 0%, #ffe4cf 0%, rgba(255,228,207,0) 42%), radial-gradient(circle at 0% 100%, #e6efe8 0%, rgba(230,239,232,0) 40%), radial-gradient(circle at 70% 100%, #d9e7f0 0%, rgba(217,231,240,0) 30%)",
          fontFamily: geist ? "Geist" : undefined,
          color: "#0f1117",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", fontSize: 44 }}>
            <span style={{ fontWeight: 600, letterSpacing: -1 }}>say</span>
            <span
              style={{
                fontFamily: serifFamily,
                fontStyle: "italic",
                color: "#ff6b5b",
              }}
            >
              hii
            </span>
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: 9,
                backgroundColor: "#ff6b5b",
                marginLeft: 5,
                marginBottom: 6,
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 64,
              fontSize: 76,
              fontWeight: 600,
              letterSpacing: -3,
              lineHeight: 1.04,
            }}
          >
            <span>Deeper data.</span>
            <span style={{ display: "flex" }}>
              Happier&nbsp;
              <span style={{ fontFamily: serifFamily, fontStyle: "italic", fontWeight: 400 }}>
                employees.
              </span>
            </span>
            <span>Less turnover.</span>
          </div>

          <div style={{ display: "flex", gap: 14, marginTop: "auto" }}>
            {["3 seconds a day", "90%+ daily adoption"].map((chip) => (
              <div
                key={chip}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  border: "1px solid #ebe4da",
                  backgroundColor: "#ffffff",
                  borderRadius: 999,
                  padding: "12px 24px",
                  fontSize: 24,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 10,
                    backgroundColor: "#7da88a",
                  }}
                />
                {chip}
              </div>
            ))}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginLeft: "auto",
                fontSize: 24,
                color: "#5a5751",
              }}
            >
              sayhii.io
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 330,
          }}
        >
          <div
            style={{
              display: "flex",
              backgroundColor: "#ff6b5b",
              color: "#ffffff",
              borderRadius: 60,
              padding: "26px 48px",
              fontSize: 56,
              fontFamily: serifFamily,
              fontStyle: "italic",
              boxShadow: "0 24px 60px -20px rgba(255,107,91,0.55)",
            }}
          >
            hii.
          </div>
          <svg
            width="220"
            height="300"
            viewBox="0 0 80 110"
            fill="none"
            stroke="#ff6b5b"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginTop: 8 }}
          >
            <circle cx="34" cy="18" r="11" />
            <line x1="34" y1="29" x2="34" y2="68" />
            <line x1="34" y1="40" x2="20" y2="58" />
            <line x1="34" y1="40" x2="58" y2="22" />
            <path d="M62 16 q5 0 5 6" strokeWidth="2" />
            <path d="M67 11 q7 0 7 9" strokeWidth="2" />
            <line x1="34" y1="68" x2="22" y2="96" />
            <line x1="34" y1="68" x2="46" y2="96" />
          </svg>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fonts.length > 0 ? fonts : undefined,
    },
  );
}
