import { APIMessage } from "~/utils/chat.ts";

export function Message({ data }: { data: APIMessage }) {
	return (
		<div class="flex flex-col bg-slate-100 p-3">
			<p>
				{data.content.split("\n").map((content) => (
					<>
						{content}
						<br />
					</>
				))}
			</p>
		</div>
	);
}
