export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const dns = process.getBuiltinModule("node:dns");
  dns.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"]);
  console.log("[instrumentation] dns servers set to", dns.getServers());
}
