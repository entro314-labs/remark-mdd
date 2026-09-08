import assert from 'node:assert/strict'
import test from 'node:test'

import { remark } from 'remark'

import remarkMddDocumentStructure from '../plugins/remark-mdd-document-structure.js'
import remarkMddTextFormatting from '../plugins/remark-mdd-text-formatting.js'

async function transform(markdown, plugin) {
  let processor = remark()
  for (const item of plugin.plugins ?? [plugin]) {
    processor = processor.use(item)
  }
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

test('derived paragraph classes are added to, not substituted for, an explicit semantic class', async () => {
  const longText = 'Important legal text. '.repeat(12).trim()
  const tree = await transform(`${longText} {.legal-notice}\n`, {
    plugins: [remarkMddDocumentStructure, remarkMddTextFormatting],
  })
  const paragraph = tree.children[0]
  assert.deepEqual(paragraph.data.hProperties.className, ['legal-notice', 'long-paragraph'])
})

test('a directive closes only on a `::` line of its own, as the validator requires', async () => {
  const tree = await transform(
    `::letterhead
Office hours: 9::30

Second paragraph
::

After
`,
    remarkMddDocumentStructure,
  )

  assert.equal(tree.children.length, 2)
  const [container, after] = tree.children
  assert.equal(container.data.hProperties['data-mdd-directive'], 'letterhead')
  assert.equal(container.children.length, 2)
  assert.equal(container.children[0].children[0].value, 'Office hours: 9::30')
  assert.equal(container.children[1].children[0].value, 'Second paragraph')
  assert.equal(after.children[0].value, 'After')
})
