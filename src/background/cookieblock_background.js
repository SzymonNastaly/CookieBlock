// Author: Dino Bollinger
// License: MIT

// General TODO: try catch blocks around async code

/**
 * Asynchronous callback function to set up config defaults.
 * @param {Object} resp  Default configuration
 */
const setupDefaults = async function(defaultConfig) {
  let dp = defaultConfig["default_policy"];
  let policy = (await browser.storage.sync.get("cblk_userpolicy"))["cblk_userpolicy"];
  if (policy === undefined) {
    policy = [dp["acc_nec"], dp["acc_func"], dp["acc_anal"], dp["acc_ads"]];
    browser.storage.sync.set({"cblk_userpolicy": policy });
  }

  let ulimit = (await browser.storage.sync.get("cblk_ulimit"))["cblk_ulimit"];
  if (ulimit === undefined) {
    ulimit = defaultConfig["update_limit"];
    browser.storage.sync.set({"cblk_ulimit": ulimit });
  }
}

/**
* Listener that is executed any time a cookie is added, updated or removed.
* Classifies the cookie and rejects it based on user policy.
* @param {Object} changeInfo  Contains the cookie itself, and cause info.
*/
const cookieChangeListener = async function(changeInfo) {
    // do nothing in this case
    if (changeInfo.removed) {
        return;
    }

    // construct the key for keeping track of cookie updates
    let cookieDat = changeInfo.cookie;
    let ckey = cookieDat.name + ";" + cookieDat.domain + ";" + cookieDat.path;
    enforcePolicy(ckey, cookieDat);
};


/**
 * Listener function that opens the first time setup when the extension is installed.
 * @param {Object} details Contains the reason for the change.
 */
const firstTimeSetup = function(details) {
  if (details.reason === "install") {
    browser.tabs.create({"active": true, "url": "/options/cookieblock_setup.html"});
  }
}

getLocalData(browser.extension.getURL("ext_data/default_config.json"), "json", setupDefaults);
browser.cookies.onChanged.addListener(cookieChangeListener);
browser.runtime.onInstalled.addListener(firstTimeSetup);
