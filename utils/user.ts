import { snowflake } from "~/utils/snowflake.ts";
import { kv } from "~/utils/core.ts";

export const FORMATTING_PATTERN = {
	Username: /^[a-z0-9]{3,20}$/,
};

export async function createUser(
	{ username, flags, connections = [] }: APICreateUser,
) {
	if (!username.match(FORMATTING_PATTERN.Username)) {
		throw new Error("Username is invalid.");
	} else {
		const id = snowflake();
		const newUser: APIUser = {
			id,
			username,
			flags,
		};

		// TODO(@sszra): user avatar feature

		const atomic = kv.atomic();

		checkUsernameAvailability(atomic, username);
		setUserConnections(atomic, id, connections);

		const result = await atomic.set([
			"users",
			"byId",
			id,
		], newUser).set(["users", "byUsername", username], id).commit();

		if (result.ok) {
			return newUser;
		} else {
			throw new Error("Failed to create user.");
		}
	}
}

export function checkUsernameAvailability(
	atomic: Deno.AtomicOperation,
	username: string,
) {
	atomic.check({
		key: ["users", "byUsername", username],
		versionstamp: null,
	});
}

export function setUserConnections(
	atomic: Deno.AtomicOperation,
	userId: string,
	connections: APIUserConnection[],
) {
	for (const connection of connections) {
		atomic.set([
			"users",
			"byConnection",
			connection.platform,
			connection.id,
		], userId);
	}
	atomic.set(["users", "byId", userId, "connections"], connections);
}
export interface APIUser {
	id: string;
	username: string;
	flags: UserFlags;
	avatarUrl?: string;
}

export interface APIUserConnection {
	platform: APIUserConnectionPlatform;
	id: string;
}
export type APIUserConnectionPlatform = "google";

export interface APICreateUser extends Omit<APIUser, "id"> {
	connections?: APIUserConnection[];
}

export enum UserFlags {
	None = 0,
	Verified = 1 << 0,
}
