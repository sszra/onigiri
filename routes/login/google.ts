import { define, env } from "~/utils/core.ts";

export const handler = define.handlers({
	GET(ctx) {
		const url = new URL("https://accounts.google.com/o/oauth2/auth");
		const scopes = [
			"https://www.googleapis.com/auth/userinfo.profile",
		];

		url.searchParams.set("client_id", env("GOOGLE_CLIENT_ID", true));
		url.searchParams.set("redirect_uri", env("GOOGLE_REDIRECT_URI", true));
		url.searchParams.set("response_type", "code");
		url.searchParams.set("scope", scopes.join(" "));

		return ctx.redirect(url.toString());
	},
});
