import assert from 'node:assert/strict'
import test from 'node:test'

import { remark } from 'remark'

import remarkMddDocumentStructure from '../plugins/remark-mdd-document-structure.js'
import remarkMddTextFormatting from '../plugins/remark-mdd-text-formatting.js'

async function transform(markdown, plugin) {
  const processor = remark().use(plugin)
  const tree = processor.parse(markdown)
  return processor.run(tree, { path: 'document.mdd' })
}

test('document directives preserve rich Markdown block and inline nodes', async () => {
  const tree = await transform(
    `::letterhead
**Acme** [site](https://example.com)

- First
- Second

::
`,
    remarkMddDocumentStructure,
  )

  const directive = tree.children[0]
  assert.equal(directive.data.hName, 'div')
  assert.deepEqual(directive.data.hProperties.className, ['letterhead'])
  assert.equal(directive.children[0].children[0].type, 'strong')
  assert.equal(directive.children[0].children[2].type, 'link')
  assert.equal(directive.children[1].type, 'list')
})

test('semantic classes retain the original heading element', async () => {
  const tree = await transform('# Invoice {.invoice-title}\n', remarkMddDocumentStructure)
  const heading = tree.children[0]
  assert.equal(heading.type, 'heading')
  assert.equal(heading.depth, 1)
  assert.equal(heading.data.hName, undefined)
  assert.deepEqual(heading.data.hProperties.className, ['invoice-title'])
  assert.equal(heading.children[0].value, 'Invoice')
})

test('standalone typography tokens are transformed', async () => {
  const superscript = await transform('^2^\n', remarkMddTextFormatting)
  assert.equal(superscript.children[0].children[0].type, 'html')
  assert.equal(superscript.children[0].children[0].value, '<sup>2</sup>')

  const quote = await transform('"hello"\n', remarkMddTextFormatting)
  assert.equal(quote.children[0].children[0].value, '“hello”')
})
