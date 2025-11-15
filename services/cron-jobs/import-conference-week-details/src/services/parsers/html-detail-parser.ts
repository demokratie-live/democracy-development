import * as cheerio from 'cheerio';
import type { AnyNode, Text } from 'domhandler';
import type { ParsedTopicDetail, ParsedStatusDetail } from '../../types-json';

/**
 * Parses HTML detail strings from the JSON API to extract lines and documents.
 * The JSON API returns HTML strings in topic.detail and status.detail fields.
 *
 * Example input:
 * "Befragung der Bundesregierung <br/><a href='...'>Drucksache 20/12345</a>"
 */

/**
 * Parse topic.detail HTML string to extract text lines and document references
 */
export function parseTopicDetail(html: string): ParsedTopicDetail {
  if (!html || html.trim() === '') {
    return { lines: [], documents: [] };
  }

  const $ = cheerio.load(html, null, false);
  const lines: string[] = [];
  const documents: string[] = [];

  // Extract all text nodes and links
  const processNode = (node: AnyNode) => {
    if (node.type === 'text') {
      const text = (node as Text).data?.trim();
      if (text) {
        lines.push(text);
      }
    } else if (node.type === 'tag' && node.name === 'a') {
      const linkText = $(node).text().trim();
      const href = $(node).attr('href');

      if (linkText) {
        lines.push(linkText);
      }

      if (href) {
        documents.push(href);
      }
    } else if (node.type === 'tag' && node.name === 'br') {
      // <br> tags separate lines, no action needed (handled by text node extraction)
    }
  };

  // Process all nodes recursively
  $('body')
    .contents()
    .each((_, element) => {
      processNode(element as AnyNode);
    });

  // If no body wrapper, process root nodes
  if (lines.length === 0 && documents.length === 0) {
    $.root()
      .contents()
      .each((_, element) => {
        processNode(element as AnyNode);
      });
  }
  return { lines, documents };
}

/**
 * Parse status.detail HTML string to extract status text lines
 */
export function parseStatusDetail(html: string): ParsedStatusDetail {
  if (!html || html.trim() === '') {
    return { lines: [], documents: [] };
  }

  const $ = cheerio.load(html, null, false);
  const lines: string[] = [];
  const documents: string[] = [];

  // Extract all text content, preserving line breaks
  const text = $.text();
  const textLines = text
    .split(/\n|<br\s*\/?>/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  lines.push(...textLines);

  // Extract any document links (though status.detail rarely has them)
  $('a').each((_, element) => {
    const href = $(element).attr('href');
    if (href) {
      documents.push(href);
    }
  });

  return { lines, documents };
}
