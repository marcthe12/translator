//@ts-check

import Translate from './Translate.js'
import { debounce } from './index.js'

/**
 * Create The menubar
 * @returns {HTMLMenuElement}
 */
export function createMenu() {
	const header = document.createElement('header')
	document.body.append(header)

	const menu = document.createElement('menu')
	header.append(menu)
	menu.role = 'menubar'
	return menu
}
/**
 * @param {HTMLMenuElement} menu
 * @param {Translate} translate
 * @returns {Promise<{source: HTMLSelectElement, target: HTMLSelectElement}>}
 */
export async function createDropDown(menu, translate) {
	const source = createSourceElement(menu)
	const target = createTargetElement(menu)

	const langlist = await translate.languages()

	langlist.forEach((element) => {
		addSelectionOpt(source, element.code, element.name)
		addSelectionOpt(target, element.code, element.name)
	})

	const { language } = await translate.settings()
	source.value = language.source.code
	target.value = language.target.code

	const setup = async () => {
		const langList = await translate.languages()
		const src = source.value
		const targetList = langList.find(obj => obj.code === src)?.targets ?? []
		Array.from(target.options).forEach(element => {
			element.disabled = !targetList.includes(element.value)
		})
	}

	source.addEventListener("change", setup)
	setup()
	return { source, target }
}
/**
 * @param {HTMLSelectElement} source
 * @param {string} value
 * @param {string} text
 */
function addSelectionOpt(source, value, text = value) {
	const opt = document.createElement("option")
	opt.textContent = text
	opt.value = value
	source.add(opt)
}

/**
 * Create the translator boxes
 * @param {Translate} translate
 * @param {HTMLSelectElement} sourceSelect
 * @param {HTMLSelectElement} targetSelect
 */
export async function createEditorWidget(translate, sourceSelect, targetSelect) {
	const input = document.createElement('pre')
	document.body.appendChild(input)
	input.id = 'editor'
	input.contentEditable = "true"

	const output = document.createElement('pre')
	document.body.appendChild(output)
	output.id = 'output'

	const translateHandler = debounce(async () => {
		output.textContent = await translate.translate(
			input.textContent ?? "",
			sourceSelect.value,
			targetSelect.value
		)
	}, (await translate.settings()).frontendTimeout)

	sourceSelect.addEventListener("change", translateHandler)
	targetSelect.addEventListener("change", translateHandler)
	input.addEventListener("input", translateHandler)

	const sourceLang = () => input.lang = sourceSelect.value
	sourceLang()
	sourceSelect.addEventListener("change", sourceLang)

	const targetLang = () => output.lang = targetSelect.value
	targetLang()
	sourceSelect.addEventListener("change", targetLang)
}
/**
 * @param {HTMLMenuElement} menu
 * @returns {HTMLSelectElement}
 */
function createTargetElement(menu) {
	const menuItem = createMenuItem(menu)
	const { label, select } = createLabeledSelect('target', 'Translate Into: ')
	menuItem.append(label, select)
	return select
}
/**
 * @param {HTMLMenuElement} menu
 */
function createSourceElement(menu) {
	const menuItem = createMenuItem(menu)
	const { label, select } = createLabeledSelect('source', 'TranslateFrom: ')
	menuItem.append(label, select)
	addSelectionOpt(select, "auto", "Auto Detectiom")
	return select
}
/**
 * @param {string} id
 * @param {string} label
 * @returns {{label: HTMLLabelElement, select: HTMLSelectElement}}
 */
function createLabeledSelect(id, label) {
	const labelElement = document.createElement('label')
	labelElement.htmlFor = id
	labelElement.textContent = label
	const select = document.createElement('select')
	select.id = id
	return { label: labelElement, select }
}
/**
 * @param {HTMLMenuElement} menu The menubar
 * @returns {HTMLLIElement}
 */
function createMenuItem(menu) {
	const menuItem = document.createElement('li')
	menu.append(menuItem)
	menuItem.role = 'menuitem'
	return menuItem
}
