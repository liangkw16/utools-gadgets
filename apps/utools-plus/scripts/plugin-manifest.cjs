const fs = require('node:fs')
const path = require('node:path')

function buildDistPluginManifest (sourceManifest) {
  const { development, ...distManifest } = sourceManifest
  return distManifest
}

function readJsonFile (filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeDistPluginManifest (projectRoot = path.resolve(__dirname, '..')) {
  const sourcePath = path.join(projectRoot, 'public', 'plugin.json')
  const distPath = path.join(projectRoot, 'dist', 'plugin.json')
  const sourceManifest = readJsonFile(sourcePath)
  const distManifest = buildDistPluginManifest(sourceManifest)

  fs.writeFileSync(distPath, `${JSON.stringify(distManifest, null, 2)}\n`)
  return distPath
}

if (require.main === module) {
  const outputPath = writeDistPluginManifest()
  console.log(`[plugin-manifest] Wrote ${outputPath}`)
}

module.exports = {
  buildDistPluginManifest,
  writeDistPluginManifest
}
