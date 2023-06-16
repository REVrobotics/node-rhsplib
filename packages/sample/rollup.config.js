import excludeDependenciesFromBundle from "rollup-plugin-exclude-dependencies-from-bundle";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import addon from "rollup-plugin-natives";

import pkg from "./package.json" assert { type: "json" };

const PACKAGE_NAME = process.cwd();

const extensions = [".js", ".ts", ".tsx"];
const nodeOptions = {
    extensions,
};
const commonjsOptions = {
    ignoreGlobal: true,
    ignoreDynamicRequires: true,
    include: /node_modules/,
};

export default {
    input: `${PACKAGE_NAME}/dist/main.js`,
    output: [
        {
            file: "dist/output.js",
            format: "cjs",
        },
    ],
    plugins: [nodeResolve(nodeOptions), commonjs(commonjsOptions), json()],
    external: {
        dependencies: pkg.dependencies,
    },
};
