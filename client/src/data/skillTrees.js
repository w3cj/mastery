export default [
  { id: 149 },
  { id: 184 },
  { id: 246 },
  {
    id: 239,
    skillsTreeBranch: 'buckets',
    sections: [
      { name: 'Buckets', file: 'buckets' }
    ]
  },
  {
    id: 296,
    skillsTreeBranch: '17-03-WD-SEA',
    sections: [
      { name: 'Fundamentals', file: 'fundamentals' },
      { name: 'Module A', file: 'a' }
    ]
  },
  {
    id: 234,
    skillsTreeBranch: '17-03-WD-SEA',
    sections: [
      { name: 'Fundamentals', file: 'fundamentals' },
      { name: 'Module A', file: 'a' }
    ]
  },
].map(cohort => {
  const defaultSections = [
    { name: 'Quarter 1', file: 'q1' },
    { name: 'Quarter 2', file: 'q2' }
  ]

  return {
    id: cohort.id,
    sections: cohort.sections || defaultSections,
    skillsTreeBranch: cohort.skillsTreeBranch || 'default'
  }
})
