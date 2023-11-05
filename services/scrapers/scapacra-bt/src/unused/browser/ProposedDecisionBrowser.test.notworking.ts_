import { describe } from 'mocha';
import { ProposedDecisionBrowser } from './ProposedDecisionBrowser';

import bundestagListBrowserTest = require('./BundestagListBrowser.testbase');

describe('Check Bundestag proposed decision browser', () => {
    bundestagListBrowserTest.checkBundestagListBrowser((options) => {
        return new ProposedDecisionBrowser(options);    
    });
});