import React from 'react';
import ReactDOM from 'react-dom';
import { browser } from 'webextension-polyfill-ts';
import { Callout } from '@fluentui/react'
import { mergeStyleSets } from '@fluentui/react/lib/Styling';
import { IPageMetadata, IFeedMetadata, IArticleState } from '../background_scripts/index'
import config from '../config'
import ErrorMessage from './ErrorMessage';
import { ShadowView } from "shadow-view";

// 1s
const waitDuration = 1000

const feedURL = config.feedURL
const collectionsURL = config.collectionsURL

async function start() {
	document.addEventListener('mousedown', closeMenu)
}

// waiting a while for client side rendered dom ready
setTimeout(start, waitDuration)

// On page loaded update feed notification
browser.runtime.sendMessage({
	"action": "updateBadge",
})

let _rootDiv: HTMLElement

const styles = mergeStyleSets({
	menu: {
		display: "block !important",
		width: 256,
		padding: '10px 20px',
		backgroundColor: "white",
	},
})

function getPageCanonicalURL(): string | undefined {
	const canonicalURLLinkElement = document.querySelector('head link[rel="canonical"]') as HTMLLinkElement
	if (canonicalURLLinkElement) {
		return canonicalURLLinkElement.href
	}

	const canonicalURLMetaElement = document.querySelector('head meta[property="og:url"]') as HTMLMetaElement
	if (canonicalURLMetaElement) {
		return canonicalURLMetaElement.content
	}
	return
}

function getPageFeedMetadata(): IFeedMetadata | undefined {
	const rssLinkElement = document.querySelector('head link[type="application/rss+xml"]') as HTMLLinkElement
	if (rssLinkElement) {
		return {
			url: rssLinkElement.href,
			title: rssLinkElement.title
		}
	}
	const atomLinkElement = document.querySelector('head link[type="application/atom+xml"]') as HTMLLinkElement
	if (atomLinkElement) {
		return {
			url: atomLinkElement.href,
			title: atomLinkElement.title,
		}
	}
	return
}

function getPageMetadata(): IPageMetadata {
	const canonicalURL = getPageCanonicalURL()
	const feed = getPageFeedMetadata()
	return {
		page: {
			url: window.location.href,
			title: document.title,
			canonicalURL: canonicalURL,
		},
		feed: feed,
	}
}

browser.runtime.onMessage.addListener(async (msg) => {
	switch (msg.action) {
		case "queryPageMetadata":
			return getPageMetadata()
		case "openMenu":
			return openMenu()
	}
})

const menuStyles = `
.menu {
	padding: 4px 10px;
	display: flex;
	flex-direction: row;
	column-gap: 12px;
	align-items: center;
	justify-content: space-evenly;
}

.button {
	cursor: pointer;
}

.button a {
	display: flex;
}

.button img {
	height: 18px;
	width: 18px;
}

.disabled {
	cursor: default;
}

.message {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
}
`

function openMenu() {
	const left = window.innerWidth - 10
	const top = 10

	if (!_rootDiv) {
		_rootDiv = document.createElement('div')
		document.body.appendChild(_rootDiv)
	}

	ReactDOM.render(
		<React.StrictMode>
			<Callout
				id="metword-menu"
				className={styles.menu}
				role="dialog"
				gapSpace={0}
				isBeakVisible={false}
				target={{ left: left, top: top }}
			>
				<ShadowView styleContent={menuStyles}>
					<Menu></Menu>
				</ShadowView>
			</Callout>
		</React.StrictMode >,
		_rootDiv
	)
}

const closeMenu = () => {
	try {
		ReactDOM.unmountComponentAtNode(_rootDiv)
	} catch (e) { }
}

const starIcon = browser.runtime.getURL("icons_normal/star.png")
const rssIcon = browser.runtime.getURL("icons_normal/rss.png")
const searchIcon = browser.runtime.getURL("icons_normal/search.png")
const shareIcon = browser.runtime.getURL("icons_normal/share.png")
const closeIcon = browser.runtime.getURL("icons_normal/close.png")

const starActive = browser.runtime.getURL("icons_active/star.png")
const rssActive = browser.runtime.getURL("icons_active/rss.png")

