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
				count: 0,
				1: 0,
				2: 0,
				3: 0,
				4: 0,
				elective: {
					total: 0,
					count: 0
				}
			};
			return subjectTotals;
		}, {});

		Object.keys(performances[student_id]).forEach(standard_id => {
			const performance = performances[student_id][standard_id];
			const standard = standardsById[standard_id];
			if(standard && performance.score > 0) {
				const subject_id = standard.subject_id;
				let subjectTotal = subjectTotals[subject_id];

				if (standard.standard_type == 'elective') {
					subjectTotal = subjectTotal.elective;
				} else {
					subjectTotal[performance.score]++;
				}

				subjectTotal.total += performance.score;
				subjectTotal.count++;

			}
		});

		studentsById[student_id] = subjectTotals;
	});

	Object.keys(studentsById).forEach(student_id => {
		const student = studentsById[student_id];
		let totalSum = 0;
		let totalCount = 0;
		let electiveSum = 0;
		let electiveCount = 0;
		const totals = {
			1: 0,
			2: 0,
			3: 0,
			4: 0
		};

		Object.keys(student).forEach(subject_id => {
			const subject = student[subject_id];
			if(subject) {
				totals[1] += subject[1];
				totals[2] += subject[2];
				totals[3] += subject[3];
				totals[4] += subject[4];

				if(subject.count > 0) {
					subject.average = subject.total / subject.count;
					totalSum += subject.total;
					totalCount += subject.count;
				}

				if(subject.elective && subject.elective.count > 0) {
					subject.elective.average = subject.elective.total / subject.elective.count;
					electiveSum += subject.elective.total;
					electiveCount += subject.elective.count;
				}
			}
		});

		student.scoreTotals = totals;
		student.average = Number((totalSum / totalCount).toFixed(2));
		student.electiveAverage = Number((electiveSum / electiveCount).toFixed(2));
	});

	return studentsById;
}

function averageStudentPerformances(performances) {
	const coreStandards = Object.keys(performances.core);

	const coreTotals = {
		1: 0,
		2: 0,
		3: 0,
		4: 0
	};

	let coreSum = 0;
	let totalScores = 0;

	coreStandards.forEach(standard => {
		const score = performances.core[standard];
		if(score != 0) {
			coreTotals[score]++;
			coreSum += score;
			totalScores++;
		}
	});

	Object.keys(coreTotals).forEach(score => {
		coreTotals[score] = Number(((coreTotals[score]/totalScores) * 100).toFixed(2))
	});

	return {
		mastery: coreTotals,
		average: Number((coreSum / totalScores).toFixed(2))
	};
}

module.exports = {
	averagePerformances,
	averageStudentPerformances
}
