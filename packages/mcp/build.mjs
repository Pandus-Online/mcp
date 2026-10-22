// Builds dist/: ESM for the library and the CLI, plus type declarations. Usage: npm run build
import { execFileSync } from 'node:child_process';
import { rmSync, statSync } from 'node:fs';
import { build } from 'rolldown';

const dir = new URL('.', import.meta.url).pathname;
const dist = dir + 'dist/';
rmSync(dist, { recursive: true, force: true });

await build({
    cwd: dir,
    input: { index: 'src/index.ts', cli: 'src/cli.ts' },
    // The MCP SDK stays a dependency, not part of the bundle.
    external: [/^@modelcontextprotocol\/sdk/, /^node:/],
    platform: 'node',
    resolve: { extensionAlias: { '.js': ['.ts', '.js'] } },
    output: {
        dir: dist,
        format: 'esm',
        entryFileNames: '[name].mjs',
        chunkFileNames: '[name]-[hash].mjs',
        exports: 'named',
    },
});

execFileSync('npx', ['tsc', '-p', 'tsconfig.build.json'], {
    cwd: dir,
    stdio: 'inherit',
});

for (const name of ['index.mjs', 'cli.mjs']) {
    console.log(`${name}: ${statSync(dist + name).size} bytes`);
}
