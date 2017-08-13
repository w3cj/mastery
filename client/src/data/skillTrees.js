export default [
  { id: 149 },
  { id: 184 },
  { id: 246 }
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
