const moment = require('moment');
const fs = require('fs').promises;
const { chunk } = require('lodash');

const calc = async (fileName) => {
  const houlyWage = 3000;

  try {
    if (!fileName) {
      throw new Error('fileName required');
    }  

    const buffer = await fs.readFile(fileName, 'utf8');
    const rawList = buffer.toString().split('\r\n');
    const attendanceList = rawList.map((raw) => raw.split(','));

    // Table Headを除外
    attendanceList.shift();

    const dailyList = [];
    for (const attendance of attendanceList) {
      const date = attendance.shift();

      const termList = chunk(attendance, 2);
      const minuteList = termList.map(([ start, end ]) => {
        if (!(start && end)) return 0;

        const startTime = moment(`${date} ${start}`, 'YYYY/MM/DD HH:mm');
        const endTime = moment(`${date} ${end}`, 'YYYY/MM/DD HH:mm');

        if (!endTime.isAfter(startTime)) {
          endTime.add(1, 'day');
        }

        return endTime.diff(startTime, 'minutes');
      });

      dailyList.push(
        minuteList.reduce((result, current)=> result + current, 0)
      );
    }

    const monthly = dailyList.reduce((result, current)=> result + current, 0);
    const workingHours = monthly / 60;

    console.log(`勤務時間: ${workingHours}, 請求金額: ${workingHours * houlyWage}`);
  } catch (err) {
    console.log(err);
  }
};

calc(process.argv[2]);