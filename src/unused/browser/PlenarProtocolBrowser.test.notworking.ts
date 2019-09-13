import { describe, it } from 'mocha';
import { assert } from 'chai';
import { PlenarProtocolBrowser } from './PlenarProtocolBrowser';

import bundestagListBrowserTest = require('./BundestagListBrowser.testbase');
import validator = require('xsd-schema-validator');

const protocolXsdSchemaFileName = 'test/schemas/dbtplenarprotokoll-data.xsd';

describe('Check Bundestag protocol browser', () => {
    bundestagListBrowserTest.checkBundestagListBrowser((options) => {
        return new PlenarProtocolBrowser(options);    
    });

    it('Protocol blob request should return an valid xml (works only online)', function(done) {
        this.timeout(0);

        let browser = new PlenarProtocolBrowser({
            maxCount: 5
        });

        browser.next().value
            .then((result:any) => {
                assert.isNotNull(result);

                validator.validateXML(result.data.openStream(), `${protocolXsdSchemaFileName}`, (error, result) =>{
                    assert.isTrue(result.valid);
                    assert.isNull(error);
                    
                    done();
                });
            })
            .catch((error:any) => done(error));  
    });
});