import { it } from 'mocha';
import { assert } from 'chai';
import { URL } from 'url';
import { BundestagListBrowser, IBundestagListBrowserOptions } from '../src/browser/BundestagListBrowser';
import { DataType } from '../src/importer/Importer';

const baseUrl = new URL("https://www.bundestag.de");

export function checkBundestagListBrowser<T extends DataType>(createBundestagListBrowser: (options: IBundestagListBrowserOptions) => BundestagListBrowser<T>) {
    checkForValidUrlGeneration<T>(createBundestagListBrowser);
    checkCasePageSizeEqualsMaxCount<T>(createBundestagListBrowser);
    checkCasePageSizeLessThanMaxCount<T>(createBundestagListBrowser);
    checkCasePageSizeGreaterThanMaxCount<T>(createBundestagListBrowser);
}

function checkForValidUrlGeneration<T extends DataType>(createBundestagListBrowser: (options: IBundestagListBrowserOptions) => BundestagListBrowser<T>) {
    it('Generated URL should always be valid for every page offset', () => {
        let browser = createBundestagListBrowser({
            maxCount: 5
        });
        browser.setUrl(baseUrl);

        const urlRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

        for (let page = 0; page < 20; page++) {
            let offset = page * browser.getPageSize();
            let url = <URL>browser['getNextRequestUrl'](baseUrl, page);
            assert.isNotNull(url);
            assert.match(url.toString(), urlRegex);
            assert.equal(url.toString(), `${baseUrl.toString()}${browser.getListAjaxRequestPath()}?limit=5&noFilterSet=true&offset=${offset}`);
        }
    });
}

function checkCasePageSizeEqualsMaxCount<T extends DataType>(createBundestagListBrowser: (options: IBundestagListBrowserOptions) => BundestagListBrowser<T>) {
    let browser = createBundestagListBrowser({ maxCount: 0 });
    browser = createBundestagListBrowser({ maxCount: browser.getPageSize() })

    it(`should work with maxCount(${browser.getMaxCount()}) == pageSize(${browser.getPageSize()}) (works online only)`, function (done) {
        this.timeout(0);

        checkBrowser<T>(browser)
            .then(() => done())
            .catch(error => done(error));
    });
}

function checkCasePageSizeLessThanMaxCount<T extends DataType>(createBundestagListBrowser: (options: IBundestagListBrowserOptions) => BundestagListBrowser<T>) {
    let browser = createBundestagListBrowser({ maxCount: 0 });
    browser = createBundestagListBrowser({ maxCount: browser.getPageSize()-1 })

    it(`should work with maxCount(${browser.getMaxCount()}) < pageSize(${browser.getPageSize()}) (works online only)`, function (done) {
        this.timeout(0);

        checkBrowser<T>(browser)
            .then(() => done())
            .catch(error => done(error));
    });
}

function checkCasePageSizeGreaterThanMaxCount<T extends DataType>(createBundestagListBrowser: (options: IBundestagListBrowserOptions) => BundestagListBrowser<T>) {
    let browser = createBundestagListBrowser({ maxCount: 0 });
    browser = createBundestagListBrowser({ maxCount: browser.getPageSize()+1 })

    it(`should work with maxCount(${browser.getMaxCount()}) > pageSize(${browser.getPageSize()}) (works online only)`, function (done) {
        this.timeout(0);

        checkBrowser<T>(browser)
            .then(() => done())
            .catch(error => done(error));
    });
}

async function checkBrowser<T extends DataType>(browser: BundestagListBrowser<T>): Promise<any> {
    browser.setUrl(baseUrl);
    let counter = 0;
    let promises: Promise<any>[] = [];
    for (const fragment of browser) {
        let result = await fragment;
        assert.isNotNull(result);
            
        promises.push(fragment);
        counter++;
    }
    assert.equal(counter, browser.getMaxCount());
    Promise.all(promises);
}