const fs = require('fs');
const pages = {
  ClientReport: 'tasks',
  TaskMaster: 'tasks',
  TaskReport: 'tasks',
  StateMaster: 'states',
  CityMaster: 'cities',
  ProjectMaster: 'projects',
  ClientMaster: 'clients',
  EmployeeMaster: 'employees',
  ManageAttendance: 'attendance',
  ManageLeave: 'leaves'
};

const template = fs.readFileSync('template.txt', 'utf8');

for (const [page, endpoint] of Object.entries(pages)) {
  const pageTitle = page.replace(/([A-Z])/g, ' $1').trim();
  let code = template.split('VAR_PAGE').join(page);
  code = code.split('VAR_ENDPOINT').join(endpoint);
  code = code.split('VAR_TITLE').join(pageTitle);
  fs.writeFileSync('src/pages/' + page + '.jsx', code);
}
console.log('Build script complete!');
