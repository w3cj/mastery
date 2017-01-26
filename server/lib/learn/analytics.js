function averagePerformances(data) {
	const {students, performances, subjects} = data;

	const studentsById = students.reduce((studentsById, student) => {
		studentsById[student.id] = {
			id: student.id
		};
		return studentsById;
	}, {});

	const standardsById = subjects.reduce((standardsById, subject) => {
		subject.standards.forEach(standard => {
			standard.subject_id = subject.id;
			standardsById[standard.id] = standard;
		});
		return standardsById;
	}, {});

	Object.keys(performances).forEach(student_id => {
		const subjectTotals = subjects.reduce((subjectTotals, subject) => {
			subjectTotals[subject.id] = {
				total: 0,
				count: 0
			};
			return subjectTotals;
		}, {});

		Object.keys(performances[student_id]).forEach(standard_id => {
			const performance = performances[student_id][standard_id];
			if(standardsById[standard_id]) {				
				const subject_id = standardsById[standard_id].subject_id;
				if(performance.score > 0) {
					subjectTotals[subject_id].total += performance.score;
					subjectTotals[subject_id].count++;
				}
			}
		});

		studentsById[student_id] = subjectTotals;
	});

	Object.keys(studentsById).forEach(student_id => {
		const student = studentsById[student_id];
		let totalSum = 0;
		let totalCount = 0;
		Object.keys(student).forEach(subject_id => {
			const subject = student[subject_id];
			if(subject.count > 0) {
				subject.average = subject.total / subject.count;
				totalSum += subject.total;
				totalCount += subject.count;
			}
		});

		student.average = Number((totalSum / totalCount).toFixed(2));
	});

	return studentsById;
}


module.exports = {
	averagePerformances
}
