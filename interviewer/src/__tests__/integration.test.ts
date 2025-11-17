/**
 * Integration test: load 3 sample resume files (TXT placeholders) and assert consistent outputs.
 * Note: Using TXT files to avoid PDF/DOCX parsing dependencies in CI.
 */
import { parseFileToText, analyzeResume } from '../../src/lib/resumeAnalyzer';

const sampleFiles = [
  { name: 'senior_sample.txt', content: `Senior Dev\nExperience: increased throughput by 30% using React, Node, AWS\nSkills: React TypeScript AWS Docker` },
  { name: 'entry_sample.txt', content: `Entry Student\nProjects: React app with REST\nSkills: JavaScript React\nEducation: BSc` },
  { name: 'sparse_sample.txt', content: `Email: a@b.com\nPhone: 1112223333` },
];

describe('integration: parse + analyze consistency', () => {
  test('consistent outputs across repeated runs', async () => {
    for (const f of sampleFiles) {
      const file = new File([f.content], f.name, { type: 'text/plain' });
      const text1 = await parseFileToText(file);
      const out1 = analyzeResume(text1);
      const text2 = await parseFileToText(file);
      const out2 = analyzeResume(text2);
      expect(out1.score).toBe(out2.score);
      expect(out1.strengths).toEqual(out2.strengths);
    }
  }, 20000);
});


