import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = new URL("..", import.meta.url);
const pkg = JSON.parse(readFileSync(new URL("package.json", root), "utf8"));

function packagePath(value, fieldName) {
  assert.equal(typeof value, "string", `${fieldName} must be a string`);
  assert.ok(value.trim(), `${fieldName} must not be empty`);
  assert.ok(!value.startsWith("/") && !value.split(/[\\/]/).includes(".."), `${fieldName} must stay inside the package`);
  return value.replace(/^\.\//, "");
}

function collectExports(value, fieldName = "exports") {
  if (typeof value === "string") return [{ fieldName, path: packagePath(value, fieldName) }];
  assert.ok(value && typeof value === "object" && !Array.isArray(value), `${fieldName} must be an object or string`);
  return Object.entries(value).flatMap(([key, entry]) => {
    const nextName = `${fieldName}[${JSON.stringify(key)}]`;
    return collectExports(entry, nextName);
  });
}

function collectBins(value) {
  if (value === undefined) return [];
  if (typeof value === "string") return [{ fieldName: "bin", path: packagePath(value, "bin") }];
  assert.ok(value && typeof value === "object" && !Array.isArray(value), "bin must be an object or string");
  return Object.entries(value).map(([name, target]) => ({
    fieldName: `bin.${name}`,
    path: packagePath(target, `bin.${name}`),
  }));
}

assert.ok(pkg.exports, "exports is required");
assert.ok(Array.isArray(pkg.files) && pkg.files.length > 0, "files must be a non-empty array");
for (const [index, value] of pkg.files.entries()) {
  const target = packagePath(value, `files[${index}]`);
  assert.ok(existsSync(join(root.pathname, target)), `files[${index}] target is missing: ${value}`);
}

const requiredTargets = [
  ...collectExports(pkg.exports),
  ...collectBins(pkg.bin),
];
if (pkg.types) {
  requiredTargets.push({ fieldName: "types", path: packagePath(pkg.types, "types") });
}

for (const target of requiredTargets) {
  assert.ok(existsSync(join(root.pathname, target.path)), `${target.fieldName} target is missing: ${target.path}`);
}

const packed = spawnSync("npm", ["pack", "--dry-run", "--json"], {
  cwd: root,
  encoding: "utf8",
});
if (packed.status !== 0) {
  process.stderr.write(packed.stderr);
  process.stderr.write(packed.stdout);
  process.exit(packed.status ?? 1);
}

const [manifest] = JSON.parse(packed.stdout);
const packedPaths = new Set(manifest.files.map((file) => file.path));
for (const target of requiredTargets) {
  assert.ok(packedPaths.has(target.path), `${target.fieldName} target is missing from npm pack output: ${target.path}`);
}

for (const required of ["package.json", "README.md", "SECURITY.md", "LICENSE"]) {
  assert.ok(packedPaths.has(required), `npm pack output is missing ${required}`);
}

const allowed = /^(package\.json|README\.md|SECURITY\.md|LICENSE|dist\/|examples\/)/;
for (const packedPath of packedPaths) {
  assert.ok(allowed.test(packedPath), `unexpected file in npm pack output: ${packedPath}`);
}

console.log(`package surface looks good (${manifest.entryCount} packed files).`);
