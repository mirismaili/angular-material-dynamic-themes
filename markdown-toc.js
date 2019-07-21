/**
 * Markdown-TOC (Table of Contents)
 *
 * @author {@link https://mirismaili.github.io S. Mahdi Mir-Ismaili}
 * Created at 1398/3/22 (2019/6/12).
 */
'use strict'

const yargs = require('yargs');

const argv = yargs.strict(true)
		.version('0.0.0')
		.usage(`Usage: $0 [options]`)
		.example(`$0 -f README.md`, 'Will update TOC of README.md.')
		.option('f', {
			alias: ['file', 'markdown-file'],
			describe: 'Target file',
			type: 'string',
			demand: true,
		})
		.help()
		.alias('h', 'help')
		.argv;

const path = require('path')

const filePath = path.normalize(argv['markdownFile'])
//******************************************************************************/

const fs = require('fs')
const {execSync} = require('child_process')

let data

try {
	data = execSync(
			`gh-md-toc ${filePath}`,
			{encoding: 'utf8', maxBuffer: 100 * 1024}
	).toString()
} catch (error) {
	console.error('\nHave you installed "gh-md-toc" executable in your path? Get it from\nhttps://github.com/ekalinin/github-markdown-toc.')
	process.exit(1)
}
//console.log(data)

const toc = getRegExpBasedOnLineBreakChar(data).exec(data)[2]

const md = fs.readFileSync(filePath, 'utf8')

fs.writeFileSync(filePath,
		md.replace(getRegExpBasedOnLineBreakChar(md), (match, pre, toc0, suf) => pre + toc + suf)
)

console.log(`TOC is written to the file. TOC:\n${toc}`)

//******************************************************************************/

function getRegExpBasedOnLineBreakChar(input) {
	const lineBreakChar = getLineBreakChar(input)
	const lb = lineBreakChar === '\n' ? '\\n' : lineBreakChar === '\r' ? '\\r' : '\\r\\n'
	
	// https://regex101.com/r/SFJMgH/1
	return new RegExp(`(Table of Contents[^\\w${lb}]*?${lb}(?:={10,}${lb})?[^\\S${lb}]*?${lb})([\\s\\S]*?)([^\\S${lb}]*?${lb}[^\\S${lb}]*?${lb})`)
}

/**
 * https://stackoverflow.com/a/55661801/5318303
 */
function getLineBreakChar(str) {
	const indexOfLF = str.indexOf('\n', 1);  // No need to check first-character
	
	if (indexOfLF === -1) {
		if (str.indexOf('\r') !== -1) return '\r';
		
		return '\n';
	}
	
	if (str[indexOfLF - 1] === '\r') return '\r\n';
	
	return '\n';
}
