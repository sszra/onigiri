import { HttpError } from "fresh";
import { define, env } from "~/utils/core.ts";
import { STATUS_CODE } from "@std/http/status";

export const handler = define.handlers({
	async GET(ctx) {
		const code = ctx.url.searchParams.get("code");

		if (!code) {
			throw new HttpError(STATUS_CODE.Unauthorized);
		} else {
			const { access_token } = await fetch(
				"https://oauth2.googleapis.com/token",
				{
					method: "POST",
					headers: {
						"content-type": "application/x-www-form-urlencoded",
					},
					body: new URLSearchParams({
						client_id: env("GOOGLE_CLIENT_ID", true),
						client_secret: env("GOOGLE_CLIENT_SECRET", true),
						code,
						grant_type: "authorization_code",
						redirect_uri: env("GOOGLE_REDIRECT_URI", true),
					}),
				},
			).then((res) => res.json());

			const url = new URL("https://people.googleapis.com/v1/people/me");
			const personFields = [
				"names",
				"nicknames",
				"photos",
			];

			url.searchParams.set("personFields", personFields.join(","));

			const currentUser = await fetch(url, {
				headers: {
					authorization: `Bearer ${access_token}`,
				},
			}).then((res) => res.json());

			return Response.json(currentUser);
		}
	},
});
