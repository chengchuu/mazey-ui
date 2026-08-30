import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import { dts } from "rollup-plugin-dts";
import postcss from "rollup-plugin-postcss";
import { rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pkg from "../package.json" with { type: "json" };

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const resolveRoot = (...parts) => path.resolve(root, ...parts);
const input = resolveRoot("src/index.ts");
const packageVersion = process.env.PACKAGE_VERSION || pkg.version;
const banner = `/*! ${pkg.name} v${packageVersion} | ${pkg.license} License */`;
const reactExternals = [ "react", "react-dom" ];
const moduleExternals = (id) => id === "react" || id.startsWith("react/") || id === "react-dom" || id.startsWith("react-dom/");

function cleanDist() {
  return {
    name: "clean-dist",
    buildStart() {
      rmSync(resolveRoot("dist"), { recursive: true, force: true });
    },
  };
}

function sourcePlugin() {
  return typescript({
    compilerOptions: {
      declaration: false,
      declarationMap: false,
      noEmit: false,
    },
  });
}

export default [
  {
    input,
    external: moduleExternals,
    plugins: [
      cleanDist(),
      postcss({ extract: "styles.css", minimize: true, sourceMap: true }),
      sourcePlugin(),
    ],
    output: [
      { file: resolveRoot("dist/index.js"), format: "esm", sourcemap: true, banner },
      { file: resolveRoot("dist/index.cjs"), format: "cjs", sourcemap: true, banner, exports: "named" },
    ],
  },
  {
    input,
    external: reactExternals,
    plugins: [
      postcss({ inject: false }),
      replace({
        preventAssignment: true,
        "process.env.NODE_ENV": JSON.stringify("production"),
      }),
      nodeResolve({ exportConditions: [ "browser", "default" ] }),
      commonjs(),
      sourcePlugin(),
      terser({ format: { comments: /^!/ } }),
    ],
    output: {
      file: resolveRoot("dist/mazey-ui.min.js"),
      format: "iife",
      name: "MAZEY_UI",
      globals: { react: "React", "react-dom": "ReactDOM" },
      sourcemap: true,
      banner,
    },
  },
  {
    input,
    external: (id) => moduleExternals(id) || id.endsWith(".css"),
    plugins: [ dts() ],
    output: { file: resolveRoot("dist/index.d.ts"), format: "esm" },
  },
];
