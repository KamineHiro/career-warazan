import type { NextConfig } from "next";

const securityHeaders = [
  // クリックジャッキング防止: iframeへの埋め込みを禁止
  { key: "X-Frame-Options", value: "DENY" },
  // MIMEスニッフィング防止
  { key: "X-Content-Type-Options", value: "nosniff" },
  // リファラー情報を最小限に制限
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // 権限ポリシー: 不要なブラウザ機能を無効化
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // HTTPS強制（Vercel環境）
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
