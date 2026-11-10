import typescript from 'rollup-plugin-typescript2';

function entryPoints() {
  return {
    name: 'entry-points',
    renderChunk(code, chunk, outputOptions) {
      if (!chunk.isEntry) {
        return null;
      }

      // biome-ignore format: keep chained method calls on separate lines for readability
      const wrappers = chunk.exports
        .map(name => `function ${name}() { ${outputOptions.name}.${name}(); }`)
        .join('\n');

      return { code: `${code}\n\n${wrappers}\n`, map: null };
    }
  };
}

export default [
  {
    input: 'src/main.ts',
    output: {
      file: 'dist/Code.gs',
      format: 'iife',
      name: 'Subplayo'
    },
    plugins: [typescript(), entryPoints()]
  },
  {
    input: 'src/settings.ts',
    output: {
      file: 'dist/Settings.gs',
      format: 'iife',
      name: 'settings'
    },
    plugins: [typescript()]
  }
];
