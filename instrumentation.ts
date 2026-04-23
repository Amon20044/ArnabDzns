export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const dns = await import("node:dns");
  dns.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"]);
  console.log("[instrumentation] dns servers set to", dns.getServers());
}
