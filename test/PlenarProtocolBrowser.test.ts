import { describe, it } from 'mocha';
import validator = require('xsd-schema-validator');

import { URL } from 'url';
import { assert } from 'chai';
import { PlenarProtocolBrowser } from '../src/browser/PlenarProtocolBrowser';
import { setTimeout } from 'timers';

const urlRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
const protocolXsdSchemaFileName = 'test/schemas/dbtplenarprotokoll-data.xsd';

describe('Check protocol browser', () => {
    it('Generated URL should always be valid for any pages', () => {
        let browser = new PlenarProtocolBrowser({
            maxCount: 5
        });

        let baseUrl = new URL("https://www.bundestag.de");

        for (let page = 0; page < 20; page++) {
            let offset = page * PlenarProtocolBrowser.pageSize;
            let url = <URL>browser['getNextRequestUrl'](baseUrl, page);

            assert.isNotNull(url);
            assert.match(url.toString(), urlRegex);
            assert.equal(url.toString(), `https://www.bundestag.de/ajax/filterlist/de/service/opendata/-/543410?limit=5&noFilterSet=true&offset=${offset}`);
        }      
    });

    it('Protocol blob request should return an valid xml (works only online)', function(done) {
        this.timeout(5000);

        let browser = new PlenarProtocolBrowser({
            maxCount: 5
        });

        browser.setUrl(new URL("https://www.bundestag.de"));

        browser.next().value
            .then(result => {
                assert.isNotNull(result);

                validator.validateXML(result.openStream(), `${protocolXsdSchemaFileName}`, (error, result) =>{
                    assert.isTrue(result.valid);
                    assert.isNull(error);
                    
                    done();
                });
            })
            .catch(error => done(error));  
    });

    it('should work with maxCount < 5 (works only online)', function(done) {
        this.timeout(10000);

        let browser = new PlenarProtocolBrowser({
            maxCount: 3
        });

        browser.setUrl(new URL("https://www.bundestag.de"));

        let counter = 0;

        let promises: Promise<any>[] = [];
        for (const fragment of browser) {
            fragment
            .then(result => {
                assert.isNotNull(result);
            })
            .catch(error => done(error));
            
            promises.push(fragment);

            counter++;
        }

        assert.equal(counter, 3);

        Promise.all(promises);

        done();
    });

    it('should work with maxCount > 5 (works only online)', function(done) {
        this.timeout(10000);

        let browser = new PlenarProtocolBrowser({
            maxCount: 7
        });

        browser.setUrl(new URL("https://www.bundestag.de"));

        let counter = 0;

        let promises: Promise<any>[] = [];
        for (const fragment of browser) {
            fragment
            .then(result => {
                assert.isNotNull(result);
            })
            .catch(error => done(error));
            
            promises.push(fragment);

            counter++;
        }

        assert.equal(counter, 7);

        Promise.all(promises);

        done();
    });
});