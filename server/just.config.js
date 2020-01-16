// just-task.js
const {task, tscTask } = require( 'just-scripts');
task('ts', tscTask());
task('ts:watch', tscTask({watch:true}));