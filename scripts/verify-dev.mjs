const base = process.env.DEV_URL ?? "http://localhost:3000";

async function check(path) {
  const res = await fetch(`${base}${path}`);
  return { path, status: res.status, ok: res.ok };
}

try {
  const wizard = await check("/wizard");
  const home = await check("/");

  const html = await (await fetch(`${base}/wizard`)).text();
  const cssMatch = html.match(/\/_next\/static\/css\/app\/layout\.css[^"']*/);
  let cssStatus = 0;
  if (cssMatch) {
    cssStatus = (await fetch(`${base}${cssMatch[0]}`)).status;
  }

  const ok = wizard.ok && home.ok && cssStatus === 200;

  console.log(`wizard: ${wizard.status}, home: ${home.status}, css: ${cssStatus}`);

  if (!ok) {
    console.error("\n❌ Dev server broken (white/unstyled page). Run: npm run dev:clean\n");
    process.exit(1);
  }

  console.log("✓ Dev server OK");
} catch {
  console.error("\n❌ Dev server not reachable. Run: npm run dev:clean\n");
  process.exit(1);
}
