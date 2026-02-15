import "./globals.css";
import DynamicHead from "./components/DynamicHead";
import CookieConsent from "./components/CookieConsent";

export const metadata = {
  title: "วิทยาลัยการอาชีพศีขรภูมิ | Sikhoraphum Industrial and Community Education College",
  description: "สร้างอนาคตของคุณที่วิทยาลัยระดับพรีเมียม ก้าวสู่ความเป็นเลิศทางวิชาการและทักษะแห่งอนาคต",
  keywords: "วิทยาลัย, การศึกษา, วิทยาลัยการอาชีพศีขรภูมิ, สมัครเรียน",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <DynamicHead />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Prompt:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
