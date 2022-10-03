export interface Config {
	[key: string]: {
		[key: string]: string
	}
}

const env = process.env.NODE_ENV

const development = {
	meetsURL: "http://localhost:8080/meet/times",
	queryURL: "http://localhost:8080/word?word=",
	addSceneURL: "http://localhost:8080/scene",
	forgetSceneURL: "http://localhost:8080/scene?id=",
	knowURL: "http://localhost:8080/meet/toggle?id=",

	articleStateURL: "http://localhost:8080/api/collection/state",
	collectionURL: "http://localhost:8080/api/collection",

	feedStateURL: "http://localhost:8080/api/feed/state",
	feedURL: "http://localhost:8080/feed?id=",
	subscribeURL: "http://localhost:8080/api/feed",
	homeURL: "http://localhost:8080/"
}

const production = {
	meetsURL: "https://app.metword.co/meet/times",
	queryURL: "https://app.metword.co/word?word=",
	addSceneURL: "https://app.metword.co/scene",
	forgetSceneURL: "https://app.metword.co/scene?id=",
	knowURL: "https://app.metword.co/meet/toggle?id=",

	articleStateURL: "https://app.metword.co/api/collection/state",
	collectionURL: "https://app.metword.co/api/collection",

	feedStateURL: "https://app.metword.co/api/feed/state",
	feedURL: "https://app.metword.co/feed?id=",
	subscribeURL: "https://app.metword.co/api/feed",
	homeURL: "https://metword.co/"
}

const config: Config = {
	development,
	production
}

export default config[env ?? "development"]