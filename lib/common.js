/* eslint-disable no-console */
const {execSync} = require('child_process');
const {getAddress} = require('./arweaveHelper.js');
const {readFileSync} = require('fs');

const ANSI_RESET = '\x1b[0m';
const ANSI_RED = '\x1b[31m';
const ANSI_GREEN = '\x1b[32m';

const PL_TMP_PATH = '.protocol.land';
const GIT_CONFIG_KEYFILE = 'protocol.land.keyfile';
const getWarpContractTxId = () => 'w5ZU15Y2cLzZlu3jewauIlnzbKw-OAxbN9G5TbuuiDQ';

const log = (message, options) => {
  if (!options) {
    console.error(` [PL] ${message}`);
  } else {
    const {color} = options;
    console.error(
      `${color === 'red' ? ANSI_RED : ANSI_GREEN} [PL] ${message}${ANSI_RESET}`
    );
  }
};

let wallet = null;

const getJwkPath = () => {
  try {
    return execSync(`git config --get ${GIT_CONFIG_KEYFILE}`).toString().trim();
  } catch (error) {
    return '';
  }
};

const walletNotFoundMessage = (params = {warn: false}) => {
  const {warn} = params;
  if (warn) {
    log(
      `If you need to push to the repo, please set up the path to your Arweave JWK.`,
      {color: 'green'}
    );
  } else {
    log(`Failed to get wallet keyfile path from git config.`);
    log(
      `You need an owner or contributor wallet to have write access to the repo.`,
      {color: 'red'}
    );
  }
  log(
    `Run 'git config --add ${GIT_CONFIG_KEYFILE} YOUR_WALLET_KEYFILE_FULL_PATH' to set it up`,
    {color: 'green'}
  );
  log(`Use '--global' to have a default keyfile for all Protocol Land repos`, {
    color: 'green',
  });
  return null;
};

const getWallet = (params = {warn: false}) => {
  if (wallet) {
    return wallet;
  }
  const jwkPath = getJwkPath();
  if (!jwkPath) {
    return walletNotFoundMessage(params);
  }
  try {
    const jwk = readFileSync(jwkPath, {encoding: 'utf-8'}).toString().trim();
    if (!jwk) {
      return walletNotFoundMessage();
    }
    wallet = JSON.parse(jwk);
    return wallet;
  } catch (error) {
    return walletNotFoundMessage();
  }
};

const ownerOrContributor = async (repo) => {
  wallet = getWallet({warn: false});

  // if missing wallet, exit without running gitCommand (getWallet prints a message)
  if (!wallet) {
    process.exit(0);
  }

  const address = await getAddress(wallet);
  const ownerOrContrib =
    repo.owner === address ||
    repo.contributors.some((contributor) => contributor === address);
  return ownerOrContrib;
};

const waitFor = (delay) => new Promise((res) => setTimeout(res, delay));

const exitWithError = (message) => {
  log(``);
  log(`${message}`);
  log(``);
  process.exit(1);
};

async function withAsync(fn) {
  try {
    if (typeof fn !== 'function') {
      throw new Error('The first argument must be a function');
    }
    const response = await fn();
    return {
      response,
      error: null,
    };
  } catch (error) {
    return {
      error,
      response: null,
    };
  }
}

exports.PL_TMP_PATH = PL_TMP_PATH;
exports.GIT_CONFIG_KEYFILE = GIT_CONFIG_KEYFILE;
exports.getWarpContractTxId = getWarpContractTxId;
exports.log = log;
exports.getJwkPath = getJwkPath;
exports.getWallet = getWallet;
exports.ownerOrContributor = ownerOrContributor;
exports.waitFor = waitFor;
exports.exitWithError = exitWithError;
exports.withAsync = withAsync;
