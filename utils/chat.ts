import { HttpError } from "fresh";
import { STATUS_CODE } from "@std/http/status";
import { kv } from "~/utils/core.ts";
import { snowflake } from "~/utils/snowflake.ts";

export async function createMessage(
	roomId: string,
	{ content }: APICreateMessage,
) {
	if (content.trim() !== "") {
		const id = snowflake();
		const newMessage: APIMessage = {
			id,
			content,
		};

		const { ok } = await kv.atomic().set(
			["messages", roomId, id],
			newMessage,
		)
			.commit();

		if (ok) {
			return newMessage;
		} else {
			throw new HttpError(
				STATUS_CODE.InternalServerError,
				"Failed to create message.",
			);
		}
	} else {
		throw new HttpError(
			STATUS_CODE.BadRequest,
			"Message content can't be empty.",
		);
	}
}

export async function retrieveMessages(
	roomId: string,
): Promise<APIMessage[]> {
	const fetchedMessages = await Array.fromAsync(
		kv.list<APIMessage>({ prefix: ["messages", roomId] }),
	);
	return fetchedMessages.map((data) => data.value);
}

export class Room {
	#channel: BroadcastChannel;

	constructor(roomId: string) {
		this.#channel = new BroadcastChannel(roomId);
	}

	close() {
		this.#channel.close();
	}

	onMessage(handler: (message: APIMessage) => void) {
		function listener(event: MessageEvent<APIMessage>) {
			handler(event.data);
		}

		this.#channel.addEventListener("message", listener);

		return {
			unsubscribe: () => {
				this.#channel.removeEventListener("message", listener);
			},
		};
	}

	sendMessage(message: APIMessage) {
		this.#channel.postMessage(message);
	}
}

export interface APIMessage {
	id: string;
	content: string;
}
export type APICreateMessage = Omit<APIMessage, "id">;
