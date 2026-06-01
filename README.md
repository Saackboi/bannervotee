# BannerVote

A web platform to showcase banner designs and let visitors vote for their favorites. Participants receive a unique QR link to their design, making it easy to share and promote their work.

## Features

- 3D coverflow carousel for browsing designs
- Anonymous voting (one vote per visitor)
- QR sharing per banner via direct links
- Admin dashboard to manage banners and voting settings
- Responsive layout for mobile, tablet, and desktop
- Real-time updates with Firestore

## Technologies

Built with Angular, Firebase (Authentication, Firestore, Hosting), and Tailwind CSS.

## Local setup

1. Clone the repository.
2. Run `npm install`.
3. Configure your Firebase project credentials in `src/environments/environment.ts` (use `environment.example.ts` as reference).
4. Run `npm run build` to generate the production bundle.
5. Deploy with `firebase deploy --only hosting`.

## License

MIT
