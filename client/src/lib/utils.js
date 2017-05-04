export function requireType(type) {
  return {
    type,
    required: true
  };
}

export function setCohortBadge(cohort) {
  cohort.badge = !cohort.name || cohort.name.trim() == '' ? cohort.label : cohort.name.split(' ')[0];
  try {
    if(cohort.badge.startsWith('g') && !isNaN(cohort.badge.substring(1).replace(/WD|DS/gi, ''))) {
      cohort.badgeNumber = cohort.badge.substring(1).replace(/WD|DS/gi, '');
    } else {
      cohort.badgeNumber = cohort.badge.split('[')[1].split(']')[0];
    }
  } catch (e) {
    cohort.badgeNumber = -1;
  }
}

export function isSubjectVisible(search, subject, cohort, performances, scoreFilter, standard_id) {
  subject = cohort.subjects.filter(s => s.name == subject)[0];
  const isVisible = subject.standards.reduce((isAssigned, standard) => {
    return (isAssigned || isStandardVisible(search, standard, performances, scoreFilter, standard_id));
  }, false);

  if(isVisible && search.trim() != '') {
    const regexp = new RegExp(search, 'gi');
    return isVisible || subject.name.match(regexp);
  } else {
    return isVisible;
  }
}

export function isStandardVisible(search, standard, performances, scoreFilter, standard_id) {
  if(standard_id) return standard.id == standard_id;

  const performance = performances ? performances[standard.id] : null;
  const isVisible = performances ? scoreFilter[performance] : true;

  if(isVisible && search.trim() != '') {
    const regexp = new RegExp(search, 'gi');
    return isVisible && JSON.stringify(standard).match(regexp);
  } else {
    return isVisible;
  }
}

export function decodeHtml(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}
