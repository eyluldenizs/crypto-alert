export const metadata = {
  title: "Crypto Alert",
  description: "Telegram crypto alert app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
