import { Hind_Siliguri, Noto_Naskh_Arabic, Noto_Sans_JP, Noto_Sans_KR, Noto_Sans_SC, Tiro_Bangla } from "next/font/google";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-ui", display: "swap" });
const tiroBangla = Tiro_Bangla({ subsets: ["bengali", "latin"], weight: "400", variable: "--font-serif", display: "swap" });
// CJK and Arabic families are large, so they load on demand instead of being preloaded.
const notoSC = Noto_Sans_SC({ weight: "500", variable: "--font-zh", display: "swap", preload: false });
const notoJP = Noto_Sans_JP({ weight: "500", variable: "--font-ja", display: "swap", preload: false });
const notoKR = Noto_Sans_KR({ weight: "500", variable: "--font-ko", display: "swap", preload: false });
const notoArabic = Noto_Naskh_Arabic({ weight: "500", variable: "--font-ar", display: "swap", preload: false });

export const metadata = {
  title: {
    default: "ভাষাসেতু — তৃতীয় ভাষা শিক্ষা",
    template: "%s · ভাষাসেতু",
  },
  description: "বাংলা থেকেই শুরু হোক নতুন ভাষার পথচলা। ম্যান্ডারিন, জাপানি, জার্মান, কোরিয়ান ও আরবি শিখুন।",
  applicationName: "ভাষাসেতু",
  openGraph: {
    title: "ভাষাসেতু — তৃতীয় ভাষা শিক্ষা",
    description: "বাংলা থেকেই শুরু হোক নতুন ভাষার পথচলা।",
    locale: "bn_BD",
    type: "website",
  },
};

export const viewport = {
  themeColor: "#173e34",
  colorScheme: "light",
};

const fontVariables = [hindSiliguri, tiroBangla, notoSC, notoJP, notoKR, notoArabic].map((font) => font.variable).join(" ");

export default function RootLayout({ children }) {
  return (
    <html lang="bn" className={fontVariables}>
      <body>
        <a className="skip-link" href="#main">মূল কনটেন্টে যান</a>
        {children}
      </body>
    </html>
  );
}
