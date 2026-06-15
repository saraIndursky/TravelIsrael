import net from "node:net";

const PORT = 3000;

const inUse = await new Promise((resolve) => {
  const server = net.createServer();
  server.once("error", (err) => {
    resolve(err.code === "EADDRINUSE");
  });
  server.once("listening", () => {
    server.close(() => resolve(false));
  });
  server.listen(PORT);
});

if (inUse) {
  console.error(
    "\n❌ שרת dev רץ על פורט 3000. עצרי אותו (Ctrl+C) לפני npm run build.\n"
  );
  process.exit(1);
}
