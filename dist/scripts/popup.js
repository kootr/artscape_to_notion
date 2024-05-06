"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const inputElementApi = document.getElementById('user-input-api');
    const saveButtonApi = document.getElementById('save-btn-api');
    const savedInputApi = document.getElementById('saved-input-api');
    const inputElementDb = document.getElementById('user-input-db');
    const saveButtonDb = document.getElementById('save-btn-db');
    const savedInputDb = document.getElementById('saved-input-db');
    saveButtonApi.addEventListener('click', () => {
        const ApiKey = inputElementApi.value;
        chrome.storage.local.set({ ApiKey }, () => {
            savedInputApi.textContent = ApiKey;
        });
        inputElementApi.value = '';
    });
    saveButtonDb.addEventListener('click', () => {
        const DBID = inputElementDb.value;
        chrome.storage.local.set({ DBID }, () => {
            savedInputDb.textContent = DBID;
        });
        inputElementDb.value = '';
    });
    chrome.storage.local.get(['ApiKey', 'DBID'], (result) => {
        savedInputApi.textContent = '*****' + result.ApiKey.slice(-5) || '';
        savedInputDb.textContent = '*****' + result.DBID.slice(-5) || '';
    });
});
