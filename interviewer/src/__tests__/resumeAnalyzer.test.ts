import { analyzeResume } from '../../src/lib/resumeAnalyzer';

// Sample resume texts
const SAMPLE_SENIOR = `
John Doe\n
Summary: Senior Software Engineer with 10+ years experience.\n
Experience:\nLed a team to improve system throughput by 35%. Optimized API latency from 220ms to 90ms.\n
Skills: JavaScript, TypeScript, React, Node, AWS, Docker, Kubernetes, PostgreSQL, Redis\n
Projects: Migration to microservices improved conversion by 12% and reduced downtime.\n
Education: BSc in Computer Science
`;

const SAMPLE_ENTRY = `
Jane Smith\n
Summary: Entry-level developer, fast learner, team player.\n
Projects: Built a React project with REST API and Jest tests.\n
Skills: JavaScript, React, Git\n
Education: BSc in Software Engineering, GPA 3.6/4.0
`;

const SAMPLE_SPARSE = `
Bob\nPhone: 555-123-4567\nEmail: bob@example.com
`;

describe('analyzeResume - deterministic behavior and rule coverage', () => {
  test('strong senior resume yields higher score, strengths include quantifiable', () => {
    const res = analyzeResume(SAMPLE_SENIOR);
    expect(res.score).toBeGreaterThanOrEqual(60);
    expect(res.strengths.join(' ')).toMatch(/Quantifiable|Strong skills/);
    expect(res.matchedRules.skills.totalKeywords).toBeGreaterThan(0);
  });

  test('entry-level resume yields moderate score with recommendations', () => {
    const res = analyzeResume(SAMPLE_ENTRY);
    expect(res.score).toBeGreaterThan(20);
    expect(res.recommendations.length).toBeGreaterThan(0);
  });

  test('sparse resume has low score and weaknesses present', () => {
    const res = analyzeResume(SAMPLE_SPARSE);
    expect(res.score).toBeLessThanOrEqual(25);
    expect(res.weaknesses.length + res.recommendations.length).toBeGreaterThan(0);
  });

  test('empty text returns score 0-ish and recommendations present', () => {
    const res = analyzeResume('');
    expect(res.score).toBeGreaterThanOrEqual(0);
    expect(res.recommendations.length + res.weaknesses.length).toBeGreaterThan(0);
  });

  test('multilingual/special chars normalized without crashing', () => {
    const text = 'Résumé – Développeur: amélioré la latence de 50%';
    const res = analyzeResume(text);
    expect(res.score).toBeGreaterThanOrEqual(0);
  });

  test('only contact details does not get high score', () => {
    const text = 'Name: A\nEmail: a@b.com\nPhone: 9999999999';
    const res = analyzeResume(text);
    expect(res.score).toBeLessThan(40);
  });

  test('deterministic: same input yields same result', () => {
    const res1 = analyzeResume(SAMPLE_SENIOR);
    const res2 = analyzeResume(SAMPLE_SENIOR);
    expect(res1).toMatchObject(res2);
  });
});


