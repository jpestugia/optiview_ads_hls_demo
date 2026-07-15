# Security

## Reporting

Report security issues privately through GitHub's security advisory feature. Do not open a public issue for a suspected vulnerability or exposed credential.

## Credentials

Do not commit `.env` files, THEOplayer licenses, AWS credentials, or OptiView Ads API tokens. Local values belong in `.env.local`; deployment values belong in GitHub Actions secrets.

This is a static browser application. Values prefixed with `VITE_` are embedded in the generated JavaScript and can be inspected by users of the deployed site. Public deployments must use scoped, non-production API credentials. Use a server-side proxy when credentials must remain confidential.
