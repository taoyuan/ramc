#!/usr/bin/env node

var fs = require('fs-extra-promise');
var path = require('path');
var program = require('commander');
var ramc = require('../');

program
  .version(JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf8')).version);

program._name = 'ramc';

program
  .command('generate')
  .option('-i, --input <input>', 'location of the swagger spec, as URL or file')
  .option('-o, --output [output]', 'where to write the generated files (current dir by default)')
  .option('-l, --lang [language]', 'client language to generate', 'javascript')
  .option('-p, --project-name [project]', 'project name (default is same as swagger title or module name)')
  .option('-m, --module [module]', 'module for generated library (default is "Client")')
  .option('-s, --service [service]', 'default service name for apis without tags provided (default is "api")')
  .action(function(){
    if (!this.input) {
      this.outputHelp();
      process.exit(1);
    }

    const output = this.output || process.cwd();

    ramc.generate({
      lang: this.lang,
      spec: this.input,
      projectName: this.projectName,
      moduleName: this.module,
      serviceName: this.service,
      output: output
    })
  });

if (!process.argv.slice(2).length) {
  program.outputHelp();
  process.exit(1);
}

program.parse(process.argv);
