import inquirer from 'inquirer';

import setupScrapers from './setup-scrapers';


export default async function () {
  const { next } = await inquirer.prompt({
    type: 'list',
    name: 'next',
    message: 'What would you like to setup?',
    choices: [
      {
        name: 'Individual Scrapers',
        value: setupScrapers,
      },
    ],
  });

  await next();
}