const rssDisabled = browser.runtime.getURL("icons_normal/rss-disabled.png")

export function Menu() {
	const [errMessage, setErrMessage] = React.useState<string | false>(false)
	const { state, setState } = useArticleState()

	if (errMessage) return (
		<div className='message'>
			<ErrorMessage errMessage={errMessage}></ErrorMessage>
			<div className='button'>
				<a onClick={() => closeMenu()}>
					<img src={closeIcon}></img>
				</a>
			</div>
		</div>
	)
	if (!state) return (
		<div className='message'>
			<ErrorMessage errMessage={"Loading..."}></ErrorMessage>
		</div>
	)

	const metadata = getPageMetadata()
	const pageMetadata = metadata.page
	const feedMetadata = metadata.feed
	const collection = state.collection
	const feed = state.feed

	return (
		<div className='menu'>
			{!collection.inCollection &&
				<div className='button'>
					<a title="Add To Collections" onClick={() => addCollection(pageMetadata.url, pageMetadata.title)}>
						<img src={starIcon}></img>
					</a>
				</div>
			}

			{collection.inCollection &&
				<div className='button'>
					<a title='Remove From Collections' onClick={() => deleteCollection(collection.id!)}>
						<img src={starActive}></img>
					</a>
				</div>
			}

			{!feedMetadata &&
				<div className='button disabled'>
					<a title="No Feed Available">
						<img src={rssDisabled}></img>
					</a>
				</div>
			}
			{feedMetadata && feed && !feed.subscribed &&
				<div className='button'>
					<a title='Subscribe to Feed' onClick={() => subscribe(feedMetadata.url, feedMetadata.title)}>
						<img src={rssIcon}></img>
					</a>
				</div>
			}
			{feedMetadata && feed && feed.subscribed &&
				<div title='View Feed' className="button">
					<a href={feedURL + feed.id} target="_blank">
						<img src={rssActive}></img>
					</a>
				</div>
			}

			<div className="button">
				<a title="Search Collections" href={collectionsURL} target="_blank">
					<img src={searchIcon}></img>
				</a>
			</div>

			<div className='button'>
				<a title="Share to News" onClick={() => share(pageMetadata.url, pageMetadata.title)}>
					<img src={shareIcon}></img>
				</a>
			</div>

			<div className='button'>
				<a title="Close" onClick={() => closeMenu()}>
					<img src={closeIcon}></img>
				</a>
			</div>
		</div>
	)

	async function addCollection(url: string, title: string) {
		const { data, errMessage } = await browser.runtime.sendMessage({
			action: "addCollection",
			url: url,
			title: title,
		})
		if (errMessage) {
			setErrMessage(errMessage)
			return
		}
		setState({
			collection: {
				inCollection: true,
				id: data.collection.id,
			},
			feed: state?.feed
		})
	}

	async function deleteCollection(id: number) {
		const { _, errMessage } = await browser.runtime.sendMessage({
			action: "deleteCollection",
			id: id
		})
		if (errMessage) {
			setErrMessage(errMessage)
			return
		}
		setState({
			collection: {
				inCollection: false,
			},
			feed: state?.feed
		})
	}

	async function subscribe(feedURL: string, feedTitle: string) {
		const { data, errMessage } = await browser.runtime.sendMessage({
			action: "subscribe",
			feedURL: feedURL,
			feedTitle: feedTitle,
		})
		if (errMessage) {
			setErrMessage(errMessage)
			return
		}
		setState({
			collection: state!.collection,
			feed: {
				url: state!.feed!.url,
				subscribed: true,
				id: data.feed.id,
			}
		})
	}

	async function share(url: string, title: string) {
		const { data, errMessage } = await browser.runtime.sendMessage({
			action: "share",
			url: url,
			title: title,
		})
		if (errMessage) {
			setErrMessage(errMessage)
			return
		}
		setErrMessage("Success! Thanks for sharing!")
	}
}

function useArticleState() {
	const [state, setState] = React.useState<IArticleState | null>(null)

	React.useEffect(() => {
		async function sendMessage(msg: { action: string }) {
			const data = await browser.runtime.sendMessage(msg)
			setState(data)
		}

		sendMessage({ action: "getArticleStatePopup" })
	}, [])

	return { state, setState }
}