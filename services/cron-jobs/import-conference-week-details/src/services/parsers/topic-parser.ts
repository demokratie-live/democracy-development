import { CheerioAPI, Element } from 'cheerio';
import {
  ConferenceWeekDetailSessionTop,
  ConferenceWeekDetailSessionTopStatus,
  ConferenceWeekDetailSessionTopTopic,
} from '../../types';
import { parseTimeString } from './date-utils';
import { extractDocumentId } from './document-parser';

/**
 * Extract agenda item information from table rows
 */
export const extractTopItems = (
  $: CheerioAPI,
  tableElement?: Element,
  sessionDate?: string,
): ConferenceWeekDetailSessionTop[] => {
  const tops: ConferenceWeekDetailSessionTop[] = [];

  // If a specific table element is provided, use it, otherwise look at all tables
  const selector = tableElement ? $(tableElement).find('tbody tr') : $('table tbody tr');

  selector.each((_, row) => {
    const timeText = $(row).find('td[data-th="Uhrzeit"] p').text().trim();
    const topText = $(row).find('td[data-th="TOP"] p').text().trim();

    // Extract heading from different possible structures
    let heading = '';
    const topCollapser = $(row).find('td[data-th="Thema"] .bt-top-collapser');
    if (topCollapser.length > 0) {
      heading = topCollapser.first().text().trim();
    } else {
      heading = $(row).find('td[data-th="Thema"] .bt-documents-description').text().trim();
    }

    // Extract article links if available
    const articleLink = $(row).find('td[data-th="Thema"] .bt-button-link').attr('data-url') || null;

    // Extract topic details
    const topics = extractTopicDetails($, row);

    // Extract status information
    const statusItems = extractStatusItems($, row);

    tops.push({
      time: parseTimeString(timeText, sessionDate),
      top: topText || null,
      heading: heading || null,
      article: articleLink,
      topic: topics,
      status: statusItems,
    });
  });

  return tops;
};

// Helper to create a new topic with current documents
const createTopic = (lines: string[], documents: string[], documentIds: string[]) => {
  if (lines.length > 0 || documents.length > 0) {
    return {
      lines,
      documents: [...documents],
      documentIds: documentIds.length > 0 ? [...documentIds] : undefined,
    };
  }
  return;
};

const extractDocumentLinks = ($: CheerioAPI, row: Element): { documents: string[]; documentIds: string[] } => {
  const documents: string[] = [];
  const documentIds: string[] = [];
  const documentLinks = $(row).find('a.dipLink');
  documentLinks.each((_, link) => {
    const href = $(link).attr('href') || '';
    if (href) {
      documents.push(href);
      const docId = extractDocumentId(href);
      if (docId) {
        documentIds.push(docId);
      }
    }
  });
  return { documents, documentIds };
};

/**
 * Extract topic details from a table row
 */
const extractTopicDetails = ($: CheerioAPI, row: Element): ConferenceWeekDetailSessionTopTopic[] => {
  const topics: ConferenceWeekDetailSessionTopTopic[] = [];

  $(row)
    .find('td[data-th="Thema"] .bt-top-collapse')
    .each((_, collapseElem) => {
      // Find all p tags and process their contents
      $(collapseElem)
        .find('p')
        .each((__, pTag) => {
          // Create a temporary div to manipulate HTML content
          const tempDiv = $('<div></div>');
          $(pTag).contents().clone().appendTo(tempDiv);

          // Split content by double br tags
          const parts: Element[] = [];
          let currentPart = $('<div></div>');

          tempDiv.contents().each((_, node) => {
            if (
              node.type === 'tag' &&
              (node as Element).name === 'br' &&
              node.next?.type === 'tag' &&
              (node.next as Element).name === 'br'
            ) {
              if (currentPart[0].type === 'tag') {
                parts.push(currentPart[0] as Element);
              }
              currentPart = $('<div></div>');
              // Skip the next br tag
              return;
            }
            currentPart.append($(node).clone());
          });
          // Add the last part if it has content and is an Element
          if (currentPart.contents().length > 0 && currentPart[0].type === 'tag') {
            parts.push(currentPart[0] as Element);
          }

          // Process each part
          parts.forEach((part) => {
            const currentLines: string[] = [];
            $(part)
              .contents()
              .each((_, node) => {
                if (node.type === 'text') {
                  const text = $(node).text().trim();
                  if (text.length > 0) {
                    currentLines.push(text);
                  }
                }
              });

            const { documents, documentIds } = extractDocumentLinks($, part);
            const topic = createTopic(currentLines, documents, documentIds);
            if (topic) {
              topics.push(topic);
            }
          });
        });
    });

  return topics;
};

