/**
 * Extract document ID from a document link
 * Example: https://dserver.bundestag.de/btd/20/038/2003858.pdf should return "20/3858"
 */
export const extractDocumentId = (href: string): string | null => {
  // Match patterns like /btd/20/038/2003858.pdf
  const match = href.match(/\/btd\/(\d{2})\/(\d{3})\/(\d+)\.pdf$/);
  if (match) {
    const [, major, _minor, fullId] = match;

    // The document ID is in format "major/actualNumber" (where actualNumber is without leading zeros)
    // For Bundestag documents, the format is XX/YYYY where:
    // XX = legislative period (major)
    // YYYY = actual document number without leading zeros

    // The fullId contains the real number but with leading zeros, we need to extract just the number
    const actualNumber = fullId.substring(fullId.length - 4);

    // Remove leading zeros
    const parsedNumber = parseInt(actualNumber, 10).toString();

    return `${major}/${parsedNumber}`;
  }
  return null;
};
