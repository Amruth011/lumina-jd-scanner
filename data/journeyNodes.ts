export interface JourneyNode {
  id: string;
  step: string;
  title: string;
  description: string;
  icon: string;
  t: number; // position on curve (0 to 1)
}

export const journeyNodes: JourneyNode[] = [
  {
    id: 'n1',
    step: 'STEP 01',
    title: 'YOU',
    description: 'Raw candidate. Great talent. Zero visibility.',
    icon: '👤',
    t: 0,
  },
  {
    id: 'n2',
    step: 'STEP 02',
    title: 'JD DECODER',
    description: 'Every hidden keyword. Every ATS requirement. Decoded.',
    icon: '📄',
    t: 0.25,
  },
  {
    id: 'n3',
    step: 'STEP 03',
    title: 'GAP ANALYSIS',
    description: 'Your gaps. Your strengths. Machine-precision clarity.',
    icon: '🔬',
    t: 0.5,
  },
  {
    id: 'n4',
    step: 'STEP 04',
    title: 'RESUME TAILOR',
    description: 'ATS score: 42 → 94. Built to win.',
    icon: '✍️',
    t: 0.75,
  },
  {
    id: 'n5',
    step: 'STEP 05',
    title: 'INTERVIEW WON',
    description: 'Offer in hand. Top 0.1%. You made it.',
    icon: '🏆',
    t: 1.0,
  },
];
