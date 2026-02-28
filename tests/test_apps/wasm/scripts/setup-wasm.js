import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const wasmPkgRoot = path.join(rootDir, "node_modules/@kreuzberg/wasm");
const pkgDir = path.join(wasmPkgRoot, "dist/pkg");
const srcDir = path.join(__dirname, "../../..", "kreuzberg/crates/kreuzberg-wasm/pkg");

function copyWasmFiles() {
	try {
		if (!fs.existsSync(pkgDir)) {
			fs.mkdirSync(pkgDir, { recursive: true });
		}

		// Copy local WASM build artifacts into dist/pkg if available.
		// This is optional -- the published npm package already ships dist/pkg/.
		if (fs.existsSync(srcDir)) {
			const files = fs.readdirSync(srcDir);
			const wasmFiles = files.filter(
				(f) => f.startsWith("kreuzberg_wasm") || f === "LICENSE" || f === "README.md" || f === "package.json",
			);

			for (const file of wasmFiles) {
				const src = path.join(srcDir, file);
				const dest = path.join(pkgDir, file);

				if (fs.statSync(src).isFile()) {
					fs.copyFileSync(src, dest);
					console.log(`Copied ${file}`);
				}
			}
		} else {
			console.log("Local WASM build not found; using published npm package binaries.");
		}

		// The WASM loader's loadWasmBinaryForNode() resolves the .wasm binary relative
		// to dist/ as "../pkg/kreuzberg_wasm_bg.wasm", which points to <package_root>/pkg/.
		// Create a symlink from <package_root>/pkg -> <package_root>/dist/pkg so the
		// Node.js loader can find the binary.
		const rootPkgDir = path.join(wasmPkgRoot, "pkg");
		if (!fs.existsSync(rootPkgDir)) {
			fs.symlinkSync(pkgDir, rootPkgDir, "dir");
			console.log("Created symlink: pkg -> dist/pkg");
		}

		console.log("WASM binaries setup complete!");
	} catch (error) {
		console.error("Error setting up WASM binaries:", error.message);
		process.exit(1);
	}
}

copyWasmFiles();
