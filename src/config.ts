export interface Config {
	[key: string]: {
		[key: string]: string
	}
}

const env = process.env.NODE_ENV

const development = {
	articleStateURL: "http://localhost:8080/api/collection/state",
	collectionURL: "http://localhost:8080/api/collection",
	feedStateURL: "http://localhost:8080/api/feed/state",
	subscribeURL: "http://localhost:8080/api/feed",
	shareURL: "http://localhost:8080/api/share",

	collectionsURL: "http://localhost:8080/collection/",
	feedURL: "http://localhost:8080/feed?id=",
}

const production = {
	articleStateURL: "https://app.metnews.co/api/collection/state",
	collectionURL: "https://app.metnews.co/api/collection",
	feedStateURL: "https://app.metnews.co/api/feed/state",
	subscribeURL: "https://app.metnews.co/api/feed",
	shareURL: "https://app.metnews.co/api/share",

	collectionsURL: "https://app.metnews.co/collection/",
	feedURL: "https://app.metnews.co/feed?id=",
}

const config: Config = {
	development,
	production
}

export default config[env ?? "development"]