export interface JourneyNode {
  id: string;
  step: string;
  title: string;
  description: string;
  t: number; // Position on curve (0 to 1)
  icon: string;
}

export const journeyNodes: JourneyNode[] = [
  {
    id: 'n1',
    step: 'STEP 01',
    title: 'YOU',
    description: 'Raw candidate. Great talent. Zero visibility.',
    t: 0,
    icon: '👤',
  },
  {
    id: 'n2',
    step: 'STEP 02',
    title: 'JD DECODER',
    description: 'Every hidden keyword. Every ATS requirement. Decoded.',
    t: 0.25,
    icon: '📄',
  },
  {
    id: 'n3',
    step: 'STEP 03',
    title: 'GAP ANALYSIS',
    description: 'Your gaps. Your strengths. Machine-precision clarity.',
    t: 0.5,
    icon: '🔬',
  },
  {
    id: 'n4',
    step: 'STEP 04',
    title: 'RESUME TAILOR',
    description: 'ATS score: 42 → 94. Built to win.',
    t: 0.75,
    icon: '✍️',
  },
  {
    id: 'n5',
    step: 'STEP 05',
    title: 'INTERVIEW WON',
    description: 'Offer in hand. Top 0.1%. You made it.',
    t: 1.0,
    icon: '🏆',
  },
];
