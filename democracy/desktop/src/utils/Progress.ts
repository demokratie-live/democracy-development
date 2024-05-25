import ProgressBar from '@badrap/bar-of-progress';
import { Router } from 'next/router';

export const Progress = {
  init() {
    const progress = new ProgressBar({
      size: 2,
      color: '#4494d3',
      className: 'bar-of-progress z-50 !top-16',
      delay: 100,
    });
    Router.events.on('routeChangeStart', progress.start);
    Router.events.on('routeChangeComplete', progress.finish);
    Router.events.on('routeChangeError', progress.finish);
  },
};
