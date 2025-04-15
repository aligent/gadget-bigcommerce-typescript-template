#!/usr/bin/env ts-node
/* eslint-disable no-console */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
// Parse arguments
const [, , appName, environmentName] = process.argv;

// Sanitize input to ensure it only contains alphanumeric characters and hyphens
function isValidInput(input: string): boolean {
    return /^[a-zA-Z0-9-]+$/.test(input);
}

if (!appName || !environmentName) {
    console.error('❌ Usage: yarn gadget:link <app-name> <environment-name>');
    process.exit(1);
}

if (!isValidInput(appName) || !isValidInput(environmentName)) {
    console.error(
        '❌ Invalid input: only letters, numbers, and dashes are allowed in app and environment names.'
    );
    process.exit(1);
}

if (environmentName === 'development') {
    console.error("❌ 'development' is not a valid environment name for this command.");
    process.exit(1);
}

// Confirm with the user before syncing
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Check if the requested environment is already synced in .gadget/sync.json
const getExistingLink = (environmentName: string) => {
    const syncJsonPath = path.resolve(process.cwd(), '.gadget/sync.json');
    if (fs.existsSync(syncJsonPath)) {
        const syncRaw = fs.readFileSync(syncJsonPath, 'utf8');
        const syncData = JSON.parse(syncRaw);

        return {
            currentFilesVersion: syncData.environments[environmentName]?.filesVersion,
            currentApplication: syncData.application,
        };
    }

    return {
        currentFilesVersion: null,
        currentAppName: null,
    };
};

const confirm = (question: string): Promise<boolean> => {
    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            const trimmed = answer.trim().toLowerCase();
            resolve(trimmed === 'y' || trimmed === 'yes');
        });
    });
};

const checkStatus = (environmentName: string) =>
    new Promise<void>(resolve => {
        const statusChild = spawn('npx', ['ggt', 'status', `--env=${environmentName}`], {
            stdio: 'inherit',
        });

        statusChild.on('close', code => {
            if (code !== 0) {
                console.error(`❌ ggt status exited with code ${code}`);
                process.exit(code ?? 1);
            } else {
                resolve();
            }
        });
    });

(async () => {
    // First we check if this repository is already synced to an application
    // and warn the user if it is already linked to their requested environment
    // this causes gadget to skip asking the user what to do about differences,
    // which can lead to immediate deletion of critical files from the environment
    const { currentApplication, currentFilesVersion } = getExistingLink(environmentName);

    if (currentApplication && currentApplication !== appName) {
        console.error('\n=========================== ERROR ===========================');
        console.error(`❌ This environment is already linked to a different app`);
        console.error(`❌ Current app: "${currentApplication}"`);
        console.error('❌ Are you sure you are in the correct repository?');
        console.error('=============================================================\n');
        process.exit(1);
    }

    // Warn if environment is already synced
    if (currentFilesVersion) {
        console.warn('\n========================== WARNING ==========================');
        console.warn(`⚠️  Environment: "${environmentName}"`);
        console.warn(`⚠️  Currently synced with filesVersion: ${currentFilesVersion}`);
        console.warn(
            '⚠️  Proceeding may automatically synchronize changes and delete critical files.'
        );
        console.warn('=============================================================\n');

        console.log(`🔍 Running ggt status for "${environmentName}"...\n`);

        await checkStatus(environmentName);

        console.warn('\n=============================================================\n');
        console.warn('⚠️  Carefully review the changes listed above.');
        const proceed = await confirm('\n❓ Are you sure you want to continue? (y/N): ');

        if (!proceed) {
            console.log('\n❌ Operation cancelled by user.\n');
            process.exit(0);
        }

        console.log('✅ Proceeding with environment sync...\n');
    }

    // If this is the first time we're linking, we need to update package.json
    if (!currentApplication) {
        console.log('🔍 Updating package.json...');
        const pkgPath = path.resolve(process.cwd(), 'package.json');
        const pkgRaw = fs.readFileSync(pkgPath, 'utf8');
        const pkg = JSON.parse(pkgRaw);

        pkg.name = appName;
        pkg.dependencies = pkg.dependencies || {};
        pkg.dependencies[`@${appName}/client`] = 'link:.gadget/client';

        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
        console.log(
            `✅ package.json updated with name "${appName}" and @${appName}/client dependency.`
        );
    }

    const child = spawn(
        'npx',
        [
            'ggt',
            'dev',
            '.',
            `--app=${appName}`,
            `--env=${environmentName}`,
            ...(currentApplication ? [] : ['--allow-unknown-directory']),
        ],
        {
            stdio: 'inherit',
        }
    );

    child.on('close', code => {
        if (code !== 0) {
            console.error(`❌ ggt dev exited with code ${code}`);
            process.exit(code ?? 1);
        }
    });
})();
