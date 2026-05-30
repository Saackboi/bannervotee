import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideLottieOptions } from 'ngx-lottie';

import { firebaseProviders } from './core/firebase/firebase.providers';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withViewTransitions()),
    provideLottieOptions({
      player: () => import('lottie-web'),
    }),
    ...firebaseProviders,
  ]
};
