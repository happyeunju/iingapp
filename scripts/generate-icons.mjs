import sharp from "sharp";
import { mkdirSync } from "node:fs";

// 다크 배경에 "iing" 텍스트가 들어간 정사각형 아이콘
const svg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <text x="256" y="320"
        font-family="-apple-system, system-ui, 'Segoe UI', Roboto, sans-serif"
        font-size="220"
        font-weight="800"
        fill="#ffffff"
        text-anchor="middle"
        letter-spacing="-8">iing</text>
  <circle cx="170" cy="135" r="22" fill="#38bdf8"/>
</svg>
`;

const sizes = [192, 512, 180];

mkdirSync("apps/web/public", { recursive: true });

for (const size of sizes) {
  const out = `apps/web/public/icon-${size}.png`;
  await sharp(Buffer.from(svg(size)))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log(`✓ ${out} (${size}x${size})`);
}

// 마스터 SVG도 저장 (편집 가능 원본)
import { writeFileSync } from "node:fs";
writeFileSync("apps/web/public/icon.svg", svg(512));
console.log("✓ apps/web/public/icon.svg (master)");
