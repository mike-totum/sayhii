import { ImageResponse } from "next/og";

export const alt =
  "sayhii: a million tiny answers, one clear picture. Real-time employee insight in 3 seconds a day.";
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

// Deterministic scatter so the image is identical on every build.
function dotScatter(n: number) {
  let seed = 1234567;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  return Array.from({ length: n }, (_, i) => ({
    left: Math.round(rand() * 1180),
    top: Math.round(rand() * 610),
    size: rand() < 0.85 ? 3 : 5,
    coral: i % 23 === 0,
    alpha: 0.1 + rand() * 0.14,
  }));
}

const DOTS = dotScatter(220);

export default async function Image() {
  const serifText =
    "A million tiny answers. One clear picture. sayhii. 3 seconds a day 90%+ daily adoption sayhii.io · ";
  const [serif, serifItalic] = await Promise.all([
    loadGoogleFont("Newsreader:opsz,wght@6..72,400", serifText),
    loadGoogleFont("Newsreader:ital,opsz,wght@1,6..72,400", serifText),
  ]);

  const fonts = [
    serif && {
      name: "Newsreader",
      data: serif,
      style: "normal" as const,
      weight: 400 as const,
    },
    serifItalic && {
      name: "Newsreader",
      data: serifItalic,
      style: "italic" as const,
      weight: 400 as const,
    },
  ].filter((f) => f !== null);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fcfcfa",
          color: "#111117",
          fontFamily: serif ? "Newsreader" : undefined,
          padding: "64px 72px",
          position: "relative",
        }}
      >
        {DOTS.map((d, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: d.left,
              top: d.top,
              width: d.size,
              height: d.size,
              borderRadius: 99,
              backgroundColor: d.coral
                ? "rgba(255,77,46,0.85)"
                : `rgba(17,17,23,${d.alpha})`,
            }}
          />
        ))}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(17,17,23,0.15)",
            paddingBottom: 20,
            fontSize: 26,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <span>say</span>
            <span style={{ fontStyle: "italic", color: "#ff4d2e" }}>hii</span>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: 7,
                backgroundColor: "#ff4d2e",
                marginLeft: 4,
                marginTop: 10,
              }}
            />
          </div>
          <span style={{ color: "rgba(17,17,23,0.55)" }}>sayhii.io</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            fontSize: 84,
            letterSpacing: -2,
            lineHeight: 1.04,
          }}
        >
          <span>A million tiny answers.</span>
          <span style={{ fontStyle: "italic" }}>One clear picture.</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            borderTop: "1px solid rgba(17,17,23,0.15)",
            paddingTop: 22,
            fontSize: 26,
            color: "rgba(17,17,23,0.65)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 10,
                backgroundColor: "#ff4d2e",
              }}
            />
            <span>3 seconds a day</span>
          </div>
          <span>·</span>
          <span>90%+ daily adoption</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fonts.length > 0 ? fonts : undefined,
    },
  );
}
