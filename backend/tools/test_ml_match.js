const { computeMatchFromBuffer } = require('../controllers/mlUtils');

(async () => {
  try {
    // Minimal mock job object
    const job = {
      title: 'Frontend Engineer',
      description: 'We build user interfaces using React and modern web technologies. Experience with Node.js and AWS preferred.',
      skills: ['React', 'JavaScript', 'Node.js', 'AWS']
    };

    // Sample resume text containing some of the skills
    const resumeText = `John Doe\n\nExperienced frontend engineer with 5 years working with React, Redux, JavaScript and TypeScript. Built multiple SPAs using React.js and Node.js backends. Familiar with AWS services such as S3 and Lambda.\n\nSkills:\n- React\n- JavaScript\n- Node.js\n- AWS\n`;

    const buffer = Buffer.from(resumeText, 'utf8');

    console.log('Running computeMatchFromBuffer test...');
    const result = await computeMatchFromBuffer(job, buffer);
    console.log('Test result:', JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('Test failed:', e && e.message ? e.message : e);
    process.exit(1);
  }
})();
