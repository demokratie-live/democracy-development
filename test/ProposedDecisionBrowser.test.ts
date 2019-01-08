import { describe } from 'mocha';
import { ProposedDecisionBrowser } from '../src/browser/ProposedDecisionBrowser';

import bundestagListBrowserTest = require('./BundestagListBrowser.testbase');

describe('Check Bundestag proposed decision browser', () => {
    bundestagListBrowserTest.checkBundestagListBrowser((options) => {
        return new ProposedDecisionBrowser(options);    
    });
});