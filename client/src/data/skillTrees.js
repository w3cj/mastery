export default [
  { id: 149 },
  { id: 184 },
  { id: 246 },
  {
    id: 296,
    skillsTreeBranch: '17-03-WD-SEA',
    showWeeks: false,
    sections: [
      { name: 'Fundamentals', file: 'fundamentals' }
    ]
  }
].map(cohort => {
  const defaultSections = [
    { name: 'Quarter 1', file: 'q1' },
    { name: 'Quarter 2', file: 'q2' }
  ]

  return {
    id: cohort.id,
    sections: cohort.sections || defaultSections,
    showWeeks: cohort.showWeeks === undefined,
    skillsTreeBranch: cohort.skillsTreeBranch || 'default'
  }
})
