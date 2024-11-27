import { useEffect, useReducer, useRef, useState } from "preact/hooks";
import { APIMessage } from "~/utils/chat.ts";
import { Message } from "~/components/Message.tsx";
import { server } from "~/helpers/server.ts";

export function Chat(
	{ initialMessages, roomId }: {
		initialMessages: APIMessage[];
		roomId: string;
	},
) {
	const messagesContainer = useRef<HTMLDivElement>(null);
	const [messages, addMessage] = useReducer<APIMessage[], APIMessage>(
		(messages, message) => [...messages, message],
		initialMessages,
	);
	const [input, setInput] = useState<string>("");

	useEffect(() => {
		const container = messagesContainer.current;

		if (container) {
			container.scrollTop = container.scrollHeight;
		}
	}, [messages.length]);

	useEffect(() => {
		const subscription = server.subscribe(roomId, addMessage);
		return () => subscription.unsubscribe();
	}, []);

	function send() {
		if (input !== "") {
			server.sendMessage(roomId, input);
			setInput("");
		}
	}

	return (
		<div class="flex flex-col w-full">
			<div
				class="flex flex-col overflow-y-auto grow"
				ref={messagesContainer}
			>
				{messages.map((message) => <Message data={message} />)}
			</div>
			<div class="flex bg-slate-200 p-3 gap-2 mb-4 rounded-full">
				<input
					class="grow bg-slate-200 outline-none placeholder:text-slate-500"
					placeholder="Write a message.."
					onInput={(input) => setInput(input.currentTarget.value)}
					value={input}
				/>
				<button class="bg-black rounded-full size-10" onClick={send}>
				</button>
			</div>
		</div>
	);
}
