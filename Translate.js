// @ts-check
/**
 * Translate Api wrapper
 */
export default class Translate {
	/**
	 * @type {URL}
	 */
	baseURL
	/**
	 * @type {string?}
	 */
	apikeys
	cachedResponses = new Map()
	/**
	 * @param {string | URL} baseURL The url of the api server
	 * @param {string?} [apiKeys] The api keys of the endpoint
	 */
	constructor(baseURL = "https://libretranslate.com", apiKeys) {
		this.baseURL = new URL(baseURL)
		this.apiKeys = apiKeys
	}

	/**
	 * Call the POST method for the endpoint
	 * @param {string} endpoint The endpoint on the server to call
	 * @param {Object} params The parameters of the api to be sent to the server
	 * @returns {Promise<any>} The object respose sent from the server
	 */
	async call(endpoint, params = {}) {
		const url = new URL(endpoint, this.baseURL)

		const res = await fetch(url, {
			method: "POST",
			body: JSON.stringify({ ...params, api_key: this.apiKeys }),
			headers: { "Content-Type": "application/json" }
		})

		const data = await res.json()
		if (!res.ok) {
			throw new Error(data.error || 'Api Error')
		}

		return data
	}

	/**
	 * Call the GET method for the endpoint and cache them
	 * @param {string} endpoint The endpoint on the server to call
	 * @returns {Promise<any>} The object respose sent from the server
	 */
	async callCache(endpoint) {
		const url = new URL(endpoint, this.baseURL)

		if (this.cachedResponses.has(url)) {
			return this.cachedResponses.get(url)
		}

		const res = await fetch(url, {
			headers: { "Content-Type": "application/json" }
		})

		const data = await res.json()
		if (!res.ok) {
			throw new Error(data?.error ?? 'Api Error')
		}

		this.cachedResponses.set(url, data)

		return data
	}

	/**
	 * @typedef {Object} DetectLang
	 * @property {Number} confidence
	 * @property {string} language
	 */
	/**
	 *  Detect the language of the Text
	 * @param {string} text
	 * @returns {Promise<DetectLang[]>} list of all language
	 */
	async detect(text = "") {
		if (text === "") {
			return [{ language: 'en', confidence: 0 }]
		}
		return this.call('detect', { q: text })
	}

	/**
	 * @typedef {Object} LangList
	 * @property {string} code
	 * @property {string} name
	 * @property {string[]} targets
	 */
	/**
	 * Gets the list of Languages
	 * @returns {Promise<LangList[]>}  List of Languages
	 */
	async languages() {
		return this.callCache('languages')
	}

	/**
	 * @typedef {Object} TranslatorSettings 
	 * @property {boolean} apiKeys
	 * @property {Number} charLimit
	 * @property {Number} frontendTimeout
	 * @property {boolean} keyRequired
	 * @property {Object} language
	 * @property {boolean} suggestions
	 * @property {string[]} supportedsupportedFilesFormat
	 */
	/**
	 * Get the settings for the frontend
	 * @returns {Promise<TranslatorSettings>} The list of settings 
	 */
	async settings() {
		return this.callCache('/frontend/settings')
	}

	/**
	 * Transtale the Text
	 * @param {string} text Input Text
	 * @param {string} source Source Language
	 * @param {string} target Target Language
	 * @returns {Promise<string>} Translated Text
	 */
	async translate(text = "", source, target) {
		if (text === "") {
			return ""
		}
		const res = await this.call('translate', { q: text, source, target })
		return res.translatedText
	}
}
