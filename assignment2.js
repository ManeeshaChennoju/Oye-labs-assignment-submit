WITH resulttable AS (
  SELECT
    *
  FROM
    subjectstudentmapping
  ORDER BY
    subjectId
)
SELECT
  student.studentId,
  student.name AS studentName,
  GROUP_CONCAT(subjects.subjectName, ', ') AS subjects
FROM
  student
  JOIN resulttable ON student.studentId = resulttable.studentId
  JOIN subjects ON resulttable.subjectId = subjects.subjectId
GROUP BY
  student.studentId,
  studentName
ORDER BY
  student.studentId;