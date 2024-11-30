import { createDefine } from "fresh";

// deno-lint-ignore no-empty-interface
export interface State {}

export const define = createDefine<State>();
export const kv = await Deno.openKv();

export function env(name: string, required: true): string;
export function env(name: string, required?: false): string | undefined;
export function env(name: string, required?: boolean): string | undefined {
	const env = Deno.env.get(name);

	if (required) {
		if (!env) {
			throw new Error(`Environment variable not found: "${name}"`);
		} else {
			return env;
		}
	} else {
		return env;
	}
}
