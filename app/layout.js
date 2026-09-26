import "./globals.css";
import { BRAND } from "./lib/brand";

export const metadata={
 title:BRAND.ar+" | "+BRAND.en,
 description:"نحلتي تحوّل الأفكار والملفات والأسئلة إلى تجارب شرح بصرية تفاعلية تساعدك على رؤية طريق الفهم.",
 applicationName:BRAND.en
};

export const viewport={
 themeColor:"#080b12",
 colorScheme:"dark"
};

export default function Layout({children}){
 return <html lang="ar" dir="rtl"><body>{children}<div className="e2eSmokeBadge" data-e2e-smoke="issue-6" aria-label="اختبار التكامل رقم 6"><span aria-hidden="true">✓</span> E2E · #6</div></body></html>;
}
