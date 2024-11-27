import { APIMessage } from "~/utils/chat.ts";

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
