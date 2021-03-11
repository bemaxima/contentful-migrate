#!/usr/bin/env node
// vim: set ft=javascript:

const path = require('path')
const chalk = require('chalk')
const log = require('migrate/lib/log')
const generator = require('migrate/lib/template-generator')

exports.command = 'create <name>'

exports.desc =
  'Creates an empty time stamped file in the content-type\'s migrations folder'

exports.builder = (yargs) => {
  yargs
    .option('content-type', {
      alias: 'c',
      describe: 'content type name',
      type: 'string',
      requiresArg: true,
      demandOption: true
    })
    .option('migration-path', {
      alias: 'p',
      describe: 'migration path directory',
      type: 'string',
      requiresArg: true,
      default: 'migrations'
    })
    .option('extension', {
      alias: 'ext',
      describe: 'migration path directory',
      type: 'string',
      requiresArg: true,
      default: '.js'
    })
    .positional('name', {
      describe: 'descriptive name for the migration file',
      type: 'string'
    })
}

exports.handler = ({ name, contentType, migrationPath, extension }) => {
  const migrationsDirectory = path.join('.', migrationPath, contentType)
  const templateFile = path.join(__dirname, '..', '..', 'lib', `template${extension}`)

  generator({
    name,
    templateFile,
    migrationsDirectory,
    dateFormat: 'UTC:yyyymmddHHMMss',
    extension: `${extension}`
  }, (error, filename) => {
    if (error) {
      log(chalk.bold.red(`🚨 Template generation error ${error.message}`))
      process.exit(1)
    }
    log('🎉 created', filename)
  })
}
