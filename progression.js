import {beginCourse,courseProgress,completeStep} from './learning.js';
export const startCourse=beginCourse;
export const sessionFor=courseProgress;
export const completeCurrentStep=completeStep;
export function validateCourses(courses,activities=[]){const errors=[],ids=new Set(),activityIds=new Set(activities.map(x=>x.id));for(const c of courses){if(ids.has(c.id))errors.push('duplicate course '+c.id);ids.add(c.id);if(!c.steps?.length)errors.push(c.id+': no steps');const steps=new Set();for(const s of c.steps||[]){if(steps.has(s.id))errors.push(c.id+': duplicate step '+s.id);steps.add(s.id);if(!s.activity_id||!activityIds.has(s.activity_id))errors.push(c.id+': missing activity '+s.activity_id)}}return errors}
