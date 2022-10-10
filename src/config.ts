export interface Config {
	[key: string]: {
		[key: string]: string
	}
}

const env = process.env.NODE_ENV

const development = {
	articleStateURL: "http://localhost:8080/api/collection/state",
	collectionURL: "http://localhost:8080/api/collection",
	collectionsURL: "http://localhost:8080/collection/",

	feedStateURL: "http://localhost:8080/api/feed/state",
	feedURL: "http://localhost:8080/feed?id=",
	subscribeURL: "http://localhost:8080/api/feed",

	shareURL: "http://localhost:8080/api/share",

	homeURL: "http://localhost:8080/"
}

const production = {
	articleStateURL: "https://app.metnews.co/api/collection/state",
	collectionURL: "https://app.metnews.co/api/collection",
	collectionsURL: "https://app.metnews.co/collection/",

	feedStateURL: "https://app.metnews.co/api/feed/state",
	feedURL: "https://app.metnews.co/feed?id=",
	subscribeURL: "https://app.metnews.co/api/feed",

	shareURL: "http://app.metnews.co/api/share",

	homeURL: "https://metnews.co/"
}

const config: Config = {
	development,
	production
}

export default config[env ?? "development"]