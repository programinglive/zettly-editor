const fs = require('fs');
const Module = require('module');

const targetPath = require.resolve('standard-version/lib/lifecycles/changelog');

if (!Module._commiterPatchedFsFok) {
  const originalLoader = Module._extensions['.js'];

  Module._extensions['.js'] = function patchedLoader(module, filename) {
    if (filename === targetPath) {
      let source = fs.readFileSync(filename, 'utf8');
      if (source.includes('fs.F_OK')) {
        source = source.replace(/fs\.F_OK/g, 'fs.constants.F_OK');
      }
      module._compile(source, filename);
      return;
    }

    return originalLoader(module, filename);
  };

  Module._commiterPatchedFsFok = true;
}
