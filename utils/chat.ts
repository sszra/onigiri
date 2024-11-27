import { kv } from "~/utils/core.ts";
import { snowflake } from "~/utils/snowflake.ts";

export async function createMessage(roomId: string, data: APICreateMessage) {
	const id = snowflake();
	const newMessage: APIMessage = {
		id,
		content: data.content,
	};

	const { ok } = await kv.atomic().set(["messages", roomId, id], newMessage)
		.commit();

	if (ok) {
		return newMessage;
	} else {
		throw new Error("Failed to create message.");
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

export class Server {
	subscribe(
		roomId: string,
		onMessage: (message: APIMessage) => void | Promise<void>,
	) {
		const events = new EventSource(`/api/rooms/${roomId}/connect`);

		function listener(message: MessageEvent<string>) {
			const data: APIMessage = JSON.parse(message.data);
			onMessage(data);
		}

		events.addEventListener("message", listener);

		return {
			unsubscribe() {
				events.removeEventListener("message", listener);
			},
		};
	}

	sendMessage(roomId: string, content: string) {
		fetch(`/api/rooms/${roomId}/messages`, {
			body: JSON.stringify({ content }),
			method: "POST",
		});
	}
}

export const server = new Server();

export interface APIMessage {
	id: string;
	content: string;
}
export type APICreateMessage = Omit<APIMessage, "id">;
