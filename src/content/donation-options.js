// Amounts are displayed in pounds; impact keys use whole pence.
export const donationPresets = {
  single: [10, 25, 50, 100],
  monthly: [10, 20, 35, 60, 100],
};

const monthlyImpacts = {
  1000: {
    title: 'One session. One woman.',
    description: 'Support one woman to attend one pay-as-you-go session each month.',
  },
  2000: {
    title: 'Two sessions. One woman.',
    description: 'Support one woman to attend two sessions each month.',
  },
  3500: {
    title: 'A month of possibility.',
    description: 'Support one woman to attend fitness classes for a month.',
  },
  6000: {
    title: 'Four sessions. One woman.',
    description: 'Support one woman to attend four reformer Pilates sessions each month — one session a week.',
  },
  10000: {
    title: 'One class each. 10 women.',
    description: 'Support 10 women to attend one class of their choice each month.',
  },
};

export function getMonthlyImpact(pence) {
  return monthlyImpacts[pence] || {
    title: 'More access. More possibility.',
    description: 'Help widen access to BOAN’s community activities with your monthly gift.',
  };
}
