import { describe, expect, it } from 'vitest';
import { ConferenceWeekDetailParser } from '../ConferenceWeekDetailParser';
import { TestableParser, TestTop } from './shared';

describe('ConferenceWeekDetailParser Topic Parsing', () => {
  const parser = new ConferenceWeekDetailParser() as unknown as TestableParser;

  describe('parseTopicData', () => {
    it('should parse topic data with heading and article', () => {
      const topic = `
        <a href="#" class="bt-top-collapser collapser collapsed">Test Heading</a>
        <button data-url="/test-article">Click</button>
        <p>Topic content</p>
      `;
      const top: TestTop = {
        time: null,
        top: null,
        heading: null,
        article: null,
        topic: [],
        status: [],
      };

      parser.parseTopicData(topic, top);

      expect(top.heading).toBe('Test Heading');
      expect(top.article).toBe('https://www.bundestag.de/test-article');
      expect(top.topic).toHaveLength(1);
      expect(top.topic[0].lines[0]).toBe('Topic content');
    });

    it('should handle absolute URLs in article links', () => {
      const topic = `
        <button data-url="https://external.com/article">Click</button>
      `;
      const top: TestTop = {
        time: null,
        top: null,
        heading: null,
        article: null,
        topic: [],
        status: [],
      };

      parser.parseTopicData(topic, top);
      expect(top.article).toBe('https://external.com/article');
    });

    it('should handle missing heading and article', () => {
      const topic = '<p>Only content</p>';
      const top: TestTop = {
        time: null,
        top: null,
        heading: null,
        article: null,
        topic: [],
        status: [],
      };

      parser.parseTopicData(topic, top);
      expect(top.heading).toBeNull();
      expect(top.article).toBeNull();
      expect(top.topic).toHaveLength(1);
      expect(top.topic[0].lines[0]).toBe('Only content');
    });
  });

  describe('parseTopicParts', () => {
    it('should parse multiple topic parts correctly', () => {
      const topicContent = '1.) First topic<br/>ZP 2.) Second topic<br/>3.) Third topic';
      const result = parser.parseTopicParts(topicContent);

      expect(result).toHaveLength(3);
      expect(result[0].lines[0]).toBe('1.) First topic');
      expect(result[1].lines[0]).toBe('ZP 2.) Second topic');
      expect(result[2].lines[0]).toBe('3.) Third topic');
    });

    it('should handle topics with embedded documents', () => {
      const topicContent = '1.) Topic with <a href="doc1.pdf">document</a><br/>2.) Another topic';
      const result = parser.parseTopicParts(topicContent);

      expect(result).toHaveLength(2);
      expect(result[0].lines[0]).toBe('1.) Topic with <a href="doc1.pdf">document</a>');
      expect(result[0].documents).toEqual(['doc1.pdf']);
      expect(result[1].lines[0]).toBe('2.) Another topic');
      expect(result[1].documents).toEqual([]);
    });

    it('should handle empty lines between topics', () => {
      const topicContent = '1.) First topic<br/><br/>2.) Second topic';
      const result = parser.parseTopicParts(topicContent);

      expect(result).toHaveLength(2);
      expect(result[0].lines[0]).toBe('1.) First topic');
      expect(result[1].lines[0]).toBe('2.) Second topic');
    });

    it('should handle multiline topics', () => {
      const topicContent = '1.) First line<br/>continuation<br/>2.) Second topic';
      const result = parser.parseTopicParts(topicContent);

      expect(result).toHaveLength(2);
      expect(result[0].lines).toEqual(['1.) First line', 'continuation']);
      expect(result[1].lines).toEqual(['2.) Second topic']);
    });
  });

  describe('parseStatusData', () => {
    it('should parse status with documents', () => {
      const statusText = '<p>Status 1 <a href="doc1.pdf">Doc1</a><br />Status 2 <a href="doc2.pdf">Doc2</a></p>';
      const top: TestTop = {
        time: null,
        top: null,
        heading: null,
        article: null,
        topic: [],
        status: [],
      };

      parser.parseStatusData(statusText, top);

      expect(top.status).toHaveLength(2);
      expect(top.status[0].line).toBe('Status 1 <a href="doc1.pdf">Doc1</a>');
      expect(top.status[0].documents).toContain('doc1.pdf');
      expect(top.status[1].line).toBe('Status 2 <a href="doc2.pdf">Doc2</a>');
      expect(top.status[1].documents).toContain('doc2.pdf');
    });

    it('should handle status without documents', () => {
      const statusText = '<p>Simple status</p>';
      const top: TestTop = {
        time: null,
        top: null,
        heading: null,
        article: null,
        topic: [],
        status: [],
      };

      parser.parseStatusData(statusText, top);

      expect(top.status).toHaveLength(1);
      expect(top.status[0].line).toBe('Simple status');
      expect(top.status[0].documents).toEqual([]);
    });

    it('should ignore empty status lines', () => {
      const statusText = '<p>Status 1<br /><br />Status 2</p>';
      const top: TestTop = {
        time: null,
        top: null,
        heading: null,
        article: null,
        topic: [],
        status: [],
      };

      parser.parseStatusData(statusText, top);

      expect(top.status).toHaveLength(2);
      expect(top.status[0].line).toBe('Status 1');
      expect(top.status[1].line).toBe('Status 2');
    });
  });
});
