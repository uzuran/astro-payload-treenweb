import {
  BlockquoteFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineCodeFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  StrikethroughFeature,
  UnderlineFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical';

/**
 * The ONE place the richtext capability set is defined. Both the Payload editor
 * (payload.config.ts) and the safe HTML serializer (@treenweb/richtext, Step 7)
 * consume this, so the editor can never produce a node the serializer will not
 * render safely.
 */
export const lexicalFeatures = [
  ParagraphFeature(),
  HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
  BoldFeature(),
  ItalicFeature(),
  UnderlineFeature(),
  StrikethroughFeature(),
  InlineCodeFeature(),
  UnorderedListFeature(),
  OrderedListFeature(),
  BlockquoteFeature(),
  HorizontalRuleFeature(),
  LinkFeature(),
  FixedToolbarFeature(),
  InlineToolbarFeature(),
];

/**
 * Lexical node `type` values the features above can emit. Consumed by the
 * Step 7 serializer allowlist + its parity test.
 */
export const allowedLexicalNodeTypes = [
  'root',
  'paragraph',
  'text',
  'linebreak',
  'tab',
  'heading',
  'list',
  'listitem',
  'quote',
  'horizontalrule',
  'link',
  'autolink',
] as const;

export type AllowedLexicalNodeType = (typeof allowedLexicalNodeTypes)[number];
