import EmojiConvertor from "emoji-js";

const emoji = new EmojiConvertor();
emoji.replace_mode = "unified";
emoji.allow_native = true;

export function renderWithEmojis(text: string): string {
	return emoji.replace_colons(text);
}