/**
 * Split status text by HTML line breaks
 * @param text Text content that may contain <br> tags or newlines
 * @returns Array of split status texts
 */
const splitStatusByLines = (text: string): string[] => {
  if (!text) return [];

  // Replace HTML <br> tags with newlines
  const normalizedText = text.replace(/<br\s*\/?>/gi, '\n');

  // Split by newlines and filter out empty lines
  const lines = normalizedText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.length > 0 ? lines : [text];
};

/**
 * Group lines by empty lines (multiple <br> tags in a row)
 * @param htmlContent HTML content with <br> tags
 */
const splitContentByEmptyLines = (htmlContent: string): string[] => {
  if (!htmlContent) return [];

  // Replace triple <br> or more with a special marker
  const markedContent = htmlContent.replace(/(<br\s*\/?>){2,}/gi, '§GROUP_BREAK§');

  // Split by the marker
  return markedContent.split('§GROUP_BREAK§').filter(Boolean);
};

/**
 * Extract status items from a table row
 */
const extractStatusItems = ($: CheerioAPI, row: Element): ConferenceWeekDetailSessionTopStatus[] => {
  const statusItems: ConferenceWeekDetailSessionTopStatus[] = [];

  // Check for complex status with document links first
  const hasDetailedStatus = $(row).find('td[data-th="Status/ Abstimmung"] .bt-top-collapse').length > 0;

  if (hasDetailedStatus) {
    // Extract detailed status info from collapse elements
    $(row)
      .find('td[data-th="Status/ Abstimmung"] .bt-top-collapse')
      .each((_, statusElem) => {
        // Find all paragraphs in the status element
        $(statusElem)
          .find('p')
          .each((__, pTag) => {
            // Get text content but preserve breaks
            let statusText = $(pTag).html() || '';

            // Group content by multiple line breaks (which indicate separate voting processes)
            const statusGroups = splitContentByEmptyLines(statusText);

            statusGroups.forEach((group) => {
              // Create a temporary div to work with for this group
              const tempDiv = $('<div></div>').html(group);

              // Extract document references for this specific group
              const documents: string[] = [];
              const documentIds: string[] = [];

              tempDiv.find('a.dipLink').each((_, link) => {
                const href = $(link).attr('href') || '';
                if (href) {
                  // Avoid duplicate document references
                  if (!documents.includes(href)) {
                    documents.push(href);

                    const docId = extractDocumentId(href);
                    if (docId && !documentIds.includes(docId)) {
                      documentIds.push(docId);
                    }
                  }
                }

                // Replace the link in the current context with just its text
                const docId = $(link).text().trim();
                $(link).replaceWith(docId);
              });

              // Get the text content after replacing links
              let processedHtml = tempDiv.html() || '';

              // Split into individual lines
              const statusLines = splitStatusByLines(processedHtml);

              // Clean up each line (decode HTML entities, remove tags)
              const cleanedLines = statusLines
                .map((line) => {
                  return $('<div>')
                    .html(line)
                    .text()
                    .replace(/\s+/g, ' ') // Normalize whitespace
                    .trim();
                })
                .filter(Boolean); // Remove empty lines

              // Only add if we have content
              if (cleanedLines.length > 0) {
                statusItems.push({
                  lines: cleanedLines,
                  documents: [...documents],
                  documentIds: documentIds.length > 0 ? [...documentIds] : undefined,
                });
              }
            });
          });
      });
  } else {
    // Handle simple status text
    const statusCell = $(row).find('td[data-th="Status/ Abstimmung"] p');

    // Get text content with breaks preserved
    const statusText = statusCell.html() || '';

    // Split by line breaks
    const statusLines = splitStatusByLines(statusText);

    // Clean up the text, decode HTML entities
    const cleanedLines = statusLines
      .map((line) => {
        return $('<div>')
          .html(line)
          .text()
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
      })
      .filter(Boolean); // Remove empty lines

    // Add all lines as a single status item
    if (cleanedLines.length > 0) {
      statusItems.push({
        lines: cleanedLines,
        documents: [],
        documentIds: undefined,
      });
    }
  }

  return statusItems;
};
