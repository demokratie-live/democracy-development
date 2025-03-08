import { describe, expect, it } from 'vitest';
import { ConferenceWeekDetailParser } from '../ConferenceWeekDetailParser';
import { TestableParser } from './shared';

describe('ConferenceWeekDetailParser Content Extraction', () => {
  const parser = new ConferenceWeekDetailParser() as unknown as TestableParser;

  describe('extractDocuments', () => {
    it('should extract document URLs from text', () => {
      const text = 'Text with <a href="http://doc1.pdf">link1</a> and <a href="http://doc2.pdf">link2</a>';
      const result = parser.extractDocuments(text);
      expect(result).toEqual(['http://doc1.pdf', 'http://doc2.pdf']);
    });

    it('should handle relative URLs', () => {
      const text = 'Text with <a href="/doc1.pdf">link1</a>';
      const result = parser.extractDocuments(text);
      expect(result).toEqual(['/doc1.pdf']);
    });

    it('should return empty array for text without documents', () => {
      const text = 'Text without any links';
      const result = parser.extractDocuments(text);
      expect(result).toEqual([]);
    });

    it('should handle malformed HTML correctly', () => {
      const text = '<a href="http://doc1.pdf">broken link<a> and <a href="http://doc2.pdf">';
      const result = parser.extractDocuments(text);
      expect(result).toEqual(['http://doc1.pdf', 'http://doc2.pdf']);
    });
  });

  describe('extractTopicContent', () => {
    it('should extract content from p tags', () => {
      const topic = '<p>Test Content</p>';
      const result = parser.extractTopicContent(topic);
      expect(result).toBe('Test Content');
    });

    it('should handle nested HTML tags', () => {
      const topic = '<p>Test <span>Content</span> with <b>tags</b></p>';
      const result = parser.extractTopicContent(topic);
      expect(result).toBe('Test <span>Content</span> with <b>tags</b>');
    });

    it('should return original content if no p tags', () => {
      const topic = 'Test Content';
      const result = parser.extractTopicContent(topic);
      expect(result).toBe('Test Content');
    });

    it('should handle multiple p tags', () => {
      const topic = '<p>First</p><p>Second</p>';
      const result = parser.extractTopicContent(topic);
      expect(result).toBe('First');
    });
  });

  describe('extractStatusContent', () => {
    it('should extract content from p tags', () => {
      const statusText = '<p>Status Content</p>';
      const result = parser.extractStatusContent(statusText);
      expect(result).toBe('Status Content');
    });

    it('should handle HTML within p tags', () => {
      const statusText = '<p>Status <a href="doc.pdf">with link</a></p>';
      const result = parser.extractStatusContent(statusText);
      expect(result).toBe('Status <a href="doc.pdf">with link</a>');
    });

    it('should return original content if no p tags', () => {
      const statusText = 'Status Content';
      const result = parser.extractStatusContent(statusText);
      expect(result).toBe('Status Content');
    });

    it('should preserve whitespace correctly', () => {
      const statusText = '<p>\n  Status  Content \n</p>';
      const result = parser.extractStatusContent(statusText);
      expect(result).toBe('Status  Content');
    });
  });
});
